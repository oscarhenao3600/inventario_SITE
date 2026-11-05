const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const allCarros = await col.find({ dispositivo: 'Carro Cargador de Tabletas' }).toArray();
  const allPantallas = await col.find({ dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const allTe = await col.find({ dispositivo: 'Tablet Para Estudiantes' }).toArray();

  const panMap = {};
  for (const p of allPantallas) {
    const k = `${(p.institucion||'').trim().toUpperCase()}|||${(p.sede||'').trim().toUpperCase()}|||${(p.aula||'').trim().toUpperCase()}`;
    panMap[k] = p;
  }

  const teMap = {};
  for (const t of allTe) {
    const k = `${(t.institucion||'').trim().toUpperCase()}|||${(t.sede||'').trim().toUpperCase()}|||${(t.aula||'').trim().toUpperCase()}`;
    if (!teMap[k]) teMap[k] = { '2022-006': 0, '2024-001': 0, '2025-001': 0, total: 0 };
    teMap[k][t.convenio] = (teMap[k][t.convenio] || 0) + 1;
    teMap[k].total++;
  }

  // Count if Carros inherit from Pantalla in same aula
  const simulatedCarros = [];
  let matchingAulaPan = 0;
  let noAulaPan = 0;

  for (const car of allCarros) {
    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    const pan = panMap[k];
    const te = teMap[k];

    let newConv = car.convenio;
    let rule = 'keep';

    if (pan) {
      matchingAulaPan++;
      newConv = pan.convenio;
      rule = 'inherit_pantalla';
    } else if (te && te.total > 0) {
      // Inherit from majority TE
      const bestConv = Object.entries(te).filter(([c]) => c !== 'total').sort((a,b) => b[1] - a[1])[0][0];
      newConv = bestConv;
      rule = 'inherit_tablets';
    } else {
      noAulaPan++;
      rule = 'no_match_aula';
    }

    simulatedCarros.push({
      ...car,
      simConv: newConv,
      rule,
      teTotal: te ? te.total : 0
    });
  }

  console.log(`Carros que encuentran Pantalla en la misma aula: ${matchingAulaPan}`);
  console.log(`Carros sin Pantalla en la misma aula: ${noAulaPan}`);

  // Summary by simConv
  const simTotals = {};
  for (const sc of simulatedCarros) {
    simTotals[sc.simConv] = (simTotals[sc.simConv] || 0) + 1;
  }
  console.log('\nTotales de Carros si heredan de Pantalla de Aula:', simTotals);

  // Group by institution for 2022-006 and 2024-001
  const insts = (await col.distinct('institucion')).filter(Boolean).sort();
  const table = [];
  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    
    const sc22 = simulatedCarros.filter(c => c.institucion === inst && c.simConv === '2022-006').length;
    const sc24 = simulatedCarros.filter(c => c.institucion === inst && c.simConv === '2024-001').length;
    const sc25 = simulatedCarros.filter(c => c.institucion === inst && c.simConv === '2025-001').length;

    table.push({
      Institucion: inst,
      P_22: p22,
      Car_22_Sim: sc22,
      Diff_22: sc22 - p22,
      P_24: p24,
      Car_24_Sim: sc24,
      Diff_24: sc24 - p24
    });
  }

  console.log('\n=== COMPARACIÓN POR INSTITUCIÓN TRAS HEREDAR CONVENIO DE AULA ===');
  console.table(table);

  // Detail of carts with rule 'no_match_aula'
  console.log('\n=== CARROS SIN PANTALLA EN EL AULA (no_match_aula) ===');
  const noMatch = simulatedCarros.filter(c => c.rule === 'no_match_aula');
  console.table(noMatch.map(c => ({
    placa: c.placa,
    serial: c.serial,
    inst: c.institucion,
    sede: c.sede,
    aula: c.aula,
    actualConv: c.convenio,
    notas: c.notas
  })));

  await c.close();
}

run().catch(console.error);

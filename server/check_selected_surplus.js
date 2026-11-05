const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  // Let's run the exact selection and inspect the 39 carts
  const allCarros = (await col.find({
    dispositivo: 'Carro Cargador de Tabletas'
  }).toArray()).map(d => ({ ...d }));

  const allScreens = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();

  const allTe = await col.find({
    dispositivo: 'Tablet Para Estudiantes'
  }).toArray();

  const teMap = {};
  for (const t of allTe) {
    const k = `${(t.institucion||'').trim().toUpperCase()}|||${(t.sede||'').trim().toUpperCase()}|||${(t.aula||'').trim().toUpperCase()}`;
    teMap[k] = (teMap[k] || 0) + 1;
  }

  const sobrantes2022 = ['46566', '22639'];

  const screenByAula = {};
  for (const s of allScreens) {
    const k = `${(s.institucion||'').trim().toUpperCase()}|||${(s.sede||'').trim().toUpperCase()}|||${(s.aula||'').trim().toUpperCase()}`;
    if (!screenByAula[k]) screenByAula[k] = [];
    screenByAula[k].push(s);
  }

  for (const car of allCarros) {
    if (sobrantes2022.includes(car.placa)) continue;
    if (car.convenio !== '2022-006' && car.convenio !== '2024-001') continue;

    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    const screens = screenByAula[k];
    if (screens && screens.length > 0) {
      const scrConv = screens[0].convenio;
      if ((scrConv === '2022-006' || scrConv === '2024-001') && car.convenio !== scrConv) {
        car.convenio = scrConv;
      }
    }
  }

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();
  const surplusCarts = [];

  for (const inst of insts) {
    const p22 = allScreens.filter(s => s.institucion === inst && s.convenio === '2022-006').length;
    const p24 = allScreens.filter(s => s.institucion === inst && s.convenio === '2024-001').length;
    const targetTot = p22 + p24;

    let allowedSurplus = 0;
    if (inst === 'CIUDADELA DEL SUR') allowedSurplus = 1;
    if (inst === 'CRISTOBAL COLON') allowedSurplus = 1;

    const instCarts = allCarros.filter(c => c.institucion === inst && (c.convenio === '2022-006' || c.convenio === '2024-001') && !sobrantes2022.includes(c.placa));
    const currentTot = instCarts.length + (inst === 'CIUDADELA DEL SUR' ? 1 : 0) + (inst === 'CRISTOBAL COLON' ? 1 : 0);
    const netExcess = currentTot - (targetTot + allowedSurplus);

    if (netExcess > 0) {
      instCarts.sort((a, b) => {
        const ka = `${(a.institucion||'').trim().toUpperCase()}|||${(a.sede||'').trim().toUpperCase()}|||${(a.aula||'').trim().toUpperCase()}`;
        const kb = `${(b.institucion||'').trim().toUpperCase()}|||${(b.sede||'').trim().toUpperCase()}|||${(b.aula||'').trim().toUpperCase()}`;
        const tea = teMap[ka] || 0;
        const teb = teMap[kb] || 0;
        if (tea === 0 && teb > 0) return -1;
        if (tea > 0 && teb === 0) return 1;

        const aRec = a.aula.toUpperCase().includes('RECTOR');
        const bRec = b.aula.toUpperCase().includes('RECTOR');
        if (aRec && !bRec) return -1;
        if (!aRec && bRec) return 1;

        const aScreen = (screenByAula[ka] || []).length;
        const bScreen = (screenByAula[kb] || []).length;
        if (aScreen === 0 && bScreen > 0) return -1;
        if (aScreen > 0 && bScreen === 0) return 1;

        return 0;
      });

      const chosen = instCarts.slice(0, netExcess);
      for (const ch of chosen) {
        const k = `${(ch.institucion||'').trim().toUpperCase()}|||${(ch.sede||'').trim().toUpperCase()}|||${(ch.aula||'').trim().toUpperCase()}`;
        surplusCarts.push({
          placa: ch.placa,
          serial: ch.serial,
          origen_inst: ch.institucion,
          origen_sede: ch.sede,
          origen_aula: ch.aula,
          conv_actual: ch.convenio,
          te_en_aula: teMap[k] || 0,
          pantallas_en_aula: (screenByAula[k] || []).map(s => s.convenio).join(',')
        });
      }
    }
  }

  console.log(`=== DETALLE DE LOS ${surplusCarts.length} CARROS SELECCIONADOS COMO EXCEDENTES ===`);
  console.table(surplusCarts);

  const countWithTe = surplusCarts.filter(c => c.te_en_aula > 0).length;
  console.log(`Carros con tablets de estudiantes en el aula de origen: ${countWithTe}`);

  await c.close();
}

run().catch(console.error);

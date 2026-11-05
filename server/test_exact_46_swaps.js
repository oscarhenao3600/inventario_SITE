const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const rawCarros = await col.find({
    convenio: { $in: ['2022-006', '2024-001'] },
    dispositivo: 'Carro Cargador de Tabletas'
  }).toArray();
  const carros = rawCarros.map(d => ({ ...d }));

  const pantallas = await col.find({
    convenio: { $in: ['2022-006', '2024-001'] },
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

  // Las dos sobrantes fijas en 2022-006
  const sobrantes2022 = ['46566', '22639'];

  const screenByAula = {};
  for (const s of pantallas) {
    const k = `${(s.institucion||'').trim().toUpperCase()}|||${(s.sede||'').trim().toUpperCase()}|||${(s.aula||'').trim().toUpperCase()}`;
    screenByAula[k] = s;
  }

  // 1. Movimientos internos entre sedes (misma institución)
  const adielaCart = carros.find(c => c.institucion === 'LA ADIELA' && c.sede === 'LA ADIELA' && c.convenio === '2022-006' && !teMap[`LA ADIELA|||LA ADIELA|||${c.aula.toUpperCase()}`]);
  if (adielaCart) {
    adielaCart.sede = 'LA CECILIA';
    adielaCart.aula = 'RECTORIA';
  }

  const rufinoSurCart = carros.find(c => c.institucion === 'RUFINO JOSÉ CUERVO SUR' && c.sede === 'MADRE MARCELINA' && c.convenio === '2022-006');
  if (rufinoSurCart) {
    rufinoSurCart.sede = 'RUFINO JOSÉ CUERVO SUR';
    rufinoSurCart.aula = 'RECTORIA';
  }

  const galanCarts = carros.filter(c => c.institucion === 'TERESITA MONTES' && c.sede === 'LUIS CARLOS GALAN').slice(0, 2);
  for (const gc of galanCarts) {
    gc.sede = 'TERESITA MONTES';
    gc.aula = 'RECTORIA';
  }

  // 2. SELECCIÓN 46 CARROS 24->22
  const nsCarts = carros.filter(c => c.institucion === 'NORMAL SUPERIOR' && c.convenio === '2024-001' && screenByAula[`NORMAL SUPERIOR|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2022-006').slice(0, 18);
  const rcCarts = carros.filter(c => c.institucion === 'RUFINO CENTRO' && c.convenio === '2024-001' && screenByAula[`RUFINO CENTRO|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2022-006').slice(0, 12);
  const tmCarts = carros.filter(c => c.institucion === 'TERESITA MONTES' && c.convenio === '2024-001').slice(0, 9);
  const ecCarts = carros.filter(c => c.institucion === 'EL CAIMO' && c.convenio === '2024-001' && screenByAula[`EL CAIMO|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2022-006').slice(0, 4);
  const coCarts = carros.filter(c => c.institucion === 'CIUDADELA DE OCCIDENTE' && c.convenio === '2024-001' && screenByAula[`CIUDADELA DE OCCIDENTE|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2022-006').slice(0, 3);

  const list24to22 = [...nsCarts, ...rcCarts, ...tmCarts, ...ecCarts, ...coCarts];
  for (const car of list24to22) car.convenio = '2022-006';

  // 3. SELECCIÓN 46 CARROS 22->24
  // Ciudadela del Sur: 25 en aulas 2024 + 5 adicionales = 30 carros
  const csCarts24 = carros.filter(c => c.institucion === 'CIUDADELA DEL SUR' && c.convenio === '2022-006' && !sobrantes2022.includes(c.placa) && screenByAula[`CIUDADELA DEL SUR|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2024-001');
  const csCartsExtra = carros.filter(c => c.institucion === 'CIUDADELA DEL SUR' && c.convenio === '2022-006' && !sobrantes2022.includes(c.placa) && !csCarts24.some(x => x.placa === c.placa) && (c.aula === 'AULA 4' || c.aula === 'AULA 22' || c.aula === 'AULA 1- TRASICION' || c.aula === 'AULA 5-GRADO 5' || c.aula === 'AULA 21')).slice(0, 5);
  const csCarts = [...csCarts24, ...csCartsExtra];

  // CASD: 5 carros
  const casdCarts = carros.filter(c => c.institucion === 'CASD' && c.convenio === '2022-006').slice(0, 5);

  // Santa Teresa de Jesús: 4 carros (3 con TE=0 + 1)
  const stCarts = carros.filter(c => c.institucion === 'SANTA TERESA DE JESUS' && c.convenio === '2022-006' && (c.aula === 'RECTORIA' || c.aula === 'AULA 27' || c.aula === 'AULA 30' || c.aula === 'AULA 28')).slice(0, 4);

  // Camara Junior: 3 carros (aulas con pantalla 2024)
  const cjCarts = carros.filter(c => c.institucion === 'CAMARA JUNIOR' && c.convenio === '2022-006' && screenByAula[`CAMARA JUNIOR|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2024-001').slice(0, 3);

  // Bosques de Pinares: 2 carros
  const bpCarts = carros.filter(c => c.institucion === 'BOSQUES DE PINARES' && c.convenio === '2022-006').slice(0, 2);

  // Camilo Torres: 1 carro (Placa 42442 en Aula 3)
  const ctCarts = carros.filter(c => c.institucion === 'CAMILO TORRES' && c.convenio === '2022-006' && (c.placa === '42442' || screenByAula[`CAMILO TORRES|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2024-001')).slice(0, 1);

  // Laura Vicuña: 1 carro
  const lvCarts = carros.filter(c => c.institucion === 'LAURA VICUÑA' && c.convenio === '2022-006' && screenByAula[`LAURA VICUÑA|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2024-001').slice(0, 1);

  // Ciudad Dorada: 1 carro (RECTORIA)
  const cdCarts = carros.filter(c => c.institucion === 'CIUDAD DORADA' && c.convenio === '2022-006' && c.aula.toUpperCase().includes('RECTOR')).slice(0, 1);

  const list22to24 = [...csCarts, ...casdCarts, ...stCarts, ...cjCarts, ...bpCarts, ...ctCarts, ...lvCarts, ...cdCarts];
  for (const car of list22to24) car.convenio = '2024-001';

  console.log(`Carros 24->22 aplicados: ${list24to22.length}`);
  console.log(`Carros 22->24 aplicados: ${list22to24.length}`);

  // Auditoria
  const insts = (await col.distinct('institucion')).filter(Boolean).sort();
  const summary = [];

  for (const inst of insts) {
    const p22 = pantallas.filter(s => s.institucion === inst && s.convenio === '2022-006').length;
    const p24 = pantallas.filter(s => s.institucion === inst && s.convenio === '2024-001').length;
    const c22 = carros.filter(c => c.institucion === inst && c.convenio === '2022-006').length;
    const c24 = carros.filter(c => c.institucion === inst && c.convenio === '2024-001').length;

    let exp22 = p22;
    if (inst === 'CIUDADELA DEL SUR') exp22 += 1;
    if (inst === 'CRISTOBAL COLON') exp22 += 1;

    const diff22 = c22 - exp22;
    const diff24 = c24 - p24;

    summary.push({
      Institucion: inst,
      P22: p22, C22: c22, Diff22: diff22 === 0 ? '0 (OK)' : (diff22 > 0 ? `+${diff22}` : `${diff22}`),
      P24: p24, C24: c24, Diff24: diff24 === 0 ? '0 (OK)' : (diff24 > 0 ? `+${diff24}` : `${diff24}`)
    });
  }

  console.table(summary);

  const totC22 = carros.filter(c => c.convenio === '2022-006').length;
  const totC24 = carros.filter(c => c.convenio === '2024-001').length;
  const totP22 = pantallas.filter(s => s.convenio === '2022-006').length;
  const totP24 = pantallas.filter(s => s.convenio === '2024-001').length;

  console.log('\n=== TOTALES GLOBALES TRAS SWAPS EQUILIBRADOS ===');
  console.log(`Convenio 2022-006: Pantallas=${totP22}, Carros=${totC22} (Diferencia = ${totC22 - totP22} sobrantes)`);
  console.log(`Convenio 2024-001: Pantallas=${totP24}, Carros=${totC24} (Diferencia = ${totC24 - totP24})`);

  console.log('\n=== VERIFICACIÓN DE LAS 2 SOBRANTES DE 2022-006 ===');
  for (const p of sobrantes2022) {
    const car = carros.find(c => c.placa === p);
    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    console.log(`Placa: ${car.placa}, Inst: ${car.institucion}, Sede: ${car.sede}, Aula: ${car.aula}, Conv: ${car.convenio}, TE en aula: ${teMap[k] || 0}`);
  }

  await c.close();
}

run().catch(console.error);

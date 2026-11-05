const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const allCarros = await col.find({
    convenio: { $in: ['2022-006', '2024-001'] },
    dispositivo: 'Carro Cargador de Tabletas'
  }).toArray();

  const allScreens = await col.find({
    convenio: { $in: ['2022-006', '2024-001', '2025-001'] },
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();

  const allTe = await col.find({
    convenio: { $in: ['2022-006', '2024-001', '2025-001'] },
    dispositivo: 'Tablet Para Estudiantes'
  }).toArray();

  const screenMap = {};
  for (const s of allScreens) {
    const k = `${(s.institucion||'').trim().toUpperCase()}|||${(s.sede||'').trim().toUpperCase()}|||${(s.aula||'').trim().toUpperCase()}`;
    screenMap[k] = s;
  }

  const teMap = {};
  for (const t of allTe) {
    const k = `${(t.institucion||'').trim().toUpperCase()}|||${(t.sede||'').trim().toUpperCase()}|||${(t.aula||'').trim().toUpperCase()}`;
    if (!teMap[k]) teMap[k] = { '2022-006': 0, '2024-001': 0, '2025-001': 0, total: 0 };
    teMap[k][t.convenio] = (teMap[k][t.convenio] || 0) + 1;
    teMap[k].total++;
  }

  // 1. Carros cuya pantalla en la misma aula tiene convenio opuesto (22 vs 24)
  const cartWithOppositeScreen = [];
  for (const car of allCarros) {
    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    const s = screenMap[k];
    const te = teMap[k];

    if (s && (s.convenio === '2022-006' || s.convenio === '2024-001') && s.convenio !== car.convenio) {
      cartWithOppositeScreen.push({
        placa: car.placa,
        serial: car.serial,
        inst: car.institucion,
        sede: car.sede,
        aula: car.aula,
        cartConv: car.convenio,
        screenConv: s.convenio,
        teTotal: te ? te.total : 0,
        teConv: te ? Object.entries(te).filter(([k, v]) => k !== 'total' && v > 0).map(([k,v]) => `${k}:${v}`).join(',') : '',
        notas: car.notas
      });
    }
  }

  const instGroups = {};
  for (const c of cartWithOppositeScreen) {
    if (!instGroups[c.inst]) instGroups[c.inst] = { '22->24': 0, '24->22': 0 };
    if (c.cartConv === '2022-006' && c.screenConv === '2024-001') instGroups[c.inst]['22->24']++;
    if (c.cartConv === '2024-001' && c.screenConv === '2022-006') instGroups[c.inst]['24->22']++;
  }
  console.log('=== CARROS CON PANTALLA DE CONVENIO OPUESTO EN LA MISMA AULA ===');
  console.table(instGroups);

  // 2. Carros en aulas donde la pantalla es 2025-001 o no hay pantalla
  const otherCarts = [];
  for (const car of allCarros) {
    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    const s = screenMap[k];
    const te = teMap[k];

    if (!s || (s.convenio !== '2022-006' && s.convenio !== '2024-001')) {
      otherCarts.push({
        placa: car.placa,
        serial: car.serial,
        inst: car.institucion,
        sede: car.sede,
        aula: car.aula,
        cartConv: car.convenio,
        screenConv: s ? s.convenio : '(sin pantalla)',
        teTotal: te ? te.total : 0,
        notas: car.notas
      });
    }
  }
  console.log(`\nCarros en aulas sin pantalla 2022/2024: ${otherCarts.length}`);
  console.table(otherCarts.map(c => ({
    placa: c.placa,
    inst: c.inst,
    sede: c.sede,
    aula: c.aula,
    cartConv: c.cartConv,
    screenConv: c.screenConv,
    teTotal: c.teTotal,
    notas: c.notas
  })));

  await c.close();
}

run().catch(console.error);

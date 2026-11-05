const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  console.log('--- 1. TOTALES POR DISPOSITIVO Y CONVENIO ---');
  const res = await col.aggregate([
    { $match: { dispositivo: { $in: ['Pantalla Interactiva Táctil', 'Carro Cargador de Tabletas', 'Tablet Para Estudiantes', 'Tablet Para Docentes', 'Servidor Portable de Aula SITE Sistema Cloud', 'Soporte Electrónico Pantalla Interactiva Táctil'] } } },
    { $group: { _id: { d: '$dispositivo', c: '$convenio' }, count: { $sum: 1 } } },
    { $sort: { '_id.d': 1, '_id.c': 1 } }
  ]).toArray();
  console.table(res.map(r => ({ Dispositivo: r._id.d, Convenio: r._id.c, Cantidad: r.count })));

  console.log('\n--- 2. CARROS SIN TABLETS DE ESTUDIANTES EN AULA ---');
  const allCarros = await col.find({ dispositivo: 'Carro Cargador de Tabletas' }).toArray();
  const allTe = await col.find({ dispositivo: 'Tablet Para Estudiantes' }).toArray();
  const teMap = {};
  allTe.forEach(t => {
    const k = (t.institucion||'') + '|||' + (t.sede||'') + '|||' + (t.aula||'');
    teMap[k] = (teMap[k] || 0) + 1;
  });

  const sinTe = allCarros.filter(c => {
    const k = (c.institucion||'') + '|||' + (c.sede||'') + '|||' + (c.aula||'');
    return !teMap[k];
  });
  console.log('Total carros sin tablets de estudiantes:', sinTe.length);
  console.table(sinTe.map(c => ({
    placa: c.placa,
    serial: c.serial,
    inst: c.institucion,
    sede: c.sede,
    aula: c.aula,
    convenio: c.convenio
  })));

  console.log('\n--- 3. COMPARACIÓN CONVENIO 2022-006 Y 2024-001 ---');
  const convs = ['2022-006', '2024-001', '2025-001', 'SOBRANTE', ''];
  const summaryConv = [];
  for (const cv of convs) {
    const pan = await col.countDocuments({ convenio: cv, dispositivo: 'Pantalla Interactiva Táctil' });
    const car = await col.countDocuments({ convenio: cv, dispositivo: 'Carro Cargador de Tabletas' });
    summaryConv.push({ Convenio: cv || '(vacío)', Pantallas: pan, Carros: car, 'Diff(Carros - Pantallas)': car - pan });
  }
  console.table(summaryConv);

  await c.close();
}
run().catch(console.error);

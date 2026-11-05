const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();

  console.log('=== TABLETS DE ESTUDIANTES POR INSTITUCIÓN Y CONVENIO ===');
  const rows = [];
  for (const inst of insts) {
    const te22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Tablet Para Estudiantes' });
    const te24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Tablet Para Estudiantes' });
    const te25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Tablet Para Estudiantes' });
    const teTot = te22 + te24 + te25;

    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });

    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });

    rows.push({
      Institucion: inst,
      'P_22': p22,
      'C_22': c22,
      'TE_22': te22,
      'TE_22/30': (te22 / 30).toFixed(1),
      'P_24': p24,
      'C_24': c24,
      'TE_24': te24,
      'TE_24/30': (te24 / 30).toFixed(1)
    });
  }

  console.table(rows);
  await c.close();
}

run().catch(console.error);

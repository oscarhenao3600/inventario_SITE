const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();

  console.log('=== DISTRIBUCIÓN COMPLETA POR INSTITUCIÓN (TODOS LOS CONVENIOS) ===');
  const rows = [];

  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });
    const p25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Carro Cargador de Tabletas' });

    rows.push({
      Institucion: inst,
      P22: p22, C22: c22,
      P24: p24, C24: c24,
      P25: p25, C25: c25,
      P_Tot: p22 + p24 + p25,
      C_Tot: c22 + c24 + c25,
      Diff_Tot: (c22 + c24 + c25) - (p22 + p24 + p25)
    });
  }

  console.table(rows);

  await c.close();
}

run().catch(console.error);

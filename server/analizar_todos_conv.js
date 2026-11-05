const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();

  console.log('=== PANTALLAS Y CARROS: TODOS LOS CONVENIOS POR INSTITUCIÓN ===');
  const rows = [];
  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });
    const p25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Carro Cargador de Tabletas' });

    const pTot = p22 + p24 + p25;
    const cTot = c22 + c24 + c25;

    rows.push({
      Institucion: inst,
      'P_22': p22, 'C_22': c22,
      'P_24': p24, 'C_24': c24,
      'P_25': p25, 'C_25': c25,
      'P_Tot': pTot, 'C_Tot': cTot,
      'Diff_Tot(C-P)': cTot - pTot
    });
  }
  console.table(rows);

  await c.close();
}

run().catch(console.error);

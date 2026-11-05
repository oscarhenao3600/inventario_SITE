const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();

  console.log('=== ESTADO ACTUAL EN BASE DE DATOS (CONVENIOS 2022-006 Y 2024-001) ===');
  const rows = [];
  let totP22 = 0, totC22 = 0, totP24 = 0, totC24 = 0;

  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });

    totP22 += p22;
    totC22 += c22;
    totP24 += p24;
    totC24 += c24;

    rows.push({
      Institucion: inst,
      P_2022: p22,
      C_2022: c22,
      Diff_22: c22 - p22,
      P_2024: p24,
      C_2024: c24,
      Diff_24: c24 - p24,
      Tot_P: p22 + p24,
      Tot_C: c22 + c24,
      Tot_Diff: (c22 + c24) - (p22 + p24)
    });
  }

  console.table(rows);
  console.log({
    totP22, totC22, diff22: totC22 - totP22,
    totP24, totC24, diff24: totC24 - totP24,
    totP_both: totP22 + totP24,
    totC_both: totC22 + totC24,
    netDiff: (totC22 + totC24) - (totP22 + totP24)
  });

  await c.close();
}

run().catch(console.error);

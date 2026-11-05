const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();

  // Targets from Pantallas
  const targets = {};
  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });

    targets[inst] = {
      p22, c22, diff22: c22 - p22,
      p24, c24, diff24: c24 - p24,
      totP: p22 + p24,
      totC: c22 + c24,
      netDiff: (c22 + c24) - (p22 + p24)
    };
  }

  console.log('=== RESUMEN 2022-006 y 2024-001 POR INSTITUCION ===');
  console.table(Object.entries(targets).map(([inst, t]) => ({
    Institucion: inst,
    P_22: t.p22,
    C_22: t.c22,
    D_22: t.diff22,
    P_24: t.p24,
    C_24: t.c24,
    D_24: t.diff24,
    Sum_P: t.totP,
    Sum_C: t.totC,
    Net_D: t.netDiff
  })));

  await c.close();
}

run().catch(console.error);

const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();

  const data = [];
  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });

    // Carts available to swap in this institution:
    // If c22 > p22 and c24 < p24 -> can swap from 22 to 24
    // If c24 > p24 and c22 < p22 -> can swap from 24 to 22
    const need22to24 = Math.max(0, Math.min(c22 - p22, p24 - c24));
    const need24to22 = Math.max(0, Math.min(c24 - p24, p22 - c22));

    data.push({
      inst,
      P22: p22, C22: c22, Diff22: c22 - p22,
      P24: p24, C24: c24, Diff24: c24 - p24,
      need22to24,
      need24to22
    });
  }

  console.table(data);

  const totNeed22to24 = data.reduce((a, b) => a + b.need22to24, 0);
  const totNeed24to22 = data.reduce((a, b) => a + b.need24to22, 0);
  console.log(`Total potencial de swap directo equilibrado: 22->24: ${totNeed22to24}, 24->22: ${totNeed24to22}`);

  await c.close();
}

run().catch(console.error);

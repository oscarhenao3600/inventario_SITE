const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const insts = await col.distinct('institucion');
  insts.sort();

  console.log('=== PANTALLAS VS CARROS (2022-006 y 2024-001) POR INSTITUCIÓN ===');
  const rows = [];
  let totP22 = 0, totC22 = 0, totP24 = 0, totC24 = 0;

  for (const inst of insts) {
    if (!inst) continue;
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
      'Pan 2022': p22,
      'Car 2022': c22,
      'Dif 2022 (C-P)': c22 - p22,
      'Pan 2024': p24,
      'Car 2024': c24,
      'Dif 2024 (C-P)': c24 - p24,
      'Suma Carros (22+24)': c22 + c24,
      'Suma Pantallas (22+24)': p22 + p24,
      'Net Diff (22+24)': (c22 + c24) - (p22 + p24)
    });
  }

  console.table(rows);
  console.log(`TOTALES GLOBALES:`);
  console.log(`2022-006 -> Pantallas: ${totP22} | Carros: ${totC22} | Diferencia: ${totC22 - totP22}`);
  console.log(`2024-001 -> Pantallas: ${totP24} | Carros: ${totC24} | Diferencia: ${totC24 - totP24}`);
  console.log(`SUMA (22+24) -> Pantallas: ${totP22 + totP24} | Carros: ${totC22 + totC24} | Diferencia: ${(totC22 + totC24) - (totP22 + totP24)}`);

  await c.close();
}

run().catch(console.error);

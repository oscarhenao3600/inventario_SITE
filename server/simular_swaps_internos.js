const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();

  console.log('=== SIMULACIÓN: AJUSTE DE CONVENIO DENTRO DE CADA INSTITUCIÓN ===');
  
  // For each institution, see how many carts can change convenio 22 <-> 24
  // to bring C_2022 closer to P_2022 and C_2024 closer to P_2024
  const report = [];

  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });

    // Net carts available in 22+24
    const totP = p22 + p24;
    const totC = c22 + c24;

    // Ideal:
    // If we want C22 to match P22 as much as possible:
    // delta = P22 - C22 (if > 0, we need more 22, so convert 24 -> 22; if < 0, we have excess 22, convert 22 -> 24)
    let move24to22 = 0;
    let move22to24 = 0;

    if (c22 < p22) {
      // Need more 2022-006 carts. We can convert from c24 up to c24
      const needed = p22 - c22;
      move24to22 = Math.min(needed, c24);
    } else if (c24 < p24) {
      // Need more 2024-001 carts. We can convert from c22 up to (c22 - p22) or available
      const needed = p24 - c24;
      const canSpareFrom22 = Math.max(0, c22 - p22);
      move22to24 = Math.min(needed, canSpareFrom22);
    }

    const simC22 = c22 + move24to22 - move22to24;
    const simC24 = c24 - move24to22 + move22to24;

    report.push({
      Institucion: inst,
      P22: p22,
      C22_act: c22,
      C22_sim: simC22,
      Diff22: simC22 - p22,
      P24: p24,
      C24_act: c24,
      C24_sim: simC24,
      Diff24: simC24 - p24,
      Tot_P: totP,
      Tot_C: totC,
      Tot_Diff: totC - totP,
      Swap: move24to22 > 0 ? `24->22 (${move24to22})` : (move22to24 > 0 ? `22->24 (${move22to24})` : '-')
    });
  }

  console.table(report);

  const sumSim22 = report.reduce((a, b) => a + b.C22_sim, 0);
  const sumSim24 = report.reduce((a, b) => a + b.C24_sim, 0);
  console.log(`Totales simulados -> C22: ${sumSim22} (P22: 429, diff: ${sumSim22 - 429}), C24: ${sumSim24} (P24: 300, diff: ${sumSim24 - 300})`);

  await c.close();
}

run().catch(console.error);

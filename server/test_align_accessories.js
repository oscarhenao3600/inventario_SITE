const { MongoClient } = require('mongodb');

async function testAlignAccessories() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const all = await col.find({}).toArray();

  // Map of aula -> pantalla convenio
  const aulaScreenMap = new Map();
  const pantallas = all.filter(d => d.dispositivo === 'Pantalla Interactiva Táctil');
  
  for (const p of pantallas) {
    const key = `${p.institucion}__${p.sede}__${p.aula}`;
    if (!aulaScreenMap.has(key)) {
      aulaScreenMap.set(key, []);
    }
    aulaScreenMap.get(key).push(p.convenio);
  }

  // Count how many would change
  let changes = 0;
  const simTotals = {
    '2022-006': {},
    '2024-001': {},
    '2025-001': {},
    'SOBRANTE': {}
  };

  for (const d of all) {
    const key = `${d.institucion}__${d.sede}__${d.aula}`;
    let conv = d.convenio;

    if (d.dispositivo !== 'Pantalla Interactiva Táctil' && aulaScreenMap.has(key)) {
      const screenConvs = aulaScreenMap.get(key);
      if (screenConvs.length === 1 && screenConvs[0] !== conv) {
        // Aula has exactly 1 screen with a single convenio, and accessory is different
        // Don't change Mesas / Sillas which are predominantly 2025
        if (!d.dispositivo.includes('Mesa') && !d.dispositivo.includes('Silla')) {
          conv = screenConvs[0];
          changes++;
        }
      }
    }

    if (!simTotals[conv]) simTotals[conv] = {};
    simTotals[conv][d.dispositivo] = (simTotals[conv][d.dispositivo] || 0) + 1;
  }

  console.log(`Posibles accesorios a alinear al convenio de la pantalla del aula: ${changes}`);
  console.log("\n--- SIMULACIÓN DE TOTALES TRAS ALINEACIÓN ---");
  for (const [c, items] of Object.entries(simTotals)) {
    console.log(`\nConvenio ${c}:`);
    for (const [disp, cnt] of Object.entries(items)) {
      console.log(`  ${disp.padEnd(50)}: ${cnt}`);
    }
  }

  await client.close();
}

testAlignAccessories().catch(console.error);

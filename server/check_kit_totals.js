const { MongoClient } = require('mongodb');

async function checkKitTotals() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const convenios = ['2022-006', '2024-001', '2025-001', 'SOBRANTE'];

  for (const c of convenios) {
    console.log(`\n================ RESUMEN CONVENIO ${c} ================`);
    const r = await col.aggregate([
      { $match: { convenio: c } },
      { $group: { _id: '$dispositivo', count: { $sum: 1 } } }
    ]).toArray();
    r.sort((a, b) => b.count - a.count);
    r.forEach(item => {
      console.log(`  ${item._id.padEnd(50)}: ${item.count}`);
    });
  }

  await client.close();
}

checkKitTotals().catch(console.error);

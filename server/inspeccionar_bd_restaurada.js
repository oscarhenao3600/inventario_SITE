const { MongoClient } = require('mongodb');

async function inspectRestoredDB() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const total = await col.countDocuments({});
  console.log('Total registros en DB:', total);

  // Group by convenio and dispositivo
  const res = await col.aggregate([
    { $group: { _id: { conv: '$convenio', disp: '$dispositivo' }, count: { $sum: 1 } } }
  ]).toArray();

  const grouped = {};
  res.forEach(r => {
    const c = r._id.conv || 'SIN_CONVENIO';
    if (!grouped[c]) grouped[c] = {};
    grouped[c][r._id.disp] = r.count;
  });

  console.log('\n--- DISPOSITIVOS POR CONVENIO ---');
  for (const [conv, disps] of Object.entries(grouped)) {
    console.log(`\nConvenio: ${conv}`);
    for (const [d, cnt] of Object.entries(disps)) {
      console.log(`  ${d.padEnd(50)}: ${cnt}`);
    }
  }

  // Count pantallas per institucion and convenio
  console.log('\n--- PANTALLAS POR INSTITUCION Y CONVENIO ---');
  const instScreens = await col.aggregate([
    { $match: { dispositivo: 'Pantalla Interactiva Táctil' } },
    { $group: { _id: { inst: '$institucion', conv: '$convenio' }, count: { $sum: 1 } } },
    { $sort: { '_id.inst': 1, '_id.conv': 1 } }
  ]).toArray();

  const instMap = {};
  instScreens.forEach(r => {
    const inst = r._id.inst || 'SIN_INSTITUCION';
    const conv = r._id.conv || 'SIN_CONVENIO';
    if (!instMap[inst]) instMap[inst] = {};
    instMap[inst][conv] = r.count;
  });

  console.log(JSON.stringify(instMap, null, 2));

  await client.close();
}

inspectRestoredDB().catch(console.error);

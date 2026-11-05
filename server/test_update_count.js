const { MongoClient } = require('mongodb');

async function testUpdate() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const r1 = await col.updateMany({ institucion: 'ITI' }, { $set: { institucion: 'INSTITUTO TECNICO INDUSTRIAL' } });
  console.log('ITI institucion modified:', r1.modifiedCount);

  const r2 = await col.updateMany({ sede: 'ITI' }, { $set: { sede: 'INSTITUTO TECNICO INDUSTRIAL' } });
  console.log('ITI sede modified:', r2.modifiedCount);

  await client.close();
}

testUpdate().catch(console.error);

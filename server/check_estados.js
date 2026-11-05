const { MongoClient } = require('mongodb');

async function checkEstados() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const count = await col.countDocuments({ placa: /FALTANTE/i });
  console.log('Placas con FALTANTE:', count);

  const byEstado = await col.aggregate([{ $group: { _id: '$estado', count: { $sum: 1 } } }]).toArray();
  console.log('Estados:', byEstado);

  const total = await col.countDocuments();
  console.log('Total documentos:', total);

  await client.close();
}

checkEstados().catch(console.error);

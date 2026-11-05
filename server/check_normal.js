const { MongoClient } = require('mongodb');

async function checkNormal() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const docs = await col.find({
    institucion: 'NORMAL SUPERIOR',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();

  const byConv = {};
  for (const d of docs) {
    byConv[d.convenio] = (byConv[d.convenio] || 0) + 1;
  }
  console.log("NORMAL SUPERIOR Pantallas por convenio en BD restaurada:", byConv);

  await client.close();
}

checkNormal().catch(console.error);

const { MongoClient } = require('mongodb');

async function inspectCaimo() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const devs = await col.find({ institucion: 'EL CAIMO', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  devs.forEach(d => console.log(`conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  await client.close();
}

inspectCaimo().catch(console.error);

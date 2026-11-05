const { MongoClient } = require('mongodb');

async function checkBibliotecaST() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const devs = await col.find({
    institucion: 'SANTA TERESA DE JESUS',
    aula: 'BIBLIOTECA'
  }).toArray();

  devs.forEach(d => console.log(`conv:${d.convenio} | sede:${d.sede} | disp:${d.dispositivo} | placa:${d.placa} | serial:${d.serial}`));

  await client.close();
}

checkBibliotecaST().catch(console.error);

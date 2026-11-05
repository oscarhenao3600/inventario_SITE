const { MongoClient } = require('mongodb');

async function checkSobrantes() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const sobrantes = await col.find({ convenio: 'SOBRANTE', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log("Sobrantes actuales:", sobrantes.map(s => ({ inst: s.institucion, sede: s.sede, aula: s.aula, placa: s.placa, serial: s.serial })));

  await client.close();
}

checkSobrantes().catch(console.error);

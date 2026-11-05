const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const cj = await col.find({
    institucion: /CAMARA JUNIOR/i,
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();

  console.log('=== PANTALLAS EN CAMARA JUNIOR ===');
  for (const d of cj) {
    console.log(`Sede: ${d.sede.padEnd(20)} | Aula: ${d.aula.padEnd(20)} | Conv: ${d.convenio.padEnd(10)} | Placa: ${d.placa.padEnd(8)} | Serial: ${d.serial || ''} | Notas: ${d.notas || ''}`);
  }

  await client.close();
}

main();

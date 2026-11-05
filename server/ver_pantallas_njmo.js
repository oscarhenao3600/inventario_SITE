const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const njmoScreens = await col.find({
    institucion: /OCAMPO/i,
    dispositivo: 'Pantalla Interactiva Táctil',
    convenio: '2022-006'
  }).toArray();

  console.log('=== PANTALLAS EN NJMO 2022-006 ===');
  for (const s of njmoScreens) {
    console.log(`Placa: ${s.placa.padEnd(8)} | Serial: ${String(s.serial).padEnd(18)} | Sede: ${s.sede.padEnd(25)} | Aula: ${s.aula.padEnd(18)} | Notas: ${s.notas || ''}`);
  }

  await client.close();
}

main();

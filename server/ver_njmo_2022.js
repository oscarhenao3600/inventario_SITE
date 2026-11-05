const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const docs = await col.find({
    institucion: /OCAMPO/i,
    convenio: '2022-006'
  }).toArray();

  console.log('=== TODOS LOS DISPOSITIVOS 2022-006 EN NJMO ===');
  for (const d of docs) {
    console.log(`Aula: ${d.aula.padEnd(20)} | Disp: ${d.dispositivo.padEnd(45)} | Placa: ${String(d.placa).padEnd(10)} | Serial: ${d.serial || ''} | Notas: ${d.notas || ''}`);
  }

  await client.close();
}

main();

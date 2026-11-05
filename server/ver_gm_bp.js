const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  for (const instPattern of ['GUSTAVO MATAMOROS', 'BOSQUES DE PINARES']) {
    console.log(`\n=== ${instPattern} ===`);
    const docs = await col.find({
      institucion: new RegExp(instPattern, 'i'),
      dispositivo: 'Pantalla Interactiva Táctil'
    }).toArray();
    for (const d of docs) {
      console.log(`Sede: ${d.sede.padEnd(25)} | Aula: ${d.aula.padEnd(20)} | Conv: ${d.convenio.padEnd(10)} | Placa: ${d.placa} | Serial: ${d.serial || ''}`);
    }
  }

  await client.close();
}

main();

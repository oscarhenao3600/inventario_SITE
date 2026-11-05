const { MongoClient } = require('mongodb');

async function checkNormalRooms() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const docs = await col.find({
    institucion: 'NORMAL SUPERIOR',
    convenio: '2022-006',
    dispositivo: { $in: ['Pantalla Interactiva Táctil', 'Servidor Portable de Aula SITE Sistema Cloud', 'Soporte Electrónico Pantalla Interactiva Táctil'] }
  }).toArray();

  const rooms = {};
  for (const d of docs) {
    const k = `${d.sede} __ ${d.aula}`;
    if (!rooms[k]) rooms[k] = [];
    rooms[k].push(`${d.dispositivo} (Placa: ${d.placa})`);
  }

  for (const [k, v] of Object.entries(rooms)) {
    console.log(`${k}: ${v.length} items`);
    v.forEach(i => console.log(`   ${i}`));
  }

  await client.close();
}

checkNormalRooms().catch(console.error);

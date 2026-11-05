const { MongoClient } = require('mongodb');

async function checkMadreAndRufino() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log("=== DISPOSITIVOS CON PLACA 40066 ===");
  const d40066 = await col.find({ placa: '40066' }).toArray();
  console.log(d40066);

  console.log("=== AULAS EN MADRE MARCELINA (2022-006) ===");
  const aulasMM = await col.distinct('aula', { institucion: 'MADRE MARCELINA', convenio: '2022-006' });
  console.log("Aulas en MM 2022:", aulasMM);

  for (const a of aulasMM) {
    const devs = await col.find({ institucion: 'MADRE MARCELINA', aula: a }).toArray();
    const types = {};
    devs.forEach(d => types[d.dispositivo] = (types[d.dispositivo] || 0) + 1);
    console.log(`Aula: ${a.padEnd(20)} =>`, types);
  }

  // Check if there is an aula in Madre Marcelina in 2022 that doesn't have a screen
  const mmAll2022 = await col.find({
    $or: [{ institucion: 'MADRE MARCELINA' }, { sede: 'MADRE MARCELINA' }],
    convenio: '2022-006'
  }).toArray();
  const mmAllAulas = [...new Set(mmAll2022.map(d => d.aula))];
  console.log("Todas las aulas de MM en 2022-006:", mmAllAulas);
  mmAllAulas.forEach(a => {
    const items = mmAll2022.filter(d => d.aula === a);
    const hasScreen = items.some(d => d.dispositivo === 'Pantalla Interactiva Táctil');
    console.log(`  Aula: ${a.padEnd(20)} | items: ${items.length} | Has screen: ${hasScreen}`);
  });

  await client.close();
}

checkMadreAndRufino().catch(console.error);

const { MongoClient } = require('mongodb');

async function countRufinoAll() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const all = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    $or: [{ institucion: /RUFINO.*SUR/i }, { sede: 'MADRE MARCELINA' }]
  }).toArray();

  console.log(`Total pantallas en Rufino Sur o Madre Marcelina: ${all.length}`);
  const g = {};
  all.forEach(d => {
    const k = `${d.convenio} | ${d.institucion} | ${d.sede}`;
    g[k] = (g[k] || 0) + 1;
  });
  console.log(g);

  // Targets:
  // 2022-006: Madre Marcelina = 10
  // 2025-001: Rufino Sur / Madre Marcelina = 15
  // 2025-001: Rufino Sur / Rufino Sur = 31
  // Total targets = 10 + 15 + 31 = 56!
  // How many exist? Let's check!
  console.log("Suma total de pantallas existentes:", all.length);

  await client.close();
}

countRufinoAll().catch(console.error);

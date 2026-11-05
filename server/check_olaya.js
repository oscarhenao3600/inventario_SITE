const { MongoClient } = require('mongodb');

async function checkOlaya() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const devs = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    institucion: /ENRIQUE OLAYA/i
  }).toArray();

  console.log("Pantallas en Enrique Olaya Herrera:");
  devs.forEach(d => console.log(`conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  // Check targets for Olaya:
  // 2022-006: ENRIQUE OLAYA HERRERA: 5, GABRIELA MISTRAL: 3
  // 2024-001: ENRIQUE OLAYA HERRERA: 1, GABRIELA MISTRAL: 8
  // 2025-001: ENRIQUE OLAYA HERRERA: 1, GABRIELA MISTRAL: 0
  const g = {};
  devs.forEach(d => {
    const k = `${d.convenio} | ${d.sede}`;
    g[k] = (g[k] || 0) + 1;
  });
  console.log("Conteos actuales en Olaya:", g);

  await client.close();
}

checkOlaya().catch(console.error);

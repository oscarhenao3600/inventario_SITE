const { MongoClient } = require('mongodb');

async function inspectSpecialCases() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log("=== NACIONAL JESUS MARIA OCAMPO EN 2022-006 ===");
  const njmo = await col.find({
    institucion: 'NACIONAL JESUS MARIA OCAMPO',
    convenio: '2022-006',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();
  njmo.forEach(d => console.log(`sede: ${d.sede} | aula: ${d.aula} | placa: ${d.placa} | serial: ${d.serial}`));

  console.log("\n=== GUSTAVO MATAMOROS D´COSTA ===");
  const gm = await col.find({
    institucion: 'GUSTAVO MATAMOROS D´COSTA',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();
  gm.forEach(d => console.log(`conv: ${d.convenio} | sede: ${d.sede} | aula: ${d.aula} | placa: ${d.placa} | serial: ${d.serial}`));

  console.log("\n=== EL CAIMO ===");
  const caimo = await col.find({
    institucion: 'EL CAIMO',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();
  const cCounts = {};
  caimo.forEach(d => {
    const k = `${d.convenio} | ${d.sede}`;
    cCounts[k] = (cCounts[k] || 0) + 1;
  });
  console.log("Caimo conteos:", cCounts);

  console.log("\n=== ENRIQUE OLAYA HERRERA ===");
  const olaya = await col.find({
    institucion: 'ENRIQUE OLAYA HERRERA',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();
  const oCounts = {};
  olaya.forEach(d => {
    const k = `${d.convenio} | ${d.sede}`;
    oCounts[k] = (oCounts[k] || 0) + 1;
  });
  console.log("Olaya conteos:", oCounts);

  console.log("\n=== CAMARA JUNIOR ===");
  const cj = await col.find({
    institucion: 'CAMARA JUNIOR',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();
  const cjCounts = {};
  cj.forEach(d => {
    const k = `${d.convenio} | ${d.sede}`;
    cjCounts[k] = (cjCounts[k] || 0) + 1;
  });
  console.log("Camara Junior conteos:", cjCounts);

  await client.close();
}

inspectSpecialCases().catch(console.error);

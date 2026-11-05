const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  console.log('=== 1. NACIONAL JESUS MARIA OCAMPO con convenio 2022-006 ===');
  const njmo2022 = await col.find({
    institucion: /OCAMPO/i,
    convenio: '2022-006'
  }).toArray();
  console.log(`Total dispositivos 2022 en NJMO: ${njmo2022.length}`);
  const njmoSummary = {};
  for (const d of njmo2022) {
    const k = `${d.sede} - ${d.aula} - ${d.dispositivo}`;
    njmoSummary[k] = (njmoSummary[k] || 0) + 1;
  }
  console.log(njmoSummary);

  console.log('\n=== 2. GUSTAVO MATAMOROS D COSTA con convenio 2022-006 ===');
  const gm2022 = await col.find({
    institucion: /MATAMOROS/i,
    convenio: '2022-006'
  }).toArray();
  console.log(`Total dispositivos 2022 en Gustavo Matamoros: ${gm2022.length}`);
  const gmSummary = {};
  for (const d of gm2022) {
    const k = `${d.sede} - ${d.aula} - ${d.dispositivo}`;
    gmSummary[k] = (gmSummary[k] || 0) + 1;
  }
  console.log(gmSummary);

  console.log('\n=== 3. CAMARA JUNIOR con convenio 2022-006 ===');
  const cj2022 = await col.find({
    institucion: /CAMARA JUNIOR/i,
    convenio: '2022-006'
  }).toArray();
  console.log(`Total dispositivos 2022 en Camara Junior: ${cj2022.length}`);
  const cjSummary = {};
  for (const d of cj2022) {
    const k = `${d.sede} - ${d.aula} - ${d.dispositivo}`;
    cjSummary[k] = (cjSummary[k] || 0) + 1;
  }
  console.log(cjSummary);

  console.log('\n=== 4. CIUDADELA DEL SUR con convenio 2022-006 ===');
  const cs2022 = await col.find({
    institucion: /CIUDADELA DEL SUR/i,
    convenio: '2022-006'
  }).toArray();
  console.log(`Total dispositivos 2022 en Ciudadela del Sur: ${cs2022.length}`);
  const csSummary = {};
  for (const d of cs2022) {
    const k = `${d.sede} - ${d.aula} - ${d.dispositivo}`;
    csSummary[k] = (csSummary[k] || 0) + 1;
  }
  console.log(csSummary);

  await client.close();
}

main();

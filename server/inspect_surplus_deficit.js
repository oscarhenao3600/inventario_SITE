const { MongoClient } = require('mongodb');

async function inspectSurplusAndDeficit() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  console.log('=== OBSERVACIONES EN CAMARA JUNIOR ===');
  const cj = await col.find({
    institucion: 'CAMARA JUNIOR',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();
  for (const d of cj) {
    console.log(`${d.convenio} | ${d.sede} | ${d.aula} | placa: ${d.placa} | serial: ${d.serial} | obs: ${d.observaciones || ''}`);
  }

  console.log('\n=== OBSERVACIONES EN EL CAIMO ===');
  const ec = await col.find({
    institucion: 'EL CAIMO',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();
  for (const d of ec) {
    console.log(`${d.convenio} | ${d.sede} | ${d.aula} | placa: ${d.placa} | serial: ${d.serial} | obs: ${d.observaciones || ''}`);
  }

  console.log('\n=== OBSERVACIONES EN ENRIQUE OLAYA HERRERA ===');
  const eoh = await col.find({
    institucion: 'ENRIQUE OLAYA HERRERA',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();
  for (const d of eoh) {
    console.log(`${d.convenio} | ${d.sede} | ${d.aula} | placa: ${d.placa} | serial: ${d.serial} | obs: ${d.observaciones || ''}`);
  }

  console.log('\n=== BUSCAR EN HISTORIAL O EN TODA LA BD DISPOSITIVOS CON TRASLADOS O CIUDADELA DEL SUR ===');
  const traslados = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    $or: [
      { observaciones: /traslado/i },
      { observaciones: /cambio/i },
      { observaciones: /ciudadela/i },
      { observaciones: /pinares/i }
    ]
  }).toArray();
  for (const d of traslados) {
    console.log(`${d.convenio} | ${d.institucion} | ${d.sede} | ${d.aula} | ${d.placa} | ${d.observaciones}`);
  }

  await client.close();
}

inspectSurplusAndDeficit().catch(console.error);

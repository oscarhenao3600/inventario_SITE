const { MongoClient } = require('mongodb');

async function inspectExactAulas() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  console.log('=== CAMARA JUNIOR (TODOS LOS DISPOSITIVOS PANTALLA) ===');
  const cj = await col.find({ institucion: 'CAMARA JUNIOR', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const s of cj) {
    console.log(`${s.convenio} | ${s.sede} | ${s.aula} | placa: ${s.placa} | serial: ${s.serial}`);
  }

  console.log('\n=== EL CAIMO (TODOS LOS DISPOSITIVOS PANTALLA) ===');
  const ec = await col.find({ institucion: 'EL CAIMO', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const s of ec) {
    console.log(`${s.convenio} | ${s.sede} | ${s.aula} | placa: ${s.placa} | serial: ${s.serial}`);
  }

  console.log('\n=== ENRIQUE OLAYA HERRERA (TODOS LOS DISPOSITIVOS PANTALLA) ===');
  const eoh = await col.find({ institucion: 'ENRIQUE OLAYA HERRERA', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const s of eoh) {
    console.log(`${s.convenio} | ${s.sede} | ${s.aula} | placa: ${s.placa} | serial: ${s.serial}`);
  }

  console.log('\n=== CIUDADELA DEL SUR (TODOS LOS DISPOSITIVOS PANTALLA 2022-006) ===');
  const cs = await col.find({ institucion: 'CIUDADELA DEL SUR', convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const s of cs) {
    console.log(`${s.convenio} | ${s.sede} | ${s.aula} | placa: ${s.placa} | serial: ${s.serial}`);
  }

  console.log('\n=== BOSQUES DE PINARES (2024-001) ===');
  const bp = await col.find({ institucion: 'BOSQUES DE PINARES', convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const s of bp) {
    console.log(`${s.convenio} | ${s.sede} | ${s.aula} | placa: ${s.placa} | serial: ${s.serial}`);
  }

  await client.close();
}

inspectExactAulas().catch(console.error);

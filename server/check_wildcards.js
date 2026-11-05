const { MongoClient } = require('mongodb');

async function checkWildcardsAndSantaRita() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('=== BUSCAR SANTA RITA EN TODA LA BD ===');
  const sr = await col.find({
    $or: [
      { sede: /SANTA RITA/i },
      { institucion: /SANTA RITA/i },
      { aula: /SANTA RITA/i },
      { observaciones: /SANTA RITA/i }
    ]
  }).toArray();
  console.log(`Encontrados en Santa Rita: ${sr.length}`);
  for (const d of sr) {
    console.log(`${d.convenio} | ${d.institucion} | ${d.sede} | ${d.aula} | ${d.dispositivo} | placa: ${d.placa} | serial: ${d.serial}`);
  }

  console.log('\n=== BUSCAR PANTALLAS SIN SERIAL (COMODINES PERFECTOS) ===');
  const noSerialScreens = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    $or: [
      { serial: null },
      { serial: '' },
      { serial: { $exists: false } },
      { serial: /^\s*$/ }
    ],
    estado: { $ne: 'FALTANTE' }
  }).toArray();
  console.log(`Pantallas sin serial: ${noSerialScreens.length}`);
  for (const d of noSerialScreens) {
    console.log(`${d.convenio} | ${d.institucion} | ${d.sede} | ${d.aula} | placa: ${d.placa}`);
  }

  console.log('\n=== BUSCAR REGISTROS FALTANTES INSERTADOS ANTERIORMENTE ===');
  const faltantes = await col.find({ estado: 'FALTANTE' }).toArray();
  console.log(`Registros FALTANTE insertados previamente: ${faltantes.length}`);

  await client.close();
}

checkWildcardsAndSantaRita().catch(console.error);

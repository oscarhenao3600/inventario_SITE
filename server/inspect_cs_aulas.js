const { MongoClient } = require('mongodb');

async function inspectCiudadelaSur() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const screens = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    institucion: /CIUDADELA DEL SUR/i
  }).toArray();

  console.log(`Total pantallas en Ciudadela del Sur: ${screens.length}`);
  for (const s of screens) {
    console.log(`${s.convenio.padEnd(10)} | ${s.sede.padEnd(25)} | ${s.aula.padEnd(25)} | placa: ${s.placa.padEnd(8)} | serial: ${s.serial || '(SIN SERIAL)'}`);
  }

  await client.close();
}

inspectCiudadelaSur().catch(console.error);

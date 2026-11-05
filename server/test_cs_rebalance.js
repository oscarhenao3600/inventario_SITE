const { MongoClient } = require('mongodb');

async function testCiudadelaSurRebalance() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Let's see all screens currently in CS or to be returned to CS:
  const csScreens = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    $or: [
      { institucion: /CIUDADELA DEL SUR/i },
      { placa: { $in: ['20848', '20849', '45764', '34296'] } }
    ]
  }).toArray();

  console.log(`Total pantallas de Ciudadela del Sur: ${csScreens.length}`);
  console.log('Metas requeridas:');
  console.log('2022-006: 34 (9 en Ciudadela, 15 en La Fachada, 10 en Puerto Espejo)');
  console.log('2024-001: 26 (26 en Ciudadela)');
  console.log('2025-001: 7 (3 en Ciudadela, 2 en La Fachada, 2 en Puerto Espejo)');
  console.log('Total metas = 34 + 26 + 7 = 67');

  console.log(`Pantallas existentes en BD para CS: ${csScreens.length}`);

  for (const s of csScreens) {
    console.log(`${s.convenio.padEnd(10)} | ${(s.sede || '').padEnd(25)} | ${(s.aula || '').padEnd(25)} | placa: ${s.placa.padEnd(8)} | serial: ${s.serial || '(SIN SERIAL)'}`);
  }

  await client.close();
}

testCiudadelaSurRebalance().catch(console.error);

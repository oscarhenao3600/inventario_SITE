const { MongoClient } = require('mongodb');

async function analyzeScreensAndWildcards() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const screens = await col.find({ dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log(`Total pantallas en BD: ${screens.length}`);

  const byConv = {};
  for (const s of screens) {
    byConv[s.convenio] = (byConv[s.convenio] || 0) + 1;
  }
  console.log('Pantallas por convenio actual:');
  console.log(byConv);

  const noSerial = screens.filter(s => !s.serial || s.serial.trim() === '');
  console.log(`Total pantallas SIN serial: ${noSerial.length}`);

  const byInstNoSerial = {};
  for (const s of noSerial) {
    const k = `${s.convenio} | ${s.institucion} | ${s.sede}`;
    byInstNoSerial[k] = (byInstNoSerial[k] || 0) + 1;
  }
  console.log('\nPantallas sin serial por Institución/Sede:');
  for (const [k, c] of Object.entries(byInstNoSerial)) {
    console.log(`${k} = ${c}`);
  }

  await client.close();
}

analyzeScreensAndWildcards().catch(console.error);

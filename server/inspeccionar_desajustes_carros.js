const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const targets22 = {
    'BOSQUES DE PINARES': 7, 'CAMARA JUNIOR': 17, 'CAMILO TORRES': 6, 'CASD': 21,
    'CIUDAD DORADA': 15, 'CIUDADELA CUYABRA': 15, 'CIUDADELA DE OCCIDENTE': 8, 'CIUDADELA DEL SUR': 26,
    'CRISTOBAL COLON': 23, 'EL CAIMO': 20, 'ENRIQUE OLAYA HERRERA': 8, 'EUDORO GRANADA': 12,
    'GUSTAVO MATAMOROS D´COSTA': 5, 'INEM': 10, 'ITI': 15, 'LA ADIELA': 20,
    'LAS COLINAS': 13, 'LAURA VICUÑA': 12, 'LOS QUINDOS': 27, 'MARCELINO CHAMPAGNAT': 12,
    'NACIONAL JESUS MARIA OCAMPO': 8, 'NORMAL SUPERIOR': 29, 'NUESTRA SEÑORA DE BELEN': 6,
    'REPUBLICA DE FRANCIA': 9, 'RUFINO CENTRO': 38, 'RUFINO JOSÉ CUERVO SUR': 10,
    'SANTA TERESA DE JESUS': 14, 'TERESITA MONTES': 23
  };

  const targets24 = {
    'BOSQUES DE PINARES': 25, 'CAMARA JUNIOR': 18, 'CAMILO TORRES': 13, 'CASD': 47,
    'CIUDAD DORADA': 5, 'CIUDADELA CUYABRA': 12, 'CIUDADELA DE OCCIDENTE': 30, 'CIUDADELA DEL SUR': 26,
    'CRISTOBAL COLON': 2, 'EL CAIMO': 9, 'ENRIQUE OLAYA HERRERA': 9, 'EUDORO GRANADA': 10,
    'GUSTAVO MATAMOROS D´COSTA': 22, 'INEM': 10, 'ITI': 0, 'LA ADIELA': 0,
    'LAS COLINAS': 0, 'LAURA VICUÑA': 12, 'LOS QUINDOS': 0, 'MARCELINO CHAMPAGNAT': 0,
    'NACIONAL JESUS MARIA OCAMPO': 0, 'NORMAL SUPERIOR': 50, 'NUESTRA SEÑORA DE BELEN': 0,
    'REPUBLICA DE FRANCIA': 0, 'RUFINO CENTRO': 0, 'RUFINO JOSÉ CUERVO SUR': 0,
    'SANTA TERESA DE JESUS': 0, 'TERESITA MONTES': 0
  };

  console.log('=== INSTITUCIONES CON DESBALANCE EN CARROS ===');
  for (const inst of Object.keys(targets22).sort()) {
    const t22 = targets22[inst];
    const t24 = targets24[inst];

    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });
    const c25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Carro Cargador de Tabletas' });
    const cSob = await col.countDocuments({ institucion: inst, convenio: 'SOBRANTE', dispositivo: 'Carro Cargador de Tabletas' });
    const cTot = c22 + c24 + c25 + cSob;

    const te22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Tablet Para Estudiantes' });
    const te24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Tablet Para Estudiantes' });
    const te25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Tablet Para Estudiantes' });

    const diff22 = c22 - t22;
    const diff24 = c24 - t24;
    const diffSum22_24 = (c22 + c24) - (t22 + t24);

    if (diff22 !== 0 || diff24 !== 0) {
      console.log(`\n------------------------------------------------------------`);
      console.log(`INSTITUCION: ${inst}`);
      console.log(`  Pantallas Meta -> 2022: ${t22}, 2024: ${t24}, Suma: ${t22 + t24}`);
      console.log(`  Carros Actual  -> 2022: ${c22}, 2024: ${c24}, 2025: ${c25}, Total: ${cTot} | Diff(22)=${diff22}, Diff(24)=${diff24}, Net(22+24)=${diffSum22_24}`);
      console.log(`  Tablets Est    -> 2022: ${te22} (${te22/30} carros), 2024: ${te24} (${te24/30} carros), 2025: ${te25} (${te25/30} carros)`);
    }
  }

  await c.close();
}

run().catch(console.error);

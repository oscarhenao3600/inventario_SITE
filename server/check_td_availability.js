const { MongoClient } = require('mongodb');

async function checkTDAvailability() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const targets2022 = {
    'BOSQUES DE PINARES': 7, 'CAMARA JUNIOR': 17, 'CAMILO TORRES': 6, 'CASD': 21,
    'CIUDAD DORADA': 15, 'CIUDADELA CUYABRA': 15, 'CIUDADELA DE OCCIDENTE': 8, 'CIUDADELA DEL SUR': 26,
    'CRISTOBAL COLON': 23, 'EL CAIMO': 20, 'ENRIQUE OLAYA HERRERA': 8, 'EUDORO GRANADA': 12,
    'GUSTAVO MATAMOROS D´COSTA': 5, 'INEM': 10, 'ITI': 15, 'LA ADIELA': 20,
    'LAS COLINAS': 13, 'LAURA VICUÑA': 12, 'LOS QUINDOS': 27, 'MARCELINO CHAMPAGNAT': 12,
    'NACIONAL JESUS MARIA OCAMPO': 8, 'NORMAL SUPERIOR': 29, 'NUESTRA SEÑORA DE BELEN': 6,
    'REPUBLICA DE FRANCIA': 9, 'RUFINO CENTRO': 38, 'RUFINO JOSÉ CUERVO SUR': 10,
    'SANTA TERESA DE JESUS': 14, 'TERESITA MONTES': 23
  };

  const targets2024 = {
    'BOSQUES DE PINARES': 25, 'CAMARA JUNIOR': 18, 'CAMILO TORRES': 13, 'CASD': 47,
    'CIUDAD DORADA': 5, 'CIUDADELA CUYABRA': 12, 'CIUDADELA DE OCCIDENTE': 30, 'CIUDADELA DEL SUR': 26,
    'CRISTOBAL COLON': 2, 'EL CAIMO': 9, 'ENRIQUE OLAYA HERRERA': 9, 'EUDORO GRANADA': 10,
    'GUSTAVO MATAMOROS D´COSTA': 22, 'INEM': 10, 'ITI': 0, 'LA ADIELA': 0,
    'LAS COLINAS': 0, 'LAURA VICUÑA': 12, 'LOS QUINDOS': 0, 'MARCELINO CHAMPAGNAT': 0,
    'NACIONAL JESUS MARIA OCAMPO': 0, 'NORMAL SUPERIOR': 50, 'NUESTRA SEÑORA DE BELEN': 0,
    'REPUBLICA DE FRANCIA': 0, 'RUFINO CENTRO': 0, 'RUFINO JOSÉ CUERVO SUR': 0,
    'SANTA TERESA DE JESUS': 0, 'TERESITA MONTES': 0
  };

  const targets2025 = {
    'BOSQUES DE PINARES': 5, 'CAMARA JUNIOR': 4, 'CAMILO TORRES': 2, 'CASD': 6,
    'CIUDAD DORADA': 3, 'CIUDADELA CUYABRA': 2, 'CIUDADELA DE OCCIDENTE': 4, 'CIUDADELA DEL SUR': 7,
    'CRISTOBAL COLON': 10, 'EL CAIMO': 2, 'ENRIQUE OLAYA HERRERA': 1, 'EUDORO GRANADA': 3,
    'GUSTAVO MATAMOROS D´COSTA': 3, 'INEM': 25, 'ITI': 21, 'LA ADIELA': 24,
    'LAS COLINAS': 3, 'LAURA VICUÑA': 1, 'LOS QUINDOS': 7, 'MARCELINO CHAMPAGNAT': 24,
    'NACIONAL JESUS MARIA OCAMPO': 17, 'NORMAL SUPERIOR': 6, 'NUESTRA SEÑORA DE BELEN': 15,
    'REPUBLICA DE FRANCIA': 2, 'RUFINO CENTRO': 39, 'RUFINO JOSÉ CUERVO SUR': 46,
    'SANTA TERESA DE JESUS': 16, 'TERESITA MONTES': 5
  };

  const tdList = await col.find({ dispositivo: 'Tablet Para Docentes' }).toArray();
  const byInst = {};
  for (const t of tdList) {
    byInst[t.institucion] = (byInst[t.institucion] || 0) + 1;
  }

  console.log("INSTITUCION                  | TD_DISP | T_2025 | T_2024 | T_2022 | TOTAL_META | DIF (TD - META)");
  for (const inst of Object.keys(targets2022).sort()) {
    const tdDisp = byInst[inst] || 0;
    const t25 = targets2025[inst] || 0;
    const t24 = targets2024[inst] || 0;
    const t22 = targets2022[inst] || 0;
    const meta = t25 + t24 + t22;
    console.log(`${inst.padEnd(28)} | ${String(tdDisp).padStart(7)} | ${String(t25).padStart(6)} | ${String(t24).padStart(6)} | ${String(t22).padStart(6)} | ${String(meta).padStart(10)} | ${String(tdDisp - meta).padStart(15)}`);
  }

  await client.close();
}

checkTDAvailability().catch(console.error);

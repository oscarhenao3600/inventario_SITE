const { MongoClient } = require('mongodb');

// Contracted targets by institution and convenio based on user provided tables and agreements:
// 2022-006: 429 SITEs
// 2024-001: 300 SITEs
// 2025-001: 303 SITEs
// Total: 1032 SITEs (+ 1 surplus in Gabriela Mistral)

const targets2022 = {
  'BOSQUES DE PINARES': 7, // 3 + 3 + 1 (Simon Rodriguez had 2 originally or 1? Let's check)
  'CAMARA JUNIOR': 17,
  'CAMILO TORRES': 6,
  'CASD': 21,
  'CIUDAD DORADA': 15,
  'CIUDADELA CUYABRA': 15,
  'CIUDADELA DE OCCIDENTE': 8,
  'CIUDADELA DEL SUR': 26,
  'CRISTOBAL COLON': 23,
  'EL CAIMO': 20,
  'ENRIQUE OLAYA HERRERA': 8,
  'EUDORO GRANADA': 12,
  'GUSTAVO MATAMOROS D´COSTA': 5,
  'INEM': 10,
  'ITI': 15,
  'LA ADIELA': 20,
  'LAS COLINAS': 13,
  'LAURA VICUÑA': 12,
  'LOS QUINDOS': 27,
  'MARCELINO CHAMPAGNAT': 12,
  'NACIONAL JESUS MARIA OCAMPO': 8,
  'NORMAL SUPERIOR': 29,
  'NUESTRA SEÑORA DE BELEN': 6,
  'REPUBLICA DE FRANCIA': 9,
  'RUFINO CENTRO': 38,
  'RUFINO JOSÉ CUERVO SUR': 10,
  'SANTA TERESA DE JESUS': 14,
  'TERESITA MONTES': 23
};

const targets2024 = {
  'BOSQUES DE PINARES': 25,
  'CAMARA JUNIOR': 18,
  'CAMILO TORRES': 13,
  'CASD': 47,
  'CIUDAD DORADA': 5,
  'CIUDADELA CUYABRA': 12,
  'CIUDADELA DE OCCIDENTE': 30,
  'CIUDADELA DEL SUR': 26,
  'CRISTOBAL COLON': 2,
  'EL CAIMO': 9,
  'ENRIQUE OLAYA HERRERA': 9,
  'EUDORO GRANADA': 10,
  'GUSTAVO MATAMOROS D´COSTA': 22,
  'INEM': 10,
  'ITI': 0,
  'LA ADIELA': 0,
  'LAS COLINAS': 0,
  'LAURA VICUÑA': 12,
  'LOS QUINDOS': 0,
  'MARCELINO CHAMPAGNAT': 0,
  'NACIONAL JESUS MARIA OCAMPO': 0,
  'NORMAL SUPERIOR': 50,
  'NUESTRA SEÑORA DE BELEN': 0,
  'REPUBLICA DE FRANCIA': 0,
  'RUFINO CENTRO': 0,
  'RUFINO JOSÉ CUERVO SUR': 0,
  'SANTA TERESA DE JESUS': 0,
  'TERESITA MONTES': 0
};

const targets2025 = {
  'BOSQUES DE PINARES': 5,
  'CAMARA JUNIOR': 4,
  'CAMILO TORRES': 2,
  'CASD': 6,
  'CIUDAD DORADA': 3,
  'CIUDADELA CUYABRA': 2,
  'CIUDADELA DE OCCIDENTE': 4,
  'CIUDADELA DEL SUR': 7,
  'CRISTOBAL COLON': 10,
  'EL CAIMO': 2,
  'ENRIQUE OLAYA HERRERA': 1,
  'EUDORO GRANADA': 3,
  'GUSTAVO MATAMOROS D´COSTA': 3,
  'INEM': 25,
  'ITI': 21,
  'LA ADIELA': 24,
  'LAS COLINAS': 3,
  'LAURA VICUÑA': 1,
  'LOS QUINDOS': 7,
  'MARCELINO CHAMPAGNAT': 24,
  'NACIONAL JESUS MARIA OCAMPO': 17,
  'NORMAL SUPERIOR': 6,
  'NUESTRA SEÑORA DE BELEN': 15,
  'REPUBLICA DE FRANCIA': 2,
  'RUFINO CENTRO': 39,
  'RUFINO JOSÉ CUERVO SUR': 46,
  'SANTA TERESA DE JESUS': 16,
  'TERESITA MONTES': 5
};

async function verifyTargets() {
  let sum22 = Object.values(targets2022).reduce((a,b)=>a+b, 0);
  let sum24 = Object.values(targets2024).reduce((a,b)=>a+b, 0);
  let sum25 = Object.values(targets2025).reduce((a,b)=>a+b, 0);
  console.log(`Sum 2022: ${sum22} (Expected 429)`);
  console.log(`Sum 2024: ${sum24} (Expected 300)`);
  console.log(`Sum 2025: ${sum25} (Expected 303)`);
  console.log(`Total: ${sum22 + sum24 + sum25} (Expected 1032)`);

  // Now verify with restored DB physical totals:
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const pList = await col.find({ dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const byInst = {};
  for (const p of pList) {
    byInst[p.institucion] = (byInst[p.institucion] || 0) + 1;
  }

  console.log("\nComparación Total Pantallas Físicas vs Suma de Metas (2022 + 2024 + 2025):");
  console.log("INSTITUCION                  | FISICAS | METAS | DIF");
  for (const inst of Object.keys(targets2022).sort()) {
    const fis = byInst[inst] || 0;
    const meta = (targets2022[inst] || 0) + (targets2024[inst] || 0) + (targets2025[inst] || 0);
    console.log(`${inst.padEnd(28)} | ${String(fis).padStart(7)} | ${String(meta).padStart(5)} | ${String(fis - meta).padStart(3)}`);
  }
  await client.close();
}

verifyTargets().catch(console.error);

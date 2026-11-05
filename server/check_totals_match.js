const { MongoClient } = require('mongodb');

const targets = {
  'BOSQUES DE PINARES': { '2022-006': 8, '2024-001': 25, '2025-001': 5, total: 38 },
  'CAMARA JUNIOR': { '2022-006': 14, '2024-001': 18, '2025-001': 4, total: 36 },
  'CAMILO TORRES': { '2022-006': 6, '2024-001': 13, '2025-001': 2, total: 21 },
  'CASD': { '2022-006': 21, '2024-001': 47, '2025-001': 6, total: 74 },
  'CIUDAD DORADA': { '2022-006': 15, '2024-001': 5, '2025-001': 3, total: 23 },
  'CIUDADELA CUYABRA': { '2022-006': 15, '2024-001': 12, '2025-001': 2, total: 29 },
  'CIUDADELA DE OCCIDENTE': { '2022-006': 8, '2024-001': 30, '2025-001': 4, total: 42 },
  'CIUDADELA DEL SUR': { '2022-006': 34, '2024-001': 26, '2025-001': 7, total: 67 },
  'CRISTOBAL COLON': { '2022-006': 23, '2024-001': 2, '2025-001': 10, total: 35 },
  'EL CAIMO': { '2022-006': 18, '2024-001': 9, '2025-001': 2, total: 29 },
  'ENRIQUE OLAYA HERRERA': { '2022-006': 8, '2024-001': 9, '2025-001': 1, total: 18 },
  'EUDORO GRANADA': { '2022-006': 12, '2024-001': 10, '2025-001': 3, total: 25 },
  'GUSTAVO MATAMOROS D´COSTA': { '2022-006': 9, '2024-001': 22, '2025-001': 3, total: 34 },
  'INEM': { '2022-006': 10, '2024-001': 10, '2025-001': 25, total: 45 },
  'ITI': { '2022-006': 15, '2024-001': 0, '2025-001': 21, total: 36 },
  'LA ADIELA': { '2022-006': 20, '2024-001': 0, '2025-001': 24, total: 44 },
  'LAS COLINAS': { '2022-006': 13, '2024-001': 0, '2025-001': 3, total: 16 },
  'LAURA VICUÑA': { '2022-006': 12, '2024-001': 12, '2025-001': 1, total: 25 },
  'LOS QUINDOS': { '2022-006': 27, '2024-001': 0, '2025-001': 7, total: 34 },
  'MARCELINO CHAMPAGNAT': { '2022-006': 12, '2024-001': 0, '2025-001': 24, total: 36 },
  'NACIONAL JESUS MARIA OCAMPO': { '2022-006': 0, '2024-001': 0, '2025-001': 17, total: 17 },
  'NORMAL SUPERIOR': { '2022-006': 29, '2024-001': 50, '2025-001': 6, total: 85 },
  'NUESTRA SEÑORA DE BELEN': { '2022-006': 6, '2024-001': 0, '2025-001': 15, total: 21 },
  'REPUBLICA DE FRANCIA': { '2022-006': 9, '2024-001': 0, '2025-001': 2, total: 11 },
  'RUFINO CENTRO': { '2022-006': 38, '2024-001': 0, '2025-001': 39, total: 77 },
  'RUFINO JOSÉ CUERVO SUR': { '2022-006': 10, '2024-001': 0, '2025-001': 46, total: 56 },
  'SANTA TERESA DE JESUS': { '2022-006': 14, '2024-001': 0, '2025-001': 16, total: 30 },
  'TERESITA MONTES': { '2022-006': 23, '2024-001': 0, '2025-001': 5, total: 28 }
};

async function checkTotalsMatch() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log("INSTITUCION                      | TOTAL META | TOTAL BD | DIFERENCIA");
  console.log("----------------------------------------------------------------------");
  let sumMeta = 0;
  let sumBD = 0;

  for (const [inst, t] of Object.entries(targets)) {
    const count = await col.countDocuments({ institucion: inst, dispositivo: 'Pantalla Interactiva Táctil' });
    const diff = count - t.total;
    sumMeta += t.total;
    sumBD += count;
    console.log(`${inst.padEnd(32)} | ${String(t.total).padStart(10)} | ${String(count).padStart(8)} | ${diff === 0 ? '  EXACTO' : (diff > 0 ? ' +' + diff : ' ' + diff)}`);
  }
  console.log("----------------------------------------------------------------------");
  console.log(`TOTAL                            | ${String(sumMeta).padStart(10)} | ${String(sumBD).padStart(8)} | ${sumBD - sumMeta}`);

  await client.close();
}

checkTotalsMatch().catch(console.error);

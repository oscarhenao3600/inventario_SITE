const { MongoClient } = require('mongodb');

// Metas por institución para los 3 convenios
const instTargets = {
  'BOSQUES DE PINARES':           { '2022-006': 7,  '2024-001': 25, '2025-001': 5  }, // 7 en 2022 (o 8 si +1 de Caimo/CJ)
  'CAMARA JUNIOR':               { '2022-006': 17, '2024-001': 18, '2025-001': 4  }, // 18-1=17 en 2022, 17+1=18 en 2024
  'CAMILO TORRES':               { '2022-006': 6,  '2024-001': 13, '2025-001': 2  },
  'CASD':                        { '2022-006': 21, '2024-001': 47, '2025-001': 6  },
  'CIUDAD DORADA':               { '2022-006': 15, '2024-001': 5,  '2025-001': 3  },
  'CIUDADELA CUYABRA':           { '2022-006': 15, '2024-001': 12, '2025-001': 2  }, // 21-6=15 en 2022, 6+6=12 en 2024
  'CIUDADELA DE OCCIDENTE':      { '2022-006': 8,  '2024-001': 30, '2025-001': 4  }, // 10-2=8 en 2022, 28+2=30 en 2024
  'CIUDADELA DEL SUR':           { '2022-006': 26, '2024-001': 26, '2025-001': 7  },
  'CRISTOBAL COLON':             { '2022-006': 23, '2024-001': 2,  '2025-001': 10 },
  'EL CAIMO':                    { '2022-006': 18, '2024-001': 11, '2025-001': 2  },
  'ENRIQUE OLAYA HERRERA':       { '2022-006': 8,  '2024-001': 9,  '2025-001': 1, 'SOBRANTE': 1 },
  'EUDORO GRANADA':              { '2022-006': 12, '2024-001': 10, '2025-001': 3  },
  'GUSTAVO MATAMOROS D´COSTA':   { '2022-006': 5,  '2024-001': 22, '2025-001': 3  },
  'INEM':                        { '2022-006': 10, '2024-001': 10, '2025-001': 25 },
  'ITI':                         { '2022-006': 15, '2024-001': 0,  '2025-001': 21 }, // 14+1=15 en 2022, 1-1=0 en 2024
  'LA ADIELA':                   { '2022-006': 20, '2024-001': 0,  '2025-001': 24 }, // 19+1=20 en 2022, 1-1=0 en 2024
  'LAS COLINAS':                 { '2022-006': 13, '2024-001': 0,  '2025-001': 3  },
  'LAURA VICUÑA':                { '2022-006': 12, '2024-001': 12, '2025-001': 1  },
  'LOS QUINDOS':                 { '2022-006': 27, '2024-001': 0,  '2025-001': 7  },
  'MARCELINO CHAMPAGNAT':        { '2022-006': 12, '2024-001': 0,  '2025-001': 24 },
  'NACIONAL JESUS MARIA OCAMPO': { '2022-006': 8,  '2024-001': 0,  '2025-001': 17 },
  'NORMAL SUPERIOR':             { '2022-006': 29, '2024-001': 50, '2025-001': 6  }, // 30-1=29 en 2022, 49+1=50 en 2024
  'NUESTRA SEÑORA DE BELEN':     { '2022-006': 6,  '2024-001': 0,  '2025-001': 15 },
  'REPUBLICA DE FRANCIA':        { '2022-006': 9,  '2024-001': 0,  '2025-001': 2  },
  'RUFINO CENTRO':               { '2022-006': 38, '2024-001': 0,  '2025-001': 39 }, // 37+1=38 en 2022, 1-1=0 en 2024
  'RUFINO JOSÉ CUERVO SUR':      { '2022-006': 10, '2024-001': 0,  '2025-001': 46 }, // 9+1=10 en 2022, 1-1=0 en 2024
  'SANTA TERESA DE JESUS':       { '2022-006': 14, '2024-001': 0,  '2025-001': 16 }, // 11+3=14 en 2022, 3-3=0 en 2024
  'TERESITA MONTES':             { '2022-006': 23, '2024-001': 0,  '2025-001': 5  }
};

async function checkKitEquality() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log("=== VERIFICANDO TOTALES POR CONVENIO SI ASIGNAMOS SEGÚN LA TABLA ===");
  let sum22 = 0, sum24 = 0, sum25 = 0, sumSob = 0;
  for (const [inst, t] of Object.entries(instTargets)) {
    sum22 += (t['2022-006'] || 0);
    sum24 += (t['2024-001'] || 0);
    sum25 += (t['2025-001'] || 0);
    sumSob += (t['SOBRANTE'] || 0);
  }
  console.log(`Sumas -> 2022: ${sum22} | 2024: ${sum24} | 2025: ${sum25} | SOBRANTE: ${sumSob}`);
  console.log(`TOTAL GLOBAL: ${sum22 + sum24 + sum25 + sumSob} (exactamente 1033 existentes)`);

  // Wait! Notice in 2024, El Caimo has 11, target was 9!
  // If El Caimo 2 extra are moved to 2022 (e.g. 1 to Bosques de Pinares and 1 to Gustavo Matamoros):
  // Wait, the user said "mover entonces solo convenios porfa"!
  // If we move ONLY convenios, a device in El Caimo can only change ITS CONVENIO.
  // It cannot move to Bosques de Pinares because that would change its `institucion`!
  // And the user explicitly said:
  // "la idea es mover entonces solo convenios porfa"
  // "en cantidades asi en las no esten en el aula como tal pero que las cantidades coinsidan incluso por institucion asi no coinsidan por sede"

  await client.close();
}

checkKitEquality().catch(console.error);

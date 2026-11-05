const { MongoClient } = require('mongodb');

// Metas originales proporcionadas por el usuario agrupadas por las instituciones de la BD:
// Mapeo canónico a las instituciones que existen en la BD restaurada:
// 1. BOSQUES DE PINARES: 2022=8, 2024=25, 2025=5
// 2. CAMARA JUNIOR: 2022=14, 2024=18, 2025=4
// 3. CAMILO TORRES: 2022=6, 2024=13, 2025=2
// 4. CASD: 2022=21, 2024=47, 2025=6
// 5. CIUDAD DORADA: 2022=15, 2024=5, 2025=3
// 6. CIUDADELA CUYABRA: 2022=15, 2024=12, 2025=2
// 7. CIUDADELA DE OCCIDENTE: 2022=8, 2024=30, 2025=4
// 8. CIUDADELA DEL SUR: 2022=34, 2024=26, 2025=7
// 9. CRISTOBAL COLON: 2022=23, 2024=2, 2025=10
// 10. EL CAIMO: 2022=18, 2024=9, 2025=2
// 11. ENRIQUE OLAYA HERRERA: 2022=8, 2024=9, 2025=1
// 12. EUDORO GRANADA: 2022=12, 2024=10, 2025=3
// 13. GUSTAVO MATAMOROS D´COSTA: 2022=9, 2024=22, 2025=3
// 14. INEM: 2022=10, 2024=10, 2025=25
// 15. ITI: 2022=15, 2024=0, 2025=21
// 16. LA ADIELA: 2022=20, 2024=0, 2025=24
// 17. LAS COLINAS: 2022=13, 2024=0, 2025=3
// 18. LAURA VICUÑA: 2022=12, 2024=12, 2025=1
// 19. LOS QUINDOS: 2022=27, 2024=0, 2025=7
// 20. MARCELINO CHAMPAGNAT: 2022=12, 2024=0, 2025=24
// 21. NACIONAL JESUS MARIA OCAMPO: 2022=0, 2024=0, 2025=17
// 22. NORMAL SUPERIOR: 2022=29, 2024=50, 2025=6
// 23. NUESTRA SEÑORA DE BELEN: (en 2022 NUEVA GRANADA=6; en 2025 BELEN=15) -> 2022=6, 2024=0, 2025=15
// 24. REPUBLICA DE FRANCIA: 2022=9, 2024=0, 2025=2
// 25. RUFINO CENTRO: 2022=38, 2024=0, 2025=39
// 26. RUFINO JOSÉ CUERVO SUR: (en 2022 MADRE MARCELINA=10; en 2025 MADRE MARCELINA=15 + RUFINO SUR=31 = 46) -> 2022=10, 2024=0, 2025=46
// 27. SANTA TERESA DE JESUS: 2022=14, 2024=0, 2025=16
// 28. TERESITA MONTES: 2022=23, 2024=0, 2025=5

const targets = {
  'BOSQUES DE PINARES': { '2022-006': 8, '2024-001': 25, '2025-001': 5 },
  'CAMARA JUNIOR': { '2022-006': 14, '2024-001': 18, '2025-001': 4 },
  'CAMILO TORRES': { '2022-006': 6, '2024-001': 13, '2025-001': 2 },
  'CASD': { '2022-006': 21, '2024-001': 47, '2025-001': 6 },
  'CIUDAD DORADA': { '2022-006': 15, '2024-001': 5, '2025-001': 3 },
  'CIUDADELA CUYABRA': { '2022-006': 15, '2024-001': 12, '2025-001': 2 },
  'CIUDADELA DE OCCIDENTE': { '2022-006': 8, '2024-001': 30, '2025-001': 4 },
  'CIUDADELA DEL SUR': { '2022-006': 34, '2024-001': 26, '2025-001': 7 },
  'CRISTOBAL COLON': { '2022-006': 23, '2024-001': 2, '2025-001': 10 },
  'EL CAIMO': { '2022-006': 18, '2024-001': 9, '2025-001': 2 },
  'ENRIQUE OLAYA HERRERA': { '2022-006': 8, '2024-001': 9, '2025-001': 1 },
  'EUDORO GRANADA': { '2022-006': 12, '2024-001': 10, '2025-001': 3 },
  'GUSTAVO MATAMOROS D´COSTA': { '2022-006': 9, '2024-001': 22, '2025-001': 3 },
  'INEM': { '2022-006': 10, '2024-001': 10, '2025-001': 25 },
  'ITI': { '2022-006': 15, '2024-001': 0, '2025-001': 21 },
  'LA ADIELA': { '2022-006': 20, '2024-001': 0, '2025-001': 24 },
  'LAS COLINAS': { '2022-006': 13, '2024-001': 0, '2025-001': 3 },
  'LAURA VICUÑA': { '2022-006': 12, '2024-001': 12, '2025-001': 1 },
  'LOS QUINDOS': { '2022-006': 27, '2024-001': 0, '2025-001': 7 },
  'MARCELINO CHAMPAGNAT': { '2022-006': 12, '2024-001': 0, '2025-001': 24 },
  'NACIONAL JESUS MARIA OCAMPO': { '2022-006': 0, '2024-001': 0, '2025-001': 17 },
  'NORMAL SUPERIOR': { '2022-006': 29, '2024-001': 50, '2025-001': 6 },
  'NUESTRA SEÑORA DE BELEN': { '2022-006': 6, '2024-001': 0, '2025-001': 15 },
  'REPUBLICA DE FRANCIA': { '2022-006': 9, '2024-001': 0, '2025-001': 2 },
  'RUFINO CENTRO': { '2022-006': 38, '2024-001': 0, '2025-001': 39 },
  'RUFINO JOSÉ CUERVO SUR': { '2022-006': 10, '2024-001': 0, '2025-001': 46 },
  'SANTA TERESA DE JESUS': { '2022-006': 14, '2024-001': 0, '2025-001': 16 },
  'TERESITA MONTES': { '2022-006': 23, '2024-001': 0, '2025-001': 5 }
};

async function testTargets() {
  // Let's verify sum of targets:
  let sum22 = 0, sum24 = 0, sum25 = 0;
  for (const [inst, t] of Object.entries(targets)) {
    sum22 += (t['2022-006'] || 0);
    sum24 += (t['2024-001'] || 0);
    sum25 += (t['2025-001'] || 0);
  }
  console.log(`Suma Metas -> 2022: ${sum22} (esperado 429), 2024: ${sum24} (esperado 300), 2025: ${sum25} (esperado 303)`);

  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const kitTypes = [
    'Pantalla Interactiva Táctil',
    'Servidor Portable de Aula SITE Sistema Cloud',
    'Soporte Electrónico Pantalla Interactiva Táctil',
    'Tablet Para Docentes'
  ];

  console.log('\n=== COMPARACIÓN ACTUAL EN BD POR INSTITUCIÓN Y CONVENIO ===\n');

  const allDocs = await col.find({ dispositivo: { $in: kitTypes } }).toArray();

  for (const [inst, t] of Object.entries(targets)) {
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`INSTITUCIÓN: ${inst}`);
    for (const conv of ['2022-006', '2024-001', '2025-001']) {
      const tgt = t[conv] || 0;
      const docsConv = allDocs.filter(d => d.institucion === inst && d.convenio === conv);
      
      const p = docsConv.filter(d => d.dispositivo === 'Pantalla Interactiva Táctil').length;
      const srv = docsConv.filter(d => d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
      const sop = docsConv.filter(d => d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
      const td = docsConv.filter(d => d.dispositivo === 'Tablet Para Docentes').length;

      const diffP = p - tgt;
      const status = (p === tgt && srv === tgt && sop === tgt && td === tgt) ? 'OK' : 'DESAJUSTE';
      if (status !== 'OK' || tgt > 0) {
        console.log(`  Conv ${conv} | Meta: ${tgt} => Pantallas: ${p} (${diffP >= 0 ? '+' : ''}${diffP}) | Servidores: ${srv} | Soportes: ${sop} | TabDocente: ${td}  [${status}]`);
      }
    }
  }

  await client.close();
}

testTargets().catch(console.error);

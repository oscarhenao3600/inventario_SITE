const { MongoClient } = require('mongodb');

async function testApplyLogic2() {
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

  const docs = await col.find({ dispositivo: { $in: kitTypes } }).toArray();

  const targets = {
    '2022-006': {
      'BOSQUES DE PINARES': 7, 'CAMARA JUNIOR': 17, 'CAMILO TORRES': 6, 'CASD': 21,
      'CIUDAD DORADA': 15, 'CIUDADELA CUYABRA': 15, 'CIUDADELA DE OCCIDENTE': 8, 'CIUDADELA DEL SUR': 26,
      'CRISTOBAL COLON': 23, 'EL CAIMO': 20, 'ENRIQUE OLAYA HERRERA': 8, 'EUDORO GRANADA': 12,
      'GUSTAVO MATAMOROS D´COSTA': 5, 'INEM': 10, 'ITI': 15, 'LA ADIELA': 20,
      'LAS COLINAS': 13, 'LAURA VICUÑA': 12, 'LOS QUINDOS': 27, 'MARCELINO CHAMPAGNAT': 12,
      'NACIONAL JESUS MARIA OCAMPO': 8, 'NORMAL SUPERIOR': 29, 'NUESTRA SEÑORA DE BELEN': 6,
      'REPUBLICA DE FRANCIA': 9, 'RUFINO CENTRO': 38, 'RUFINO JOSÉ CUERVO SUR': 10,
      'SANTA TERESA DE JESUS': 14, 'TERESITA MONTES': 23
    },
    '2024-001': {
      'BOSQUES DE PINARES': 25, 'CAMARA JUNIOR': 18, 'CAMILO TORRES': 13, 'CASD': 47,
      'CIUDAD DORADA': 5, 'CIUDADELA CUYABRA': 12, 'CIUDADELA DE OCCIDENTE': 30, 'CIUDADELA DEL SUR': 26,
      'CRISTOBAL COLON': 2, 'EL CAIMO': 9, 'ENRIQUE OLAYA HERRERA': 9, 'EUDORO GRANADA': 10,
      'GUSTAVO MATAMOROS D´COSTA': 22, 'INEM': 10, 'ITI': 0, 'LA ADIELA': 0,
      'LAS COLINAS': 0, 'LAURA VICUÑA': 12, 'LOS QUINDOS': 0, 'MARCELINO CHAMPAGNAT': 0,
      'NACIONAL JESUS MARIA OCAMPO': 0, 'NORMAL SUPERIOR': 50, 'NUESTRA SEÑORA DE BELEN': 0,
      'REPUBLICA DE FRANCIA': 0, 'RUFINO CENTRO': 0, 'RUFINO JOSÉ CUERVO SUR': 0,
      'SANTA TERESA DE JESUS': 0, 'TERESITA MONTES': 0
    },
    '2025-001': {
      'BOSQUES DE PINARES': 5, 'CAMARA JUNIOR': 4, 'CAMILO TORRES': 2, 'CASD': 6,
      'CIUDAD DORADA': 3, 'CIUDADELA CUYABRA': 2, 'CIUDADELA DE OCCIDENTE': 4, 'CIUDADELA DEL SUR': 7,
      'CRISTOBAL COLON': 10, 'EL CAIMO': 2, 'ENRIQUE OLAYA HERRERA': 1, 'EUDORO GRANADA': 3,
      'GUSTAVO MATAMOROS D´COSTA': 3, 'INEM': 25, 'ITI': 21, 'LA ADIELA': 24,
      'LAS COLINAS': 3, 'LAURA VICUÑA': 1, 'LOS QUINDOS': 7, 'MARCELINO CHAMPAGNAT': 24,
      'NACIONAL JESUS MARIA OCAMPO': 17, 'NORMAL SUPERIOR': 6, 'NUESTRA SEÑORA DE BELEN': 15,
      'REPUBLICA DE FRANCIA': 2, 'RUFINO CENTRO': 39, 'RUFINO JOSÉ CUERVO SUR': 46,
      'SANTA TERESA DE JESUS': 16, 'TERESITA MONTES': 5
    }
  };

  // Clone in memory
  const sim = docs.map(d => ({ ...d }));

  // 1. Mark Gabriela Mistral surplus kit as SOBRANTE
  for (const d of sim) {
    if (d.institucion === 'ENRIQUE OLAYA HERRERA' && ['47058', '46956', '46994'].includes(d.placa)) {
      d.convenio = 'SOBRANTE';
    }
  }

  // Define the exact room-based kit movements with SEDE and AULA
  const kitMoves = [
    // CIUDADELA CUYABRA: 6 kits from 2022-006 to 2024-001
    { inst: 'CIUDADELA CUYABRA', from: '2022-006', to: '2024-001', rooms: [
      { sede: 'CIUDADELA CUYABRA', aula: '06 - 1A' },
      { sede: 'CIUDADELA CUYABRA', aula: '07 - 2A' },
      { sede: 'CIUDADELA CUYABRA', aula: '08 - 3A' },
      { sede: 'CIUDADELA CUYABRA', aula: '10 - 3C' },
      { sede: 'CIUDADELA CUYABRA', aula: '11 - 4A' },
      { sede: 'CIUDADELA CUYABRA', aula: '12 - 4C' }
    ]},
    // CIUDADELA DE OCCIDENTE: 2 kits from 2022-006 to 2024-001
    { inst: 'CIUDADELA DE OCCIDENTE', from: '2022-006', to: '2024-001', rooms: [
      { sede: 'CIUDADELA DE OCCIDENTE', aula: '202' },
      { sede: 'CIUDADELA DE OCCIDENTE', aula: '401' }
    ]},
    // NORMAL SUPERIOR: 1 kit from 2022-006 to 2024-001
    { inst: 'NORMAL SUPERIOR', from: '2022-006', to: '2024-001', rooms: [
      { sede: 'REPUBLICA DE URUGUAY', aula: 'AULA 2' }
    ]},
    // CAMARA JUNIOR: 1 kit from 2022-006 to 2024-001
    { inst: 'CAMARA JUNIOR', from: '2022-006', to: '2024-001', rooms: [
      { sede: 'CIUDAD MILAGRO', aula: '3B' }
    ]},
    // ITI: 1 kit from 2024-001 to 2022-006
    { inst: 'ITI', from: '2024-001', to: '2022-006', rooms: [
      { sede: 'ITI', aula: 'AULA 21' }
    ]},
    // LA ADIELA: 1 kit from 2024-001 to 2022-006
    { inst: 'LA ADIELA', from: '2024-001', to: '2022-006', rooms: [
      { sede: 'LA CECILIA', aula: 'AULA 2' }
    ]},
    // RUFINO CENTRO: 1 kit from 2024-001 to 2022-006
    { inst: 'RUFINO CENTRO', from: '2024-001', to: '2022-006', rooms: [
      { sede: 'RUFINO CENTRO', aula: 'AULA 16' }
    ]},
    // RUFINO JOSÉ CUERVO SUR: 1 kit from 2024-001 to 2022-006
    { inst: 'RUFINO JOSÉ CUERVO SUR', from: '2024-001', to: '2022-006', rooms: [
      { sede: 'RUFINO JOSÉ CUERVO SUR', aula: 'TECNOLOGIA 2' }
    ]},
    // SANTA TERESA DE JESUS: 3 kits from 2024-001 to 2022-006
    { inst: 'SANTA TERESA DE JESUS', from: '2024-001', to: '2022-006', rooms: [
      { sede: 'SANTA TERESA DE JESUS', aula: 'AULA 28' },
      { sede: 'SANTA TERESA DE JESUS', aula: 'AULA 30' },
      { sede: 'SANTA TERESA DE JESUS', aula: 'BIBLIOTECA' }
    ]},
    // EL CAIMO: 2 kits from 2024-001 to 2022-006
    { inst: 'EL CAIMO', from: '2024-001', to: '2022-006', rooms: [
      { sede: 'JOSE MARIA CÓRDOBA', aula: 'AULA 2' },
      { sede: 'SANTA ANA', aula: 'PRIMARIA' }
    ]}
  ];

  for (const km of kitMoves) {
    for (const r of km.rooms) {
      for (const d of sim) {
        if (d.institucion === km.inst && d.convenio === km.from && d.sede === r.sede && d.aula === r.aula) {
          if (['Pantalla Interactiva Táctil', 'Servidor Portable de Aula SITE Sistema Cloud', 'Soporte Electrónico Pantalla Interactiva Táctil'].includes(d.dispositivo)) {
            d.convenio = km.to;
          }
        }
      }
    }
  }

  // Tablets Docentes balancing:
  const insts = Object.keys(targets['2022-006']).sort();
  for (const inst of insts) {
    const t25 = targets['2025-001'][inst] || 0;
    const t24 = targets['2024-001'][inst] || 0;
    const t22 = targets['2022-006'][inst] || 0;

    const tds = sim.filter(d => d.institucion === inst && d.dispositivo === 'Tablet Para Docentes');
    
    // Sort tds: AVT first, then others, then AD10X last
    tds.sort((a, b) => {
      const aIsAD = (a.serial || '').startsWith('AD10X');
      const bIsAD = (b.serial || '').startsWith('AD10X');
      if (aIsAD && !bIsAD) return 1;
      if (!aIsAD && bIsAD) return -1;
      return 0;
    });

    let assigned25 = 0, assigned24 = 0, assigned22 = 0;
    for (const t of tds) {
      if (assigned25 < t25) {
        t.convenio = '2025-001';
        assigned25++;
      } else if (assigned24 < t24) {
        t.convenio = '2024-001';
        assigned24++;
      } else if (assigned22 < t22) {
        t.convenio = '2022-006';
        assigned22++;
      } else {
        // Surplus tablet in this institution
        t.convenio = '2022-006';
      }
    }
  }

  console.log("==================== AUDITORIA POR CONVENIO ====================");
  for (const conv of ['2022-006', '2024-001', '2025-001', 'SOBRANTE']) {
    const p = sim.filter(d => d.convenio === conv && d.dispositivo === 'Pantalla Interactiva Táctil').length;
    const srv = sim.filter(d => d.convenio === conv && d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
    const sop = sim.filter(d => d.convenio === conv && d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
    const td = sim.filter(d => d.convenio === conv && d.dispositivo === 'Tablet Para Docentes').length;
    console.log(`Convenio ${conv.padEnd(10)}: Pantallas=${p}, Servidores=${srv}, Soportes=${sop}, TabletsDocente=${td}`);
  }

  console.log("\n==================== VERIFICACION TOTALES ====================");
  let totalErrors = 0;
  for (const inst of insts) {
    for (const conv of ['2022-006', '2024-001', '2025-001']) {
      const p = sim.filter(d => d.institucion === inst && d.convenio === conv && d.dispositivo === 'Pantalla Interactiva Táctil').length;
      const srv = sim.filter(d => d.institucion === inst && d.convenio === conv && d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
      const sop = sim.filter(d => d.institucion === inst && d.convenio === conv && d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
      const expected = targets[conv][inst] || 0;
      if (p !== expected || srv !== expected || sop !== expected) {
        console.error(`ERROR en ${inst} (${conv}): P=${p}, Srv=${srv}, Sop=${sop}, Esperado=${expected}`);
        totalErrors++;
      }
    }
  }
  if (totalErrors === 0) {
    console.log(">>> ¡100% PERFECTO! TODOS LOS KITS (Pantalla, Servidor, Soporte) EN LAS 28 INSTITUCIONES Y LOS 3 CONVENIOS COINCIDEN CON LA META EXACTA AL 100% <<<");
  } else {
    console.log(`Errores encontrados: ${totalErrors}`);
  }

  await client.close();
}

testApplyLogic2().catch(console.error);

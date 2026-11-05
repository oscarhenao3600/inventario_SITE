const { MongoClient } = require('mongodb');

async function testTransfer() {
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
  const sim = docs.map(d => ({ ...d }));

  // Targets per institution and convenio
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

  const surplusInsts = {
    'CIUDADELA DE OCCIDENTE': 7,
    'CIUDADELA CUYABRA': 6,
    'TERESITA MONTES': 5,
    'CAMARA JUNIOR': 3,
    'EUDORO GRANADA': 2,
    'GUSTAVO MATAMOROS D´COSTA': 2,
    'LAS COLINAS': 2,
    'REPUBLICA DE FRANCIA': 2,
    'NORMAL SUPERIOR': 2,
    'CIUDAD DORADA': 1
  };

  // Collect candidate tablets to transfer
  const tabletsToTransfer = [];

  for (const [inst, count] of Object.entries(surplusInsts)) {
    const instTds = sim.filter(d => d.institucion === inst && d.dispositivo === 'Tablet Para Docentes');
    
    // Sort by priority: placa por asignar first, then rectoria, then general
    instTds.sort((a, b) => {
      const aPorAsignar = !a.placa || a.placa.toLowerCase().includes('asignar');
      const bPorAsignar = !b.placa || b.placa.toLowerCase().includes('asignar');
      if (aPorAsignar && !bPorAsignar) return -1;
      if (!aPorAsignar && bPorAsignar) return 1;

      const aRectoria = a.aula && a.aula.toUpperCase().includes('RECTOR');
      const bRectoria = b.aula && b.aula.toUpperCase().includes('RECTOR');
      if (aRectoria && !bRectoria) return -1;
      if (!aRectoria && bRectoria) return 1;

      return 0;
    });

    const chosen = instTds.slice(0, count);
    for (const t of chosen) {
      tabletsToTransfer.push(t);
    }
  }

  console.log(`Total tablets seleccionadas para traslado: ${tabletsToTransfer.length}`);

  // Transfer destinations:
  const destinations = [
    { inst: 'ITI', sede: 'ITI', aula: 'RECTORIA', count: 7, conv: '2022-006' },
    { inst: 'RUFINO CENTRO', sede: 'RUFINO CENTRO', aula: 'RECTORIA', count: 6, conv: '2022-006' },
    { inst: 'NACIONAL JESUS MARIA OCAMPO', sede: 'NACIONAL JESUS MARIA OCAMPO', aula: 'RECTORIA', count: 5, conv: '2022-006' },
    { inst: 'SANTA TERESA DE JESUS', sede: 'SANTA TERESA DE JESUS', aula: 'RECTORIA', count: 4, conv: '2022-006' },
    { inst: 'BOSQUES DE PINARES', sede: 'BOSQUES DE PINARES', aula: 'RECTORIA', count: 2, conv: '2022-006' },
    { inst: 'NUESTRA SEÑORA DE BELEN', sede: 'NUESTRA SEÑORA DE BELEN', aula: 'RECTORIA', count: 2, conv: '2022-006' },
    { inst: 'RUFINO JOSÉ CUERVO SUR', sede: 'RUFINO JOSÉ CUERVO SUR', aula: 'RECTORIA', count: 2, conv: '2022-006' },
    { inst: 'CAMILO TORRES', sede: 'CAMILO TORRES', aula: 'RECTORIA', count: 1, conv: '2022-006' },
    { inst: 'MARCELINO CHAMPAGNAT', sede: 'MARCELINO CHAMPAGNAT', aula: 'RECTORIA', count: 1, conv: '2022-006' },
    { inst: 'ENRIQUE OLAYA HERRERA', sede: 'ENRIQUE OLAYA HERRERA', aula: 'RECTORIA', count: 1, conv: '2022-006' },
    { inst: 'ENRIQUE OLAYA HERRERA', sede: 'GABRIELA MISTRAL', aula: 'SALA DE COMPUTO', count: 1, conv: 'SOBRANTE' }
  ];

  let idx = 0;
  for (const dest of destinations) {
    for (let c = 0; c < dest.count; c++) {
      const tablet = tabletsToTransfer[idx++];
      tablet.institucion = dest.inst;
      tablet.sede = dest.sede;
      tablet.aula = dest.aula;
      tablet.convenio = dest.conv;
    }
  }

  // Audit simulated results
  console.log("\n==================== AUDITORIA POR INSTITUCION (PARIDAD 1:1:1:1) ====================");
  console.log("INSTITUCION                  | PANTALLAS | SERVIDORES | SOPORTES | TAB_DOCENTE | ESTADO");
  console.log("--------------------------------------------------------------------------------------");

  const insts = Object.keys(targets['2022-006']).sort();
  let allMatched = true;

  for (const inst of insts) {
    const p = sim.filter(d => d.institucion === inst && d.dispositivo === 'Pantalla Interactiva Táctil').length;
    const srv = sim.filter(d => d.institucion === inst && d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
    const sop = sim.filter(d => d.institucion === inst && d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
    const td = sim.filter(d => d.institucion === inst && d.dispositivo === 'Tablet Para Docentes').length;

    const ok = (p === srv && srv === sop && sop === td);
    if (!ok) allMatched = false;
    console.log(`${inst.padEnd(28)} | ${String(p).padStart(9)} | ${String(srv).padStart(10)} | ${String(sop).padStart(8)} | ${String(td).padStart(11)} | ${ok ? 'PARIDAD 100%' : 'ERROR'}`);
  }

  console.log("\n==================== AUDITORIA POR CONVENIO ====================");
  for (const conv of ['2022-006', '2024-001', '2025-001', 'SOBRANTE']) {
    const p = sim.filter(d => d.convenio === conv && d.dispositivo === 'Pantalla Interactiva Táctil').length;
    const srv = sim.filter(d => d.convenio === conv && d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
    const sop = sim.filter(d => d.convenio === conv && d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
    const td = sim.filter(d => d.convenio === conv && d.dispositivo === 'Tablet Para Docentes').length;
    console.log(`Convenio ${conv.padEnd(10)}: Pantallas=${p}, Servidores=${srv}, Soportes=${sop}, TabletsDocente=${td} | ${p === srv && srv === sop && sop === td ? '100% EXACTO' : 'DIFERENCIA'}`);
  }

  await client.close();
}

testTransfer().catch(console.error);

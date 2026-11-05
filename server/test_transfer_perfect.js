const { MongoClient } = require('mongodb');

async function testTransferPerfect() {
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

  const tabletsToTransfer = [];

  for (const [inst, count] of Object.entries(surplusInsts)) {
    // Only from 2022-006
    const instTds = sim.filter(d => d.institucion === inst && d.convenio === '2022-006' && d.dispositivo === 'Tablet Para Docentes');
    
    // Prioritize placa por asignar, then rectoria
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

  console.log(`Tablets seleccionadas: ${tabletsToTransfer.length}`);

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
  console.log("\n==================== AUDITORIA POR CONVENIO ====================");
  for (const conv of ['2022-006', '2024-001', '2025-001', 'SOBRANTE']) {
    const p = sim.filter(d => d.convenio === conv && d.dispositivo === 'Pantalla Interactiva Táctil').length;
    const srv = sim.filter(d => d.convenio === conv && d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
    const sop = sim.filter(d => d.convenio === conv && d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
    const td = sim.filter(d => d.convenio === conv && d.dispositivo === 'Tablet Para Docentes').length;
    console.log(`Convenio ${conv.padEnd(10)}: Pantallas=${p}, Servidores=${srv}, Soportes=${sop}, TabletsDocente=${td} | ${p === srv && srv === sop && sop === td ? '100% EXACTO' : 'DIFERENCIA'}`);
  }

  const insts = [...new Set(sim.map(d => d.institucion))].sort();
  console.log("\n==================== AUDITORIA POR INSTITUCION (PARIDAD 1:1:1:1) ====================");
  let allMatched = true;
  for (const inst of insts) {
    const p = sim.filter(d => d.institucion === inst && d.dispositivo === 'Pantalla Interactiva Táctil').length;
    const srv = sim.filter(d => d.institucion === inst && d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
    const sop = sim.filter(d => d.institucion === inst && d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
    const td = sim.filter(d => d.institucion === inst && d.dispositivo === 'Tablet Para Docentes').length;

    const ok = (p === srv && srv === sop && sop === td);
    if (!ok) allMatched = false;
    console.log(`${inst.padEnd(28)} | P:${p} Srv:${srv} Sop:${sop} TD:${td} | ${ok ? 'PARIDAD 100%' : 'ERROR'}`);
  }

  console.log("\n==================== VERIFICACION TOTAL ====================");
  console.log(`¿Todas las 28 instituciones tienen paridad 100%?: ${allMatched ? 'SI' : 'NO'}`);

  await client.close();
}

testTransferPerfect().catch(console.error);

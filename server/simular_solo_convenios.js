const { MongoClient } = require('mongodb');

// Metas por institución
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

async function simulate() {
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

  // We load all kit items in memory to simulate purely changing their `convenio`
  const docs = await col.find({ dispositivo: { $in: kitTypes } }).toArray();
  console.log(`Cargados ${docs.length} dispositivos de kit para simulación.`);

  // Create an in-memory mutable copy
  const simDocs = docs.map(d => ({
    _id: d._id,
    placa: d.placa,
    serial: d.serial,
    institucion: d.institucion,
    sede: d.sede,
    aula: d.aula,
    dispositivo: d.dispositivo,
    convenio: d.convenio
  }));

  // Helper to reassign convenio of specific items
  function moveKits(inst, fromConv, toConv, count) {
    let movedP = 0, movedSrv = 0, movedSop = 0;
    for (const d of simDocs) {
      if (d.institucion === inst && d.convenio === fromConv) {
        if (d.dispositivo === 'Pantalla Interactiva Táctil' && movedP < count) {
          d.convenio = toConv;
          movedP++;
        } else if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud' && movedSrv < count) {
          d.convenio = toConv;
          movedSrv++;
        } else if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil' && movedSop < count) {
          d.convenio = toConv;
          movedSop++;
        }
      }
    }
    console.log(`Mover Kits [${inst}]: ${fromConv} -> ${toConv} (${count} solicitados | P:${movedP}, Srv:${movedSrv}, Sop:${movedSop})`);
  }

  // Helper to balance Tablet Docentes to match target/pantallas
  function balanceTD(inst, fromConv, toConv, count) {
    let moved = 0;
    for (const d of simDocs) {
      if (d.institucion === inst && d.convenio === fromConv && d.dispositivo === 'Tablet Para Docentes' && moved < count) {
        d.convenio = toConv;
        moved++;
      }
    }
    console.log(`Balancear Tablet Docente [${inst}]: ${fromConv} -> ${toConv} (${moved} movidas)`);
  }

  console.log('\n--- 1. MOVIENDO KITS (Pantalla + Servidor + Soporte) ---');
  // Ciudadela Cuyabra: 6 kits de 2022-006 a 2024-001
  moveKits('CIUDADELA CUYABRA', '2022-006', '2024-001', 6);

  // Ciudadela de Occidente: 2 kits de 2022-006 a 2024-001
  moveKits('CIUDADELA DE OCCIDENTE', '2022-006', '2024-001', 2);

  // Normal Superior: 1 kit de 2022-006 a 2024-001
  moveKits('NORMAL SUPERIOR', '2022-006', '2024-001', 1);

  // Camara Junior: 1 kit de 2022-006 a 2024-001
  moveKits('CAMARA JUNIOR', '2022-006', '2024-001', 1);

  // ITI: 1 kit de 2024-001 a 2022-006
  moveKits('ITI', '2024-001', '2022-006', 1);

  // La Adiela: 1 kit de 2024-001 a 2022-006
  moveKits('LA ADIELA', '2024-001', '2022-006', 1);

  // Rufino Centro: 1 kit de 2024-001 a 2022-006
  moveKits('RUFINO CENTRO', '2024-001', '2022-006', 1);

  // Rufino Sur: 1 kit de 2024-001 a 2022-006
  moveKits('RUFINO JOSÉ CUERVO SUR', '2024-001', '2022-006', 1);

  // Santa Teresa de Jesus: 3 kits de 2024-001 a 2022-006
  moveKits('SANTA TERESA DE JESUS', '2024-001', '2022-006', 3);

  // El Caimo: 2 kits en 2024-001 que exceden meta (9 meta, 11 en BD)
  // ¿Pueden pasar a 2022-006 o SOBRANTE?
  // Enrique Olaya: 1 kit en 2024-001 que excede meta (9 meta, 10 en BD) -> SOBRANTE

  console.log('\n--- 2. BALANCEANDO TABLETS DOCENTES DENTRO DE CADA INSTITUCIÓN ---');
  // For each institution, adjust Tablet Para Docentes to match the target / screens of each convenio!
  const insts = Object.keys(targets);
  for (const inst of insts) {
    const p22 = simDocs.filter(d => d.institucion === inst && d.convenio === '2022-006' && d.dispositivo === 'Pantalla Interactiva Táctil').length;
    const p24 = simDocs.filter(d => d.institucion === inst && d.convenio === '2024-001' && d.dispositivo === 'Pantalla Interactiva Táctil').length;
    const p25 = simDocs.filter(d => d.institucion === inst && d.convenio === '2025-001' && d.dispositivo === 'Pantalla Interactiva Táctil').length;

    let tdDocs = simDocs.filter(d => d.institucion === inst && d.dispositivo === 'Tablet Para Docentes');
    // Desired: p22 tablets in 2022, p24 tablets in 2024, p25 tablets in 2025
    let count22 = 0, count24 = 0, count25 = 0;
    tdDocs.forEach(td => {
      if (count22 < p22) {
        td.convenio = '2022-006';
        count22++;
      } else if (count24 < p24) {
        td.convenio = '2024-001';
        count24++;
      } else if (count25 < p25) {
        td.convenio = '2025-001';
        count25++;
      } else {
        // Any extra tablet stays in its current or becomes 2024
      }
    });
  }

  console.log('\n--- 3. RESULTADO DE LA SIMULACIÓN ---');
  const convTotals = {
    '2022-006': { P: 0, Srv: 0, Sop: 0, TD: 0 },
    '2024-001': { P: 0, Srv: 0, Sop: 0, TD: 0 },
    '2025-001': { P: 0, Srv: 0, Sop: 0, TD: 0 }
  };

  for (const d of simDocs) {
    const c = d.convenio;
    if (convTotals[c]) {
      if (d.dispositivo === 'Pantalla Interactiva Táctil') convTotals[c].P++;
      else if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') convTotals[c].Srv++;
      else if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') convTotals[c].Sop++;
      else if (d.dispositivo === 'Tablet Para Docentes') convTotals[c].TD++;
    }
  }

  console.log('Totales Globales Simulados:');
  console.log(convTotals);

  await client.close();
}

simulate().catch(console.error);

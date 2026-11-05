const { MongoClient } = require('mongodb');

async function planUpdates() {
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

  // Targets by institution for each convenio
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

  // Group by institution
  const insts = Object.keys(targets['2022-006']).sort();
  
  const updates = []; // { _id, currentConv, newConv, dispositivo, placa, serial, inst, sede, aula }

  for (const inst of insts) {
    const instDocs = docs.filter(d => d.institucion === inst);

    // Let's identify the Sobrante in Gabriela Mistral
    for (const d of instDocs) {
      if (d.institucion === 'ENRIQUE OLAYA HERRERA' && ['47058', '46956', '46994'].includes(d.placa)) {
        if (d.convenio !== 'SOBRANTE') {
          updates.push({
            _id: d._id,
            currentConv: d.convenio,
            newConv: 'SOBRANTE',
            dispositivo: d.dispositivo,
            placa: d.placa,
            serial: d.serial,
            institucion: d.institucion,
            sede: d.sede,
            aula: d.aula
          });
          d.convenio = 'SOBRANTE'; // mark in memory
        }
      }
    }

    // Now for Pantalla, Servidor, Soporte:
    // They are 100% paired. Let's see what needs to move between convenios:
    // 1. CIUDADELA CUYABRA: 6 kits from 2022-006 to 2024-001
    // 2. CIUDADELA DE OCCIDENTE: 2 kits from 2022-006 to 2024-001
    // 3. NORMAL SUPERIOR: 1 kit from 2022-006 to 2024-001
    // 4. CAMARA JUNIOR: 1 kit from 2022-006 to 2024-001
    // 5. ITI: 1 kit from 2024-001 to 2022-006
    // 6. LA ADIELA: 1 kit from 2024-001 to 2022-006
    // 7. RUFINO CENTRO: 1 kit from 2024-001 to 2022-006
    // 8. RUFINO JOSÉ CUERVO SUR: 1 kit from 2024-001 to 2022-006
    // 9. SANTA TERESA DE JESUS: 3 kits from 2024-001 to 2022-006
    // 10. EL CAIMO: 2 kits from 2024-001 to 2022-006

    // Let's do this systematically by matching target counts for each hardware type:
    for (const disp of ['Pantalla Interactiva Táctil', 'Servidor Portable de Aula SITE Sistema Cloud', 'Soporte Electrónico Pantalla Interactiva Táctil']) {
      const dispDocs = instDocs.filter(d => d.dispositivo === disp && d.convenio !== 'SOBRANTE');
      
      const target25 = targets['2025-001'][inst] || 0;
      const target24 = targets['2024-001'][inst] || 0;
      const target22 = targets['2022-006'][inst] || 0;

      // Check current
      const curr25 = dispDocs.filter(d => d.convenio === '2025-001');
      const curr24 = dispDocs.filter(d => d.convenio === '2024-001');
      const curr22 = dispDocs.filter(d => d.convenio === '2022-006');

      // If curr24 > target24, move excess to 2022-006
      if (curr24.length > target24) {
        const excess = curr24.slice(target24);
        for (const doc of excess) {
          updates.push({
            _id: doc._id,
            currentConv: doc.convenio,
            newConv: '2022-006',
            dispositivo: doc.dispositivo,
            placa: doc.placa,
            serial: doc.serial,
            institucion: doc.institucion,
            sede: doc.sede,
            aula: doc.aula
          });
          doc.convenio = '2022-006';
        }
      }

      // If curr22 > target22, move excess to 2024-001
      if (curr22.length > target22) {
        const excess = curr22.slice(target22);
        for (const doc of excess) {
          updates.push({
            _id: doc._id,
            currentConv: doc.convenio,
            newConv: '2024-001',
            dispositivo: doc.dispositivo,
            placa: doc.placa,
            serial: doc.serial,
            institucion: doc.institucion,
            sede: doc.sede,
            aula: doc.aula
          });
          doc.convenio = '2024-001';
        }
      }
    }

    // Now for Tablet Para Docentes:
    // Assign convenios to match targets in this order: 2025-001, 2024-001, 2022-006
    const tdDocs = instDocs.filter(d => d.dispositivo === 'Tablet Para Docentes');
    const target25 = targets['2025-001'][inst] || 0;
    const target24 = targets['2024-001'][inst] || 0;
    const target22 = targets['2022-006'][inst] || 0;

    let assigned25 = 0, assigned24 = 0, assigned22 = 0;
    for (const t of tdDocs) {
      let desiredConv = '2022-006';
      if (assigned25 < target25) {
        desiredConv = '2025-001';
        assigned25++;
      } else if (assigned24 < target24) {
        desiredConv = '2024-001';
        assigned24++;
      } else if (assigned22 < target22) {
        desiredConv = '2022-006';
        assigned22++;
      } else {
        // Surplus tablet in this institution
        desiredConv = '2022-006'; // or keep existing
      }

      if (t.convenio !== desiredConv) {
        updates.push({
          _id: t._id,
          currentConv: t.convenio,
          newConv: desiredConv,
          dispositivo: t.dispositivo,
          placa: t.placa,
          serial: t.serial,
          institucion: t.institucion,
          sede: t.sede,
          aula: t.aula
        });
        t.convenio = desiredConv;
      }
    }
  }

  console.log(`Total de actualizaciones planificadas: ${updates.length}`);
  console.log("Muestra de actualizaciones:");
  console.log(updates.slice(0, 10));

  await client.close();
}

planUpdates().catch(console.error);

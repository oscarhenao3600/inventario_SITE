const { MongoClient } = require('mongodb');

async function analyzeAllInst() {
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

  const insts = await col.distinct('institucion');
  insts.sort();

  console.log(`Encontradas ${insts.length} instituciones en la BD:\n`);

  for (const inst of insts) {
    const docs = await col.find({ institucion: inst, dispositivo: { $in: kitTypes } }).toArray();
    
    // Group by convenio and device
    const matrix = {
      '2022-006': { P: 0, Srv: 0, Sop: 0, TD: 0 },
      '2024-001': { P: 0, Srv: 0, Sop: 0, TD: 0 },
      '2025-001': { P: 0, Srv: 0, Sop: 0, TD: 0 },
      'TOTAL':    { P: 0, Srv: 0, Sop: 0, TD: 0 }
    };

    docs.forEach(d => {
      const c = d.convenio;
      let field = null;
      if (d.dispositivo === 'Pantalla Interactiva Táctil') field = 'P';
      else if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') field = 'Srv';
      else if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') field = 'Sop';
      else if (d.dispositivo === 'Tablet Para Docentes') field = 'TD';

      if (field) {
        if (matrix[c]) matrix[c][field]++;
        matrix['TOTAL'][field]++;
      }
    });

    console.log(`=== ${inst} ===`);
    console.log(`  2022-006: P=${matrix['2022-006'].P}, Srv=${matrix['2022-006'].Srv}, Sop=${matrix['2022-006'].Sop}, TD=${matrix['2022-006'].TD}`);
    console.log(`  2024-001: P=${matrix['2024-001'].P}, Srv=${matrix['2024-001'].Srv}, Sop=${matrix['2024-001'].Sop}, TD=${matrix['2024-001'].TD}`);
    console.log(`  2025-001: P=${matrix['2025-001'].P}, Srv=${matrix['2025-001'].Srv}, Sop=${matrix['2025-001'].Sop}, TD=${matrix['2025-001'].TD}`);
    console.log(`  TOTAL:    P=${matrix['TOTAL'].P}, Srv=${matrix['TOTAL'].Srv}, Sop=${matrix['TOTAL'].Sop}, TD=${matrix['TOTAL'].TD}`);
  }

  await client.close();
}

analyzeAllInst().catch(console.error);

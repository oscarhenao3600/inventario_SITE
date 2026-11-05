const { MongoClient } = require('mongodb');

async function analyzeTablets() {
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

  console.log(`Total documentos analizados: ${docs.length}`);

  // Let's check distribution of Tablets Docentes per institution and sede
  const byInst = {};
  for (const d of docs) {
    if (!byInst[d.institucion]) {
      byInst[d.institucion] = {
        P: 0, Srv: 0, Sop: 0, TD: 0,
        sedes: {}
      };
    }
    const r = byInst[d.institucion];
    if (d.dispositivo === 'Pantalla Interactiva Táctil') r.P++;
    if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') r.Srv++;
    if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') r.Sop++;
    if (d.dispositivo === 'Tablet Para Docentes') r.TD++;

    const sedeKey = d.sede || 'SIN_SEDE';
    if (!r.sedes[sedeKey]) r.sedes[sedeKey] = { P: 0, Srv: 0, Sop: 0, TD: 0 };
    if (d.dispositivo === 'Pantalla Interactiva Táctil') r.sedes[sedeKey].P++;
    if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') r.sedes[sedeKey].Srv++;
    if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') r.sedes[sedeKey].Sop++;
    if (d.dispositivo === 'Tablet Para Docentes') r.sedes[sedeKey].TD++;
  }

  console.log("\nINSTITUCIONES CON DIFERENCIA EN TABLET DOCENTE vs PANTALLAS:");
  for (const [inst, data] of Object.entries(byInst)) {
    if (data.TD !== data.P) {
      console.log(`\n>>> ${inst}: Pantallas=${data.P}, TD=${data.TD} (Dif: ${data.TD - data.P})`);
      for (const [sede, sData] of Object.entries(data.sedes)) {
        console.log(`    Sede: ${sede} -> P:${sData.P}, Srv:${sData.Srv}, Sop:${sData.Sop}, TD:${sData.TD}`);
      }
    }
  }

  await client.close();
}

analyzeTablets().catch(console.error);

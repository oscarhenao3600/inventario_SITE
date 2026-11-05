const { MongoClient } = require('mongodb');

async function findAccessoriesToBalance() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Find 2024 classrooms that have 2022 tablets (student tablets)
  const screens2024 = await col.find({ convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  
  console.log("=== BUSCANDO AULAS 2024 CON TABLETS DE ESTUDIANTE EN 2022 ===");
  for (const s of screens2024) {
    const tabEst2022 = await col.find({
      institucion: s.institucion,
      sede: s.sede,
      aula: s.aula,
      dispositivo: 'Tablet Para Estudiantes',
      convenio: '2022-006'
    }).toArray();
    if (tabEst2022.length > 0) {
      console.log(`Aula 2024 con ${tabEst2022.length} tablets en 2022-006: ${s.institucion} | ${s.sede} | ${s.aula}`);
    }
  }

  console.log("\n=== BUSCANDO AULAS 2024 CON SERVIDOR EN 2022 ===");
  for (const s of screens2024) {
    const srv2022 = await col.find({
      institucion: s.institucion,
      sede: s.sede,
      aula: s.aula,
      dispositivo: 'Servidor Portable de Aula SITE Sistema Cloud',
      convenio: '2022-006'
    }).toArray();
    if (srv2022.length > 0) {
      console.log(`Aula 2024 con servidor en 2022-006: ${s.institucion} | ${s.sede} | ${s.aula} (placas: ${srv2022.map(x=>x.placa).join(', ')})`);
    }
  }

  console.log("\n=== BUSCANDO AULAS 2024 CON SOPORTE EN 2022 ===");
  for (const s of screens2024) {
    const sop2022 = await col.find({
      institucion: s.institucion,
      sede: s.sede,
      aula: s.aula,
      dispositivo: 'Soporte Electrónico Pantalla Interactiva Táctil',
      convenio: '2022-006'
    }).toArray();
    if (sop2022.length > 0) {
      console.log(`Aula 2024 con soporte en 2022-006: ${s.institucion} | ${s.sede} | ${s.aula} (placas: ${sop2022.map(x=>x.placa).join(', ')})`);
    }
  }

  console.log("\n=== BUSCANDO AULAS 2024 CON CARRO EN 2022 ===");
  for (const s of screens2024) {
    const car2022 = await col.find({
      institucion: s.institucion,
      sede: s.sede,
      aula: s.aula,
      dispositivo: 'Carro Cargador de Tabletas',
      convenio: '2022-006'
    }).toArray();
    if (car2022.length > 0) {
      console.log(`Aula 2024 con carro en 2022-006: ${s.institucion} | ${s.sede} | ${s.aula} (placas: ${car2022.map(x=>x.placa).join(', ')})`);
    }
  }

  console.log("\n=== BUSCANDO AULAS 2022 CON TABLET DOCENTE EN 2024 ===");
  const screens2022 = await col.find({ convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const s of screens2022) {
    const tabDoc2024 = await col.find({
      institucion: s.institucion,
      sede: s.sede,
      aula: s.aula,
      dispositivo: 'Tablet Para Docentes',
      convenio: '2024-001'
    }).toArray();
    if (tabDoc2024.length > 0) {
      console.log(`Aula 2022 con docente tablet en 2024-001: ${s.institucion} | ${s.sede} | ${s.aula} (placas: ${tabDoc2024.map(x=>x.placa).join(', ')})`);
    }
  }

  await client.close();
}

findAccessoriesToBalance().catch(console.error);

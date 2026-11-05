const { MongoClient } = require('mongodb');
const fs = require('fs');

async function searchNumbers() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Let's check how many tablets docentes are in AULAS (excluding rectoria/admin)
  const docInAula = await col.countDocuments({
    dispositivo: 'Tablet Para Docentes',
    aula: { $not: /rectoria|coordinacion|secretaria|admin/i }
  });
  console.log('Tablet docente in regular classrooms (not rectoria/admin):', docInAula);

  const docInRectoria = await col.countDocuments({
    dispositivo: 'Tablet Para Docentes',
    aula: /rectoria|coordinacion|secretaria|admin/i
  });
  console.log('Tablet docente in rectoria/admin:', docInRectoria);
  console.log('Total tablet docente in DB:', docInAula + docInRectoria);

  // Let's check tablets estudiante:
  // How many tablets estudiante in aulas with carros?
  const totalEst = await col.countDocuments({ dispositivo: 'Tablet Para Estudiantes' });
  console.log('Total Tablet Para Estudiantes in DB:', totalEst);

  await client.close();
}

searchNumbers();

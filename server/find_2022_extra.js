const { MongoClient } = require('mongodb');

async function find2022Extra() {
  const uri = process.env.MONGODB_URI || 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // Aggregate aulas in 2022-006
    const aulas2022 = await col.aggregate([
      { $match: { convenio: '2022-006' } },
      {
        $group: {
          _id: {
            institucion: '$institucion',
            sede: '$sede',
            aula: '$aula'
          },
          pantallas: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] } },
          servidores: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] } },
          soportes: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] } },
          carros: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] } },
          tabletsDoc: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] } },
          tabletsEst: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.institucion': 1, '_id.sede': 1, '_id.aula': 1 } }
    ]).toArray();

    console.log(`Total distinct aulas in 2022-006: ${aulas2022.length}`);

    // Check aulas with unusual counts: e.g. 0 tablets estudiante, or >1 carro, or >1 pantalla
    const unusual = aulas2022.filter(a => 
      a.pantallas !== 1 || 
      a.servidores !== 1 || 
      a.soportes !== 1 || 
      a.carros !== 1 || 
      a.tabletsDoc !== 1 || 
      a.tabletsEst !== 30
    );
    console.log(`Unusual aulas in 2022-006: ${unusual.length}`);
    console.table(unusual.map(a => ({
      inst: a._id.institucion,
      sede: a._id.sede,
      aula: a._id.aula,
      pan: a.pantallas,
      ser: a.servidores,
      sop: a.soportes,
      carr: a.carros,
      doc: a.tabletsDoc,
      est: a.tabletsEst
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

find2022Extra();

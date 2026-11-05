const { MongoClient } = require('mongodb');

async function showInstDistribution() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const agg = await col.aggregate([
      {
        $group: {
          _id: {
            institucion: '$institucion',
            convenio: '$convenio'
          },
          pantallas: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] } },
          servidores: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] } },
          soportes: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] } },
          carros: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] } },
          tabletsDoc: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] } },
          tabletsEst: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } }
        }
      },
      {
        $sort: { '_id.institucion': 1, '_id.convenio': 1 }
      }
    ]).toArray();

    console.log('=== DISTRIBUTION BY INSTITUCION & CONVENIO IN DB ===');
    console.table(agg.map(r => ({
      institucion: r._id.institucion,
      convenio: r._id.convenio || '(VACIO)',
      pan: r.pantallas,
      ser: r.servidores,
      sop: r.soportes,
      carr: r.carros,
      doc: r.tabletsDoc,
      est: r.tabletsEst
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

showInstDistribution();

const { MongoClient } = require('mongodb');

async function find2022ZeroEst() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const aulas = await col.aggregate([
      { $match: { convenio: '2022-006' } },
      {
        $group: {
          _id: { inst: '$institucion', sede: '$sede', aula: '$aula' },
          pan: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] } },
          ser: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] } },
          sop: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] } },
          carr: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] } },
          doc: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] } },
          est: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } }
        }
      },
      {
        $match: {
          pan: { $gt: 0 },
          est: { $lt: 30 }
        }
      },
      { $sort: { '_id.inst': 1, '_id.sede': 1, '_id.aula': 1 } }
    ]).toArray();

    console.log('2022-006 Aulas with Pantalla and < 30 student tablets:');
    console.table(aulas.map(a => ({
      inst: a._id.inst,
      sede: a._id.sede,
      aula: a._id.aula,
      pan: a.pan,
      ser: a.ser,
      sop: a.sop,
      carr: a.carr,
      doc: a.doc,
      est: a.est
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

find2022ZeroEst();

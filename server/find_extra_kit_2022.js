const { MongoClient } = require('mongodb');

async function findExtraKit2022() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // Find all aulas in 2022-006 that have a Pantalla, Servidor, Soporte
    const aulas = await col.aggregate([
      { $match: { convenio: '2022-006' } },
      {
        $group: {
          _id: { inst: '$institucion', sede: '$sede', aula: '$aula' },
          pantallas: { $push: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, { placa: '$placa', serial: '$serial', notas: '$notas' }, '$$REMOVE'] } },
          servidores: { $push: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, { placa: '$placa', serial: '$serial', notas: '$notas' }, '$$REMOVE'] } },
          soportes: { $push: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, { placa: '$placa', serial: '$serial', notas: '$notas' }, '$$REMOVE'] } },
          carros: { $push: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, { placa: '$placa', serial: '$serial', notas: '$notas' }, '$$REMOVE'] } },
          docentes: { $push: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, { placa: '$placa', serial: '$serial', notas: '$notas' }, '$$REMOVE'] } },
          estCount: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } }
        }
      },
      {
        $match: {
          $expr: { $gt: [{ $size: '$pantallas' }, 0] }
        }
      },
      { $sort: { '_id.inst': 1, '_id.sede': 1, '_id.aula': 1 } }
    ]).toArray();

    console.log(`Total aulas with Pantalla in 2022-006: ${aulas.length}`);

    // Check aulas where estCount === 0
    const zeroEstAulas = aulas.filter(a => a.estCount === 0);
    console.log(`Aulas with Pantalla in 2022 but 0 tablets estudiantes: ${zeroEstAulas.length}`);
    for (const a of zeroEstAulas) {
      console.log(`\n${a._id.inst} | ${a._id.sede} | ${a._id.aula}:`);
      console.log(`  Pantalla:`, a.pantallas);
      console.log(`  Servidor:`, a.servidores);
      console.log(`  Soporte:`, a.soportes);
      console.log(`  Carros:`, a.carros);
      console.log(`  Docentes:`, a.docentes);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

findExtraKit2022();

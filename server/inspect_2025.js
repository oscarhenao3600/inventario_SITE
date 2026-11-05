const { MongoClient } = require('mongodb');

async function inspect2025() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const byInst2025 = await col.aggregate([
      { $match: { convenio: '2025-001' } },
      {
        $group: {
          _id: '$institucion',
          pan: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] } },
          ser: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] } },
          sop: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] } },
          carr: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] } },
          doc: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] } },
          est: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } },
          mesas: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Mesa Interactiva Tactil'] }, 1, 0] } },
          sillas: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Silla De Mesa interactiva'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    console.log('=== CONVENIO 2025-001 POR INSTITUCION ===');
    console.table(byInst2025);

    const totals = byInst2025.reduce((acc, row) => {
      acc.pan += row.pan;
      acc.ser += row.ser;
      acc.sop += row.sop;
      acc.carr += row.carr;
      acc.doc += row.doc;
      acc.est += row.est;
      acc.mesas += row.mesas;
      acc.sillas += row.sillas;
      return acc;
    }, { pan: 0, ser: 0, sop: 0, carr: 0, doc: 0, est: 0, mesas: 0, sillas: 0 });

    console.log('Totales 2025-001:', totals);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

inspect2025();

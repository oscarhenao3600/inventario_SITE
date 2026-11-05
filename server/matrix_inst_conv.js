const { MongoClient } = require('mongodb');

async function matrix() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const agg = await col.aggregate([
      {
        $group: {
          _id: { inst: '$institucion', conv: '$convenio' },
          pan: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] } },
          ser: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] } },
          sop: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] } },
          carr: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] } },
          doc: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] } },
          est: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.inst': 1, '_id.conv': 1 } }
    ]).toArray();

    // Group by institution
    const insts = {};
    for (const r of agg) {
      const inst = r._id.inst || '(SIN INST)';
      const conv = r._id.conv || '(VACIO)';
      if (!insts[inst]) insts[inst] = {};
      insts[inst][conv] = {
        pan: r.pan,
        ser: r.ser,
        sop: r.sop,
        carr: r.carr,
        doc: r.doc,
        est: r.est
      };
    }

    console.log('=== INSTITUCIONES Y CONVENIOS ===');
    for (const [inst, convs] of Object.entries(insts)) {
      console.log(`\n--- ${inst} ---`);
      for (const [conv, data] of Object.entries(convs)) {
        console.log(`  ${conv}: PAN=${data.pan}, SER=${data.ser}, SOP=${data.sop}, CARR=${data.carr}, DOC=${data.doc}, EST=${data.est}`);
      }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

matrix();

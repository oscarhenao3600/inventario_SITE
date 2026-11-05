const { MongoClient } = require('mongodb');

async function checkConveniosByDeviceModel() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // Does the "modelo" or "serial" of devices indicate their real convenio?
    // Let's check distinct models and serial patterns per device type and current convenio
    const models = await col.aggregate([
      {
        $group: {
          _id: { dispositivo: '$dispositivo', modelo: '$modelo', convenio: '$convenio' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.dispositivo': 1, '_id.modelo': 1, '_id.convenio': 1 } }
    ]).toArray();

    console.log('=== MODELOS Y CONVENIOS ===');
    console.table(models.map(m => ({
      dispositivo: m._id.dispositivo,
      modelo: m._id.modelo,
      convenio: m._id.convenio,
      count: m.count
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkConveniosByDeviceModel();

const { MongoClient } = require('mongodb');

async function inspectDevices() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // Check counts by device and convenio
    console.log('--- Aggregation by Dispositivo & Convenio ---');
    const agg = await col.aggregate([
      {
        $group: {
          _id: { dispositivo: '$dispositivo', convenio: '$convenio' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.dispositivo': 1, '_id.convenio': 1 } }
    ]).toArray();
    console.table(agg.map(a => ({
      dispositivo: a._id.dispositivo,
      convenio: a._id.convenio,
      count: a.count
    })));

    // Let's check if there are devices with special notes, or updatedBy, or created recently
    const recent = await col.find({ updatedBy: { $exists: true } }).limit(5).toArray();
    console.log('\nSample devices with updatedBy:', recent);

    // Let's check distinct institucion count
    const insts = await col.distinct('institucion');
    console.log(`\nDistinct institutions in DB: ${insts.length}`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

inspectDevices();

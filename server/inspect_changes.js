const { MongoClient } = require('mongodb');

async function inspectChanges() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // Count by updatedBy
    const byUpdatedBy = await col.aggregate([
      { $group: { _id: '$updatedBy', count: { $sum: 1 } } }
    ]).toArray();
    console.log('By updatedBy:', byUpdatedBy);

    // Look for records without placa or with notes
    const withNotes = await col.aggregate([
      { $match: { notas: { $exists: true, $ne: '' } } },
      { $group: { _id: '$notas', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]).toArray();
    console.log('Top notes:', withNotes);

    // Check count of each device type
    const counts = await col.aggregate([
      { $group: { _id: { dev: '$dispositivo', conv: '$convenio' }, count: { $sum: 1 } } },
      { $sort: { '_id.conv': 1, '_id.dev': 1 } }
    ]).toArray();
    console.log('\nExact counts in MongoDB by (convenio, dispositivo):');
    console.table(counts.map(c => ({
      convenio: c._id.conv,
      dispositivo: c._id.dev,
      count: c.count
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

inspectChanges();

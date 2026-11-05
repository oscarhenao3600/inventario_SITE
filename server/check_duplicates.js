const { MongoClient } = require('mongodb');

async function checkDuplicates() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // Duplicate placas (excluding empty or 'POR ASIGNAR' or null)
    const dupPlacas = await col.aggregate([
      {
        $match: {
          placa: { $exists: true, $ne: '', $nin: [null, 'SIN PLACA', 'POR ASIGNAR', 'POR ASIGNAR PLACA'] }
        }
      },
      {
        $group: {
          _id: { $toUpper: { $trim: { input: '$placa' } } },
          count: { $sum: 1 },
          devices: { $push: { id: '$_id', dev: '$dispositivo', serial: '$serial', inst: '$institucion', sede: '$sede', aula: '$aula', conv: '$convenio' } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    console.log(`Placas duplicadas encontradas: ${dupPlacas.length}`);
    if (dupPlacas.length > 0) {
      console.log('Sample placas duplicadas:');
      console.log(JSON.stringify(dupPlacas.slice(0, 10), null, 2));
    }

    // Duplicate serials (excluding empty or null)
    const dupSerials = await col.aggregate([
      {
        $match: {
          serial: { $exists: true, $ne: '', $type: 'string' }
        }
      },
      {
        $group: {
          _id: { $toUpper: { $trim: { input: '$serial' } } },
          count: { $sum: 1 },
          devices: { $push: { id: '$_id', dev: '$dispositivo', placa: '$placa', inst: '$institucion', sede: '$sede', aula: '$aula', conv: '$convenio' } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    console.log(`\nSerials duplicados encontrados: ${dupSerials.length}`);
    if (dupSerials.length > 0) {
      console.log('Sample serials duplicados:');
      console.log(JSON.stringify(dupSerials.slice(0, 10), null, 2));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkDuplicates();

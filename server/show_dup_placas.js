const { MongoClient } = require('mongodb');

async function showDupPlacas() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

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

    console.log(`Duplicate placas: ${dupPlacas.length}`);
    for (const d of dupPlacas) {
      console.log(`Placa: "${d._id}" (Count: ${d.count})`);
      d.devices.forEach(dev => {
        console.log(`   - ${dev.dev} | serial: ${dev.serial} | ${dev.inst} | ${dev.sede} | ${dev.aula} | conv: ${dev.conv}`);
      });
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

showDupPlacas();

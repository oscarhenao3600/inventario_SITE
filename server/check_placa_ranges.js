const { MongoClient } = require('mongodb');

async function checkPlacaRanges() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // Sample devices of each convenio with their placas and dates
    for (const conv of ['2022-006', '2024-001', '2025-001']) {
      console.log(`\n=== CONVENIO: ${conv} ===`);
      const sample = await col.aggregate([
        { $match: { convenio: conv, placa: { $regex: /^\d+$/ } } },
        {
          $project: {
            placaNum: { $toInt: '$placa' },
            placa: 1,
            fecha: 1,
            dispositivo: 1,
            modelo: 1
          }
        },
        {
          $group: {
            _id: null,
            minPlaca: { $min: '$placaNum' },
            maxPlaca: { $max: '$placaNum' },
            minFecha: { $min: '$fecha' },
            maxFecha: { $max: '$fecha' },
            count: { $sum: 1 }
          }
        }
      ]).toArray();
      console.log(sample);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkPlacaRanges();

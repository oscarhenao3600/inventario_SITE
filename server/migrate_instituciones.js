const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'inventario_educativo';

async function migrate() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const dispositivosColl = db.collection('dispositivos');
    const institucionesColl = db.collection('instituciones');

    console.log('Obteniendo datos de dispositivos...');
    const pipeline = [
      {
        $group: {
          _id: "$institucion",
          sedes: { $addToSet: "$sede" }
        }
      },
      {
        $match: { _id: { $ne: null, $ne: "" } }
      }
    ];

    const results = await dispositivosColl.aggregate(pipeline).toArray();
    console.log(`Encontradas ${results.length} instituciones.`);

    for (const res of results) {
      await institucionesColl.updateOne(
        { nombre: res._id },
        { $set: { nombre: res._id, sedes: res.sedes.filter(s => s) } },
        { upsate: true, upsert: true }
      );
    }

    console.log('Migración completada.');
  } catch (err) {
    console.error('Error en migración:', err);
  } finally {
    await client.close();
  }
}

migrate();

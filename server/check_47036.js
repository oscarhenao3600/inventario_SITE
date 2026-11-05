const { MongoClient } = require('mongodb');

async function check47036() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventario_educativo';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const devs = await col.find({ placa: { $in: ['47036', '47037'] } }).toArray();
    console.log(JSON.stringify(devs, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

check47036();

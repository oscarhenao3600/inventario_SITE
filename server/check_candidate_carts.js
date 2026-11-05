const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const devs = await col.find({ placa: { $in: ['46566', '34248', '22639', '46573', '47767', '42442', '47036'] } }).toArray();
  console.log(JSON.stringify(devs, null, 2));

  await c.close();
}

run().catch(console.error);

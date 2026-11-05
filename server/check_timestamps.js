const { MongoClient } = require('mongodb');

async function checkTimestamps() {
  const c = new MongoClient('mongodb://localhost:27017/inventario_educativo');
  await c.connect();
  const col = c.db().collection('dispositivos');
  
  const first = await col.find().sort({ _id: 1 }).limit(1).toArray();
  const last = await col.find().sort({ _id: -1 }).limit(1).toArray();

  if (first.length > 0) {
    console.log('First doc _id time:', first[0]._id.getTimestamp());
    console.log('Last doc _id time:', last[0]._id.getTimestamp());
  }

  // Check if any document has 'convenio'
  const withConv = await col.findOne({ convenio: { $exists: true } });
  console.log('Any doc with convenio?', withConv ? withConv.convenio : 'NO');

  // Check if there are other collections in localhost:27017
  const cols = await c.db().listCollections().toArray();
  console.log('Collections in inventario_educativo (27017):', cols.map(x => x.name));

  await c.close();
}

checkTimestamps().catch(console.error);

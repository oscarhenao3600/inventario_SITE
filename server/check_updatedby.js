const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  // Let's see how many Carros have updatedAt or updatedBy
  const sampleCarros = await col.find({ dispositivo: 'Carro Cargador de Tabletas' }).limit(10).toArray();
  console.log('Sample Carros fields:', sampleCarros.map(x => ({
    placa: x.placa,
    inst: x.institucion,
    sede: x.sede,
    aula: x.aula,
    convenio: x.convenio,
    updatedBy: x.updatedBy,
    updatedAt: x.updatedAt
  })));

  // Are there Carros with updatedBy?
  const updatedByCount = await col.aggregate([
    { $match: { dispositivo: 'Carro Cargador de Tabletas' } },
    { $group: { _id: '$updatedBy', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Carros updatedBy distribution:', updatedByCount);

  // What about Pantallas?
  const panUpdatedBy = await col.aggregate([
    { $match: { dispositivo: 'Pantalla Interactiva Táctil' } },
    { $group: { _id: '$updatedBy', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Pantallas updatedBy distribution:', panUpdatedBy);

  await c.close();
}
run().catch(console.error);

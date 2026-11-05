const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  // Let's inspect where student tablets are
  const teByConv = await col.aggregate([
    { $match: { dispositivo: 'Tablet Para Estudiantes' } },
    { $group: { _id: '$convenio', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Tablets Estudiantes por convenio:', teByConv);

  // How many unique (inst, sede, aula) have student tablets?
  const teAulas = await col.aggregate([
    { $match: { dispositivo: 'Tablet Para Estudiantes' } },
    { $group: { _id: { inst: '$institucion', sede: '$sede', aula: '$aula' }, count: { $sum: 1 } } }
  ]).toArray();
  console.log('Total aulas con tablets de estudiantes:', teAulas.length);

  // How many unique (inst, sede, aula) have carros?
  const carAulas = await col.aggregate([
    { $match: { dispositivo: 'Carro Cargador de Tabletas' } },
    { $group: { _id: { inst: '$institucion', sede: '$sede', aula: '$aula' }, count: { $sum: 1 } } }
  ]).toArray();
  console.log('Total aulas con carros:', carAulas.length);

  // How many unique (inst, sede, aula) have pantallas?
  const panAulas = await col.aggregate([
    { $match: { dispositivo: 'Pantalla Interactiva Táctil' } },
    { $group: { _id: { inst: '$institucion', sede: '$sede', aula: '$aula' }, count: { $sum: 1 } } }
  ]).toArray();
  console.log('Total aulas con pantallas:', panAulas.length);

  await c.close();
}

run().catch(console.error);

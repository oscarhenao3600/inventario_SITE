const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const cartsWithNotes = await col.find({
    dispositivo: 'Carro Cargador de Tabletas',
    notas: { $exists: true, $ne: null, $ne: '' }
  }).toArray();

  console.log(`Carros con notas: ${cartsWithNotes.length}`);
  console.table(cartsWithNotes.map(x => ({
    placa: x.placa,
    serial: x.serial,
    inst: x.institucion,
    sede: x.sede,
    aula: x.aula,
    convenio: x.convenio,
    notas: x.notas
  })));

  await c.close();
}

run().catch(console.error);

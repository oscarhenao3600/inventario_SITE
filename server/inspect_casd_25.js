const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const casd25 = await col.find({
    institucion: 'CASD',
    convenio: '2025-001',
    dispositivo: 'Carro Cargador de Tabletas'
  }).toArray();

  console.table(casd25.map(d => ({
    placa: d.placa,
    serial: d.serial,
    sede: d.sede,
    aula: d.aula,
    convenio: d.convenio,
    notas: d.notas
  })));

  await c.close();
}

run().catch(console.error);

const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  for (const inst of ['SANTA TERESA DE JESUS', 'CIUDADELA DEL SUR', 'CASD', 'NORMAL SUPERIOR']) {
    console.log(`\n=================== CARROS EN ${inst} ===================`);
    const carros = await col.find({ institucion: inst, dispositivo: 'Carro Cargador de Tabletas' }).toArray();
    console.table(carros.map(x => ({
      placa: x.placa,
      serial: x.serial,
      sede: x.sede,
      aula: x.aula,
      convenio: x.convenio
    })));
  }

  await c.close();
}

run().catch(console.error);

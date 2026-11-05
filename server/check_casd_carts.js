const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const casdCarros25 = await col.find({
    institucion: 'CASD',
    dispositivo: 'Carro Cargador de Tabletas',
    convenio: '2025-001'
  }).toArray();

  console.log(`CASD Carros en 2025-001 (${casdCarros25.length}):`);
  console.table(casdCarros25.map(x => ({
    placa: x.placa,
    serial: x.serial,
    modelo: x.modelo,
    sede: x.sede,
    aula: x.aula,
    fecha: x.fecha,
    updatedBy: x.updatedBy
  })));

  // And what are the screens in CASD in those same aulas?
  const aulas = [...new Set(casdCarros25.map(x => `${x.sede}|||${x.aula}`))];
  console.log('\nDispositivos en esas mismas aulas en CASD:');
  for (const a of aulas.slice(0, 10)) {
    const [sede, aula] = a.split('|||');
    const devs = await col.find({ institucion: 'CASD', sede, aula }).toArray();
    console.log(`Aula: ${sede} - ${aula} ->`, devs.map(d => `${d.dispositivo} (${d.convenio})`));
  }

  await c.close();
}

run().catch(console.error);

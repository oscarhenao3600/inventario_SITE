const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  // Check carts with 'asignar' in placa
  const asignarCarts = await col.find({
    dispositivo: 'Carro Cargador de Tabletas',
    placa: { $regex: /asignar/i }
  }).toArray();
  console.log(`Carros con placa por asignar: ${asignarCarts.length}`);
  console.table(asignarCarts.map(x => ({
    placa: x.placa,
    serial: x.serial,
    inst: x.institucion,
    sede: x.sede,
    aula: x.aula,
    convenio: x.convenio
  })));

  // Check carts in Rectoria / administrative locations
  const adminCarts = await col.find({
    dispositivo: 'Carro Cargador de Tabletas',
    aula: { $regex: /rector|coord|admin|bodeg/i }
  }).toArray();
  console.log(`\nCarros en ubicaciones administrativas: ${adminCarts.length}`);
  console.table(adminCarts.map(x => ({
    placa: x.placa,
    serial: x.serial,
    inst: x.institucion,
    sede: x.sede,
    aula: x.aula,
    convenio: x.convenio
  })));

  await c.close();
}

run().catch(console.error);

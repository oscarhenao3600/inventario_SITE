const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const casdCarts = await col.find({ institucion: 'CASD', dispositivo: 'Carro Cargador de Tabletas' }).toArray();
  console.log(`CASD total carros: ${casdCarts.length}`);
  
  const byConv = {};
  for (const cart of casdCarts) {
    byConv[cart.convenio] = (byConv[cart.convenio] || 0) + 1;
  }
  console.log('CASD carros por convenio:', byConv);

  console.log('\nCASD carros con convenio 2025-001:');
  const c25 = casdCarts.filter(c => c.convenio === '2025-001');
  for (const cart of c25) {
    // find what else is in this aula
    const other = await col.find({
      institucion: 'CASD',
      sede: cart.sede,
      aula: cart.aula
    }).toArray();

    const screens = other.filter(d => d.dispositivo === 'Pantalla Interactiva Táctil');
    const te = other.filter(d => d.dispositivo === 'Tablet Para Estudiantes');

    console.log(`Placa: ${cart.placa}, Sede: ${cart.sede}, Aula: ${cart.aula} -> Pantallas: [${screens.map(s => s.convenio).join(',')}], TE: [${te.length} total, convs: ${[...new Set(te.map(t => t.convenio))].join(',')}]`);
  }

  await c.close();
}

run().catch(console.error);

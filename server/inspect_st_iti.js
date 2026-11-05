const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  for (const inst of ['SANTA TERESA DE JESUS', 'ITI']) {
    console.log(`\n=================== ${inst} ===================`);
    const carts = await col.find({
      institucion: inst,
      convenio: { $in: ['2022-006', '2024-001'] },
      dispositivo: 'Carro Cargador de Tabletas'
    }).toArray();

    for (const cart of carts) {
      const other = await col.find({
        institucion: inst,
        sede: cart.sede,
        aula: cart.aula
      }).toArray();

      const screens = other.filter(d => d.dispositivo === 'Pantalla Interactiva Táctil');
      const te = other.filter(d => d.dispositivo === 'Tablet Para Estudiantes');

      console.log(`Placa: ${cart.placa.padEnd(8)} | Sede: ${cart.sede.padEnd(25)} | Aula: ${cart.aula.padEnd(20)} | Conv: ${cart.convenio} | Screens: [${screens.map(s => s.convenio).join(',')}] | TE: ${te.length} (convs: ${[...new Set(te.map(t=>t.convenio))].join(',')}) | Notas: ${cart.notas || ''}`);
    }
  }

  await c.close();
}

run().catch(console.error);

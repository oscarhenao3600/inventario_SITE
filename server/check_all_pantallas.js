const { MongoClient } = require('mongodb');

async function checkAllPantallas() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const multi = await col.aggregate([
      { $match: { dispositivo: 'Pantalla Interactiva Táctil' } },
      {
        $group: {
          _id: { inst: '$institucion', sede: '$sede', aula: '$aula' },
          count: { $sum: 1 },
          pantallas: { $push: { placa: '$placa', serial: '$serial', conv: '$convenio', notas: '$notas' } }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();

    console.log(`Aulas with >1 pantalla: ${multi.length}`);
    for (const m of multi) {
      console.log(`\n${m._id.inst} | ${m._id.sede} | ${m._id.aula} (Count: ${m.count}):`);
      console.log(m.pantallas);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkAllPantallas();

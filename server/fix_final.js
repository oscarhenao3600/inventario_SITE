const { MongoClient } = require('mongodb');

async function fixFinal() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // 1. La Adiela: Mover AULA 2 de vuelta a LA CECILIA
  await col.updateMany(
    { institucion: 'LA ADIELA', aula: 'AULA 2', convenio: '2022-006' },
    { $set: { sede: 'LA CECILIA' } }
  );

  // 2. Normal Superior: 1 aula en ESCUELA NORMAL SUPERIOR pasa de 2022-006 a 2024-001
  const ens2022 = await col.findOne({
    institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO',
    sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO',
    convenio: '2022-006',
    dispositivo: 'Pantalla Interactiva Táctil'
  });
  if (ens2022) {
    console.log('Moviendo aula de ENS de 2022 a 2024:', ens2022.aula);
    await col.updateMany(
      { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', aula: ens2022.aula, convenio: '2022-006' },
      { $set: { convenio: '2024-001' } }
    );
  }

  await client.close();
}

fixFinal().catch(console.error);

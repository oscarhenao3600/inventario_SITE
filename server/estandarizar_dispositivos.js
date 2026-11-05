const { MongoClient } = require('mongodb');

async function standardizeDeviceNames() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('--- Estandarizando nombres de tipos de dispositivos ---');
  await col.updateMany(
    { dispositivo: 'Servidor' },
    { $set: { dispositivo: 'Servidor Portable de Aula SITE Sistema Cloud' } }
  );
  await col.updateMany(
    { dispositivo: 'Soporte Móvil' },
    { $set: { dispositivo: 'Soporte Electrónico Pantalla Interactiva Táctil' } }
  );
  await col.updateMany(
    { dispositivo: 'Carro de Carga' },
    { $set: { dispositivo: 'Carro Cargador de Tabletas' } }
  );
  await col.updateMany(
    { dispositivo: 'Tablets Para Estudiantes' },
    { $set: { dispositivo: 'Tablet Para Estudiantes' } }
  );

  console.log('Completado.');
  await client.close();
}

standardizeDeviceNames().catch(console.error);

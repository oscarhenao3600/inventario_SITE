const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const collection = db.collection('dispositivos');

    // 1. Total devices
    const totalDevices = await collection.countDocuments({});
    console.log(`Total devices: ${totalDevices}`);

    // 2. Distinct convenios
    const distinctConvenios = await collection.distinct('convenio');
    console.log('Distinct convenios:', distinctConvenios);

    // 3. Devices with empty or missing convenio
    const emptyConvenioCount = await collection.countDocuments({
      $or: [
        { convenio: null },
        { convenio: '' },
        { convenio: { $exists: false } }
      ]
    });
    console.log(`Devices with empty or missing convenio: ${emptyConvenioCount}`);

    // 4. Distinct device types
    const distinctDevices = await collection.distinct('dispositivo');
    console.log('Distinct device types:', distinctDevices);

    // 5. Check counts for the target device types
    const targetTypes = [
      'Pantalla Interactiva Táctil',
      'Servidor Portable de Aula SITE Sistema Cloud',
      'Soporte Electrónico Pantalla Interactiva Táctil',
      'Carro Cargador de Tabletas',
      'Tablet Para Estudiantes'
    ];
    console.log('\nCounts of target device types:');
    for (const type of targetTypes) {
      const count = await collection.countDocuments({ dispositivo: type });
      const countEmpty = await collection.countDocuments({
        dispositivo: type,
        $or: [
          { convenio: null },
          { convenio: '' },
          { convenio: { $exists: false } }
        ]
      });
      console.log(`- "${type}": Total = ${count}, Missing Convenio = ${countEmpty}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();

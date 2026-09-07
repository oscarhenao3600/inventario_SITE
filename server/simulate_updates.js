const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const collection = db.collection('dispositivos');

    // Retrieve all devices
    console.log('Retrieving all devices from DB...');
    const devices = await collection.find({}).toArray();
    console.log(`Total retrieved: ${devices.length}`);

    // Group devices by institucion and aula
    const groups = {};
    for (const d of devices) {
      const inst = (d.institucion || '').trim();
      const aula = (d.aula || '').trim();
      const key = `${inst} ||| ${aula}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(d);
    }

    const groupKeys = Object.keys(groups);
    console.log(`Total unique groups (institucion + aula): ${groupKeys.length}`);

    let totalUpdatedSimulated = 0;
    let groupsWithMissing = 0;
    let groupsResolved = 0;
    let groupsUnresolved = 0;
    const unresolvedGroupsDetails = [];

    // Priority list of device types to search for a convenio
    const priorityList = [
      'Pantalla Interactiva Táctil',
      'Servidor Portable de Aula SITE Sistema Cloud',
      'Soporte Electrónico Pantalla Interactiva Táctil',
      'Carro Cargador de Tabletas',
      'Tablet Para Estudiantes'
    ];

    for (const key of groupKeys) {
      const groupDevices = groups[key];
      const hasMissing = groupDevices.some(d => !d.convenio || d.convenio.trim() === '');

      if (hasMissing) {
        groupsWithMissing++;
        
        // Find a valid convenio in this group using the priority list
        let foundConvenio = null;
        let foundSourceType = null;

        for (const type of priorityList) {
          const deviceOfType = groupDevices.find(d => 
            d.dispositivo === type && 
            d.convenio && 
            d.convenio.trim() !== ''
          );
          if (deviceOfType) {
            foundConvenio = deviceOfType.convenio.trim();
            foundSourceType = type;
            break;
          }
        }

        if (foundConvenio) {
          groupsResolved++;
          // Simulate update for all devices in this group that have empty convenio
          const toUpdate = groupDevices.filter(d => !d.convenio || d.convenio.trim() === '');
          totalUpdatedSimulated += toUpdate.length;
        } else {
          groupsUnresolved++;
          unresolvedGroupsDetails.push({
            groupKey: key,
            devices: groupDevices.map(d => ({
              dispositivo: d.dispositivo,
              convenio: d.convenio,
              placa: d.placa,
              serial: d.serial
            }))
          });
        }
      }
    }

    console.log('\nSimulation Results:');
    console.log(`Groups with missing convenios: ${groupsWithMissing}`);
    console.log(`Groups successfully resolved: ${groupsResolved}`);
    console.log(`Groups unresolved: ${groupsUnresolved}`);
    console.log(`Total devices to be updated: ${totalUpdatedSimulated}`);

    if (unresolvedGroupsDetails.length > 0) {
      console.log('\nFirst 5 unresolved groups details:');
      console.log(JSON.stringify(unresolvedGroupsDetails.slice(0, 5), null, 2));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();

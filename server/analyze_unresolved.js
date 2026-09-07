const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const collection = db.collection('dispositivos');

    const devices = await collection.find({}).toArray();

    // 1. Map of institution to set of existing agreements
    const instConvenios = {};
    // 2. Map of (institucion + sede) to set of existing agreements
    const sedeConvenios = {};

    for (const d of devices) {
      const inst = (d.institucion || '').trim();
      const sede = (d.sede || '').trim();
      const conv = (d.convenio || '').trim();

      if (conv) {
        if (!instConvenios[inst]) {
          instConvenios[inst] = new Set();
        }
        instConvenios[inst].add(conv);

        const sedeKey = `${inst} ||| ${sede}`;
        if (!sedeConvenios[sedeKey]) {
          sedeConvenios[sedeKey] = new Set();
        }
        sedeConvenios[sedeKey].add(conv);
      }
    }

    // Now analyze the unresolved groups from the previous simulation
    const groups = {};
    for (const d of devices) {
      const inst = (d.institucion || '').trim();
      const aula = (d.aula || '').trim();
      const key = `${inst} ||| ${aula}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    }

    const priorityList = [
      'Pantalla Interactiva Táctil',
      'Servidor Portable de Aula SITE Sistema Cloud',
      'Soporte Electrónico Pantalla Interactiva Táctil',
      'Carro Cargador de Tabletas',
      'Tablet Para Estudiantes'
    ];

    let unresolvedCount = 0;
    let unresolvedWithInstConvenio = 0;
    let unresolvedWithSedeConvenio = 0;

    for (const key of Object.keys(groups)) {
      const groupDevices = groups[key];
      const hasMissing = groupDevices.some(d => !d.convenio || d.convenio.trim() === '');
      if (!hasMissing) continue;

      // Try resolving via priority list within group
      let foundConvenio = null;
      for (const type of priorityList) {
        const deviceOfType = groupDevices.find(d => 
          d.dispositivo === type && 
          d.convenio && 
          d.convenio.trim() !== ''
        );
        if (deviceOfType) {
          foundConvenio = deviceOfType.convenio.trim();
          break;
        }
      }

      if (!foundConvenio) {
        unresolvedCount++;
        const inst = groupDevices[0].institucion.trim();
        const sede = groupDevices[0].sede.trim();
        const instConvs = instConvenios[inst] ? Array.from(instConvenios[inst]) : [];
        const sedeKey = `${inst} ||| ${sede}`;
        const sdConvs = sedeConvenios[sedeKey] ? Array.from(sedeConvenios[sedeKey]) : [];

        if (sdConvs.length > 0) {
          unresolvedWithSedeConvenio++;
        }
        if (instConvs.length > 0) {
          unresolvedWithInstConvenio++;
        }

        if (unresolvedCount <= 10) {
          console.log(`Unresolved group: "${key}"`);
          console.log(`  Sede: "${sede}"`);
          console.log(`  Sede convenios:`, sdConvs);
          console.log(`  Institution convenios:`, instConvs);
          console.log(`  Devices in this group:`, groupDevices.map(d => `${d.dispositivo} (conv: '${d.convenio}')`));
        }
      }
    }

    console.log(`\nTotal unresolved groups: ${unresolvedCount}`);
    console.log(`Unresolved groups that have at least one convenio in the same Sede: ${unresolvedWithSedeConvenio}`);
    console.log(`Unresolved groups that have at least one convenio in the same Institution: ${unresolvedWithInstConvenio}`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();

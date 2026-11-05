const { MongoClient } = require('mongodb');

async function auditClassrooms() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // Find all devices
    const all = await col.find({}).toArray();
    console.log(`Total devices retrieved: ${all.length}`);

    // Group by aula: inst ||| sede ||| aula
    const aulas = {};
    for (const d of all) {
      const inst = (d.institucion || '').trim();
      const sede = (d.sede || '').trim();
      const aula = (d.aula || '').trim();
      const key = `${inst} ||| ${sede} ||| ${aula}`;

      if (!aulas[key]) {
        aulas[key] = {
          inst,
          sede,
          aula,
          devices: [],
          pantallas: [],
          servidores: [],
          soportes: [],
          carros: [],
          docentes: [],
          estudiantes: [],
          mesas: [],
          sillas: []
        };
      }
      aulas[key].devices.push(d);
      if (d.dispositivo === 'Pantalla Interactiva Táctil') aulas[key].pantallas.push(d);
      else if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') aulas[key].servidores.push(d);
      else if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') aulas[key].soportes.push(d);
      else if (d.dispositivo === 'Carro Cargador de Tabletas') aulas[key].carros.push(d);
      else if (d.dispositivo === 'Tablet Para Docentes') aulas[key].docentes.push(d);
      else if (d.dispositivo === 'Tablet Para Estudiantes') aulas[key].estudiantes.push(d);
      else if (d.dispositivo === 'Mesa Interactiva Tactil') aulas[key].mesas.push(d);
      else if (d.dispositivo === 'Silla De Mesa interactiva') aulas[key].sillas.push(d);
    }

    const aulaKeys = Object.keys(aulas);
    console.log(`Total unique aulas/spaces: ${aulaKeys.length}`);

    // Let's inspect aulas with Pantallas
    const aulasWithPantalla = Object.values(aulas).filter(a => a.pantallas.length > 0);
    console.log(`Aulas with Pantalla: ${aulasWithPantalla.length}`);

    // Check count of Pantallas in each of these aulas
    const aulasMultiplePantallas = aulasWithPantalla.filter(a => a.pantallas.length > 1);
    console.log(`Aulas with >1 Pantalla: ${aulasMultiplePantallas.length}`);
    if (aulasMultiplePantallas.length > 0) {
      console.log('Aulas with >1 Pantalla:', aulasMultiplePantallas.map(a => `${a.inst} - ${a.sede} - ${a.aula} (${a.pantallas.length})`));
    }

    // Check aulas with Servidor but no Pantalla
    const aulasServNoPan = Object.values(aulas).filter(a => a.servidores.length > 0 && a.pantallas.length === 0);
    console.log(`Aulas with Servidor but no Pantalla: ${aulasServNoPan.length}`);
    if (aulasServNoPan.length > 0) {
      console.log('Aulas Servidor without Pantalla:', aulasServNoPan.map(a => `${a.inst} - ${a.sede} - ${a.aula} (serv: ${a.servidores.length})`));
    }

    // Check aulas with Soporte but no Pantalla
    const aulasSopNoPan = Object.values(aulas).filter(a => a.soportes.length > 0 && a.pantallas.length === 0);
    console.log(`Aulas with Soporte but no Pantalla: ${aulasSopNoPan.length}`);
    if (aulasSopNoPan.length > 0) {
      console.log('Aulas Soporte without Pantalla:', aulasSopNoPan.map(a => `${a.inst} - ${a.sede} - ${a.aula} (sop: ${a.soportes.length})`));
    }

    // Check aulas with Carro but no Pantalla
    const aulasCarroNoPan = Object.values(aulas).filter(a => a.carros.length > 0 && a.pantallas.length === 0);
    console.log(`Aulas with Carro but no Pantalla: ${aulasCarroNoPan.length}`);
    if (aulasCarroNoPan.length > 0) {
      console.log('Sample Aulas Carro without Pantalla:', aulasCarroNoPan.slice(0, 10).map(a => `${a.inst} - ${a.sede} - ${a.aula} (carros: ${a.carros.length}, est: ${a.estudiantes.length}, doc: ${a.docentes.length})`));
    }

    // Check aulas with Docente but no Pantalla
    const aulasDocNoPan = Object.values(aulas).filter(a => a.docentes.length > 0 && a.pantallas.length === 0);
    console.log(`Aulas with Docente but no Pantalla: ${aulasDocNoPan.length}`);
    console.log('Sample Aulas Docente without Pantalla:', aulasDocNoPan.slice(0, 10).map(a => `${a.inst} - ${a.sede} - ${a.aula} (doc: ${a.docentes.length})`));

    // Check aulas with Estudiantes but no Pantalla
    const aulasEstNoPan = Object.values(aulas).filter(a => a.estudiantes.length > 0 && a.pantallas.length === 0);
    console.log(`Aulas with Estudiantes but no Pantalla: ${aulasEstNoPan.length}`);
    console.log('Sample Aulas Estudiantes without Pantalla:', aulasEstNoPan.slice(0, 10).map(a => `${a.inst} - ${a.sede} - ${a.aula} (est: ${a.estudiantes.length})`));

    // Convenio consistency in aulas with Pantalla
    let mixedConvenioCount = 0;
    const mixedExamples = [];
    for (const a of aulasWithPantalla) {
      const pConv = a.pantallas[0].convenio;
      const mismatched = a.devices.filter(d => 
        ['Servidor Portable de Aula SITE Sistema Cloud', 'Soporte Electrónico Pantalla Interactiva Táctil', 'Carro Cargador de Tabletas', 'Tablet Para Docentes', 'Tablet Para Estudiantes'].includes(d.dispositivo) &&
        d.convenio !== pConv
      );
      if (mismatched.length > 0) {
        mixedConvenioCount++;
        if (mixedExamples.length < 10) {
          mixedExamples.push({
            aula: `${a.inst} | ${a.sede} | ${a.aula}`,
            pantallaConv: pConv,
            mismatchedDevices: mismatched.map(m => `${m.dispositivo} (conv: ${m.convenio})`)
          });
        }
      }
    }
    console.log(`\nAulas with Pantalla where other devices have a different convenio: ${mixedConvenioCount}`);
    console.log('Sample of mixed aulas:', JSON.stringify(mixedExamples, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

auditClassrooms();

const { MongoClient } = require('mongodb');

async function findSurplus2022() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // Find all devices in 2022-006
    const devs = await col.find({ convenio: '2022-006' }).toArray();

    // Group by aula
    const aulas = {};
    for (const d of devs) {
      const key = `${(d.institucion || '').trim()} ||| ${(d.sede || '').trim()} ||| ${(d.aula || '').trim()}`;
      if (!aulas[key]) aulas[key] = [];
      aulas[key].push(d);
    }

    console.log(`Total unique aulas with 2022-006 devices: ${Object.keys(aulas).length}`);

    // Check aulas with 2022-006 devices
    const aulaStats = [];
    for (const [key, list] of Object.entries(aulas)) {
      const [inst, sede, aula] = key.split(' ||| ');
      const pan = list.filter(d => d.dispositivo === 'Pantalla Interactiva Táctil');
      const ser = list.filter(d => d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud');
      const sop = list.filter(d => d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil');
      const carr = list.filter(d => d.dispositivo === 'Carro Cargador de Tabletas');
      const doc = list.filter(d => d.dispositivo === 'Tablet Para Docentes');
      const est = list.filter(d => d.dispositivo === 'Tablet Para Estudiantes');

      aulaStats.push({
        inst, sede, aula,
        pan: pan.length,
        ser: ser.length,
        sop: sop.length,
        carr: carr.length,
        doc: doc.length,
        est: est.length,
        total: list.length
      });
    }

    // Aulas with >1 pantalla in 2022-006
    console.log('Aulas with >1 pantalla in 2022:');
    console.table(aulaStats.filter(a => a.pan > 1));

    // Aulas with 0 pantalla but has other SITE elements in 2022
    console.log('Aulas with 0 pantalla but other 2022 SITE devices:');
    console.table(aulaStats.filter(a => a.pan === 0 && (a.ser > 0 || a.sop > 0 || a.carr > 0)));

    // Aulas with >1 carro in 2022
    console.log('Aulas with >1 carro in 2022:');
    console.table(aulaStats.filter(a => a.carr > 1));

    // Aulas with >1 docente in 2022
    console.log('Aulas with >1 docente in 2022:');
    console.table(aulaStats.filter(a => a.doc > 1));

    // Total counts
    const sumPan = aulaStats.reduce((s, a) => s + a.pan, 0);
    const sumSer = aulaStats.reduce((s, a) => s + a.ser, 0);
    const sumSop = aulaStats.reduce((s, a) => s + a.sop, 0);
    const sumCarr = aulaStats.reduce((s, a) => s + a.carr, 0);
    const sumDoc = aulaStats.reduce((s, a) => s + a.doc, 0);
    const sumEst = aulaStats.reduce((s, a) => s + a.est, 0);
    console.log({ sumPan, sumSer, sumSop, sumCarr, sumDoc, sumEst });

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

findSurplus2022();

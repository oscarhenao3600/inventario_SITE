const { MongoClient } = require('mongodb');

async function analyzeAllAulas() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const all = await col.find({}).toArray();

    // Group by inst ||| sede ||| aula
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
          devices: []
        };
      }
      aulas[key].devices.push(d);
    }

    console.log(`Total Aulas/Espacios en BD: ${Object.keys(aulas).length}`);

    // Let's analyze aulas that have SITE devices:
    // Pantalla, Servidor, Soporte, Carro, Tablet Docente, Tablet Estudiante
    const targetDevs = [
      'Pantalla Interactiva Táctil',
      'Servidor Portable de Aula SITE Sistema Cloud',
      'Soporte Electrónico Pantalla Interactiva Táctil',
      'Carro Cargador de Tabletas',
      'Tablet Para Docentes',
      'Tablet Para Estudiantes'
    ];

    const siteAulas = [];
    const nonSiteAulas = [];

    for (const [key, info] of Object.entries(aulas)) {
      const siteElements = info.devices.filter(d => targetDevs.includes(d.dispositivo));
      if (siteElements.length > 0) {
        siteAulas.push(info);
      } else {
        nonSiteAulas.push(info);
      }
    }

    console.log(`Aulas con elementos SITE: ${siteAulas.length}`);
    console.log(`Aulas solo con otros elementos (ej. mesas/sillas): ${nonSiteAulas.length}`);

    // In siteAulas, count devices by type and check for anomalies
    const anomalies = [];
    for (const a of siteAulas) {
      const pan = a.devices.filter(d => d.dispositivo === 'Pantalla Interactiva Táctil');
      const ser = a.devices.filter(d => d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud');
      const sop = a.devices.filter(d => d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil');
      const carr = a.devices.filter(d => d.dispositivo === 'Carro Cargador de Tabletas');
      const doc = a.devices.filter(d => d.dispositivo === 'Tablet Para Docentes');
      const est = a.devices.filter(d => d.dispositivo === 'Tablet Para Estudiantes');

      // Check convenios in this aula
      const convs = new Set(a.devices.filter(d => targetDevs.includes(d.dispositivo)).map(d => d.convenio));

      const isAnomaly = (
        pan.length !== ser.length ||
        pan.length !== sop.length ||
        pan.length > 1 ||
        ser.length > 1 ||
        sop.length > 1 ||
        carr.length > 1 ||
        convs.size > 1 ||
        (pan.length === 0 && (ser.length > 0 || sop.length > 0)) ||
        (pan.length > 0 && doc.length !== pan.length)
      );

      if (isAnomaly) {
        anomalies.push({
          inst: a.inst,
          sede: a.sede,
          aula: a.aula,
          pan: pan.length,
          ser: ser.length,
          sop: sop.length,
          carr: carr.length,
          doc: doc.length,
          est: est.length,
          convs: Array.from(convs).join(', '),
          panDevs: pan.map(p => ({ placa: p.placa, serial: p.serial, conv: p.convenio })),
          serDevs: ser.map(p => ({ placa: p.placa, serial: p.serial, conv: p.convenio })),
          sopDevs: sop.map(p => ({ placa: p.placa, serial: p.serial, conv: p.convenio })),
          carrDevs: carr.map(p => ({ placa: p.placa, serial: p.serial, conv: p.convenio })),
          docDevs: doc.map(p => ({ placa: p.placa, serial: p.serial, conv: p.convenio }))
        });
      }
    }

    console.log(`\nTotal aulas con alguna anomalía SITE: ${anomalies.length}`);
    console.log('\n--- MUESTRA DE PRIMERAS 15 ANOMALÍAS ---');
    console.log(JSON.stringify(anomalies.slice(0, 15), null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

analyzeAllAulas();

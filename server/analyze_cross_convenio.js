const { MongoClient } = require('mongodb');

async function analyzeCrossConvenioAulas() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const all = await col.find({}).toArray();

    // Group by aula
    const aulas = {};
    for (const d of all) {
      const key = `${(d.institucion || '').trim()} ||| ${(d.sede || '').trim()} ||| ${(d.aula || '').trim()}`;
      if (!aulas[key]) aulas[key] = [];
      aulas[key].push(d);
    }

    let countMixed = 0;
    const mixedDetails = [];

    for (const [key, devs] of Object.entries(aulas)) {
      const p = devs.find(d => d.dispositivo === 'Pantalla Interactiva Táctil');
      if (!p) continue;

      const pConv = p.convenio;
      const otherSite = devs.filter(d => 
        ['Servidor Portable de Aula SITE Sistema Cloud', 'Soporte Electrónico Pantalla Interactiva Táctil', 'Carro Cargador de Tabletas', 'Tablet Para Docentes', 'Tablet Para Estudiantes'].includes(d.dispositivo)
      );

      const hasDiffConv = otherSite.some(d => d.convenio !== pConv);
      if (hasDiffConv) {
        countMixed++;
        const convCounts = {};
        devs.forEach(d => {
          convCounts[d.convenio] = (convCounts[d.convenio] || 0) + 1;
        });
        mixedDetails.push({
          aula: key,
          pantallaConv: pConv,
          devCountsByConv: convCounts
        });
      }
    }

    console.log(`Total aulas with Pantalla: ${Object.values(aulas).filter(a => a.some(d => d.dispositivo === 'Pantalla Interactiva Táctil')).length}`);
    console.log(`Aulas with Pantalla where other devices have a DIFFERENT convenio: ${countMixed}`);
    console.log('Sample of 10 mixed aulas:');
    console.log(JSON.stringify(mixedDetails.slice(0, 10), null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

analyzeCrossConvenioAulas();

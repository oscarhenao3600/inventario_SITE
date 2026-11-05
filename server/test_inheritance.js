const { MongoClient } = require('mongodb');

async function testAulaInheritance() {
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

    // Determine convenio of each aula based on Pantalla
    // What if an aula doesn't have a Pantalla? Check other devices or most frequent
    const aulaConvenio = {};
    for (const [key, devs] of Object.entries(aulas)) {
      const pantalla = devs.find(d => d.dispositivo === 'Pantalla Interactiva Táctil');
      if (pantalla && pantalla.convenio) {
        aulaConvenio[key] = pantalla.convenio;
      } else {
        const servidor = devs.find(d => d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud');
        if (servidor && servidor.convenio) {
          aulaConvenio[key] = servidor.convenio;
        } else {
          // Most frequent non-empty convenio
          const counts = {};
          devs.forEach(d => {
            if (d.convenio) counts[d.convenio] = (counts[d.convenio] || 0) + 1;
          });
          const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
          aulaConvenio[key] = best ? best[0] : '';
        }
      }
    }

    // Now calculate totals by device and new convenio
    const simulatedCounts = {};
    for (const [key, devs] of Object.entries(aulas)) {
      const conv = aulaConvenio[key];
      for (const d of devs) {
        // Skip preschool if needed, or include all
        const composite = `${conv} ||| ${d.dispositivo}`;
        simulatedCounts[composite] = (simulatedCounts[composite] || 0) + 1;
      }
    }

    console.log('=== COUNTS IF ALL DEVICES IN AULA INHERIT AULA CONVENIO ===');
    console.table(Object.entries(simulatedCounts).map(([k, count]) => {
      const [convenio, dispositivo] = k.split(' ||| ');
      return { convenio, dispositivo, count };
    }).sort((a, b) => a.convenio.localeCompare(b.convenio) || a.dispositivo.localeCompare(b.dispositivo)));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

testAulaInheritance();

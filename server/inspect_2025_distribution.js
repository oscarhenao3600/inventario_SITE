const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();

  console.log('=== DISTRIBUCIÓN CONVENIO 2025-001 POR INSTITUCIÓN ===');
  const rows = [];
  for (const inst of insts) {
    const p25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Carro Cargador de Tabletas' });
    const te25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Tablet Para Estudiantes' });

    if (p25 > 0 || c25 > 0 || te25 > 0) {
      rows.push({
        Institucion: inst,
        Pantallas_25: p25,
        Carros_25: c25,
        Tablets_25: te25,
        Carts_From_Tablets: te25 / 30
      });
    }
  }

  console.table(rows);
  await c.close();
}

run().catch(console.error);

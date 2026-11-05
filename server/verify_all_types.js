const { MongoClient } = require('mongodb');

async function verifyAllTypes() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const convs = ['2022-006', '2024-001', '2025-001', 'SOBRANTE'];
  const types = [
    'Pantalla Interactiva Táctil',
    'Servidor Portable de Aula SITE Sistema Cloud',
    'Soporte Electrónico Pantalla Interactiva Táctil',
    'Tablet Para Docentes',
    'Tablet Para Estudiantes',
    'Carro Cargador de Tabletas'
  ];

  console.log("================ INVENTARIO GLOBAL COMPLETO POST-ACTUALIZACION ================");
  console.log("DISPOSITIVO".padEnd(48) + " | 2022-006 | 2024-001 | 2025-001 | SOBRANTE | TOTAL");
  console.log("-".repeat(95));

  for (const t of types) {
    const counts = {};
    let tot = 0;
    for (const c of convs) {
      const cnt = await col.countDocuments({ convenio: c, dispositivo: t });
      counts[c] = cnt;
      tot += cnt;
    }
    console.log(
      t.padEnd(48) + ` | ${String(counts['2022-006']).padStart(8)} | ${String(counts['2024-001']).padStart(8)} | ${String(counts['2025-001']).padStart(8)} | ${String(counts['SOBRANTE']).padStart(8)} | ${String(tot).padStart(6)}`
    );
  }

  // Also check total documents in collection
  const totalInDb = await col.countDocuments();
  console.log("-".repeat(95));
  console.log(`TOTAL GENERAL DOCUMENTOS EN BD: ${totalInDb}`);

  await client.close();
}

verifyAllTypes().catch(console.error);

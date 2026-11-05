const { MongoClient } = require('mongodb');

async function inspectRufinoSurAndMadre() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const docs = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    $or: [
      { institucion: /RUFINO/i },
      { institucion: /MADRE/i },
      { sede: /MADRE/i }
    ]
  }).toArray();

  console.log(`Encontradas ${docs.length} pantallas:`);
  const grouped = {};
  docs.forEach(d => {
    const k = `${d.convenio} | ${d.institucion} | ${d.sede}`;
    grouped[k] = (grouped[k] || 0) + 1;
  });
  console.log(grouped);

  // Check Rufino Jose Cuervo Sur specific screens:
  console.log("\nPantallas en RUFINO JOSE CUERVO SUR (sede RUFINO JOSE CUERVO SUR):");
  docs.filter(d => d.sede === 'RUFINO JOSE CUERVO SUR').forEach(d => {
    console.log(`  conv:${d.convenio} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`);
  });

  await client.close();
}

inspectRufinoSurAndMadre().catch(console.error);

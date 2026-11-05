const { MongoClient } = require('mongodb');

async function inspectSantaRita() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const d = await col.find({
    $or: [{ sede: /SANTA RITA/i }, { aula: /SANTA RITA/i }, { observaciones: /SANTA RITA/i }]
  }).toArray();
  console.log('Total Santa Rita docs:', d.length);
  const byDev = {};
  for (const x of d) {
    const k = `${x.convenio} | ${x.institucion} | ${x.sede} | ${x.aula} | ${x.dispositivo}`;
    byDev[k] = (byDev[k] || 0) + 1;
  }
  for (const [k, count] of Object.entries(byDev)) {
    console.log(`${k} => ${count}`);
  }

  console.log('\n--- Pantallas en Santa Rita ---');
  const screens = d.filter(x => x.dispositivo === 'Pantalla Interactiva Táctil');
  for (const s of screens) {
    console.log(`${s.convenio} | ${s.sede} | ${s.aula} | placa: ${s.placa} | serial: ${s.serial}`);
  }

  await client.close();
}

inspectSantaRita().catch(console.error);

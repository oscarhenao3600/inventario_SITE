const { MongoClient } = require('mongodb');

async function inspectNJMO8() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const docs = await col.find({
    institucion: 'NACIONAL JESUS MARIA OCAMPO',
    convenio: '2022-006'
  }).toArray();

  console.log(`Encontrados ${docs.length} registros en NJMO con convenio 2022-006:\n`);
  const grouped = {};
  docs.forEach(d => {
    const k = `${d.sede} | ${d.aula}`;
    if (!grouped[k]) grouped[k] = [];
    grouped[k].push({ disp: d.dispositivo, placa: d.placa, serial: d.serial });
  });

  for (const [loc, items] of Object.entries(grouped)) {
    console.log(`Ubicación: ${loc} (${items.length} items)`);
    items.forEach(i => console.log(`   ${i.disp} | placa:${i.placa} | serial:${i.serial}`));
  }

  await client.close();
}

inspectNJMO8().catch(console.error);

const { MongoClient } = require('mongodb');

async function checkRufinoSur() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log("=== RUFINO SUR PANTALLAS ===");
  const rs = await col.find({
    institucion: /RUFINO.*SUR/i,
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();
  
  const counts = {};
  rs.forEach(d => {
    const k = `${d.convenio} | ${d.institucion} | ${d.sede}`;
    counts[k] = (counts[k] || 0) + 1;
  });
  console.log(counts);

  console.log("=== TODOS LOS COMODINES (SIN SERIAL) EN PANTALLAS ===");
  const comodines = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    $or: [{ serial: null }, { serial: '' }, { serial: 'SIN SERIAL' }]
  }).toArray();
  console.log(`Total pantallas sin serial: ${comodines.length}`);
  comodines.forEach(c => console.log(`conv:${c.convenio} | inst:${c.institucion} | sede:${c.sede} | aula:${c.aula} | placa:${c.placa}`));

  console.log("=== PANTALLAS CON SERIAL IS / ISH / ISJ ===");
  const isScreens = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    serial: { $regex: /^IS/i }
  }).toArray();
  console.log(`Total pantallas IS*: ${isScreens.length}`);
  const isConv = {};
  isScreens.forEach(s => {
    isConv[s.convenio] = (isConv[s.convenio] || 0) + 1;
  });
  console.log("Distribución de IS* por convenio:", isConv);

  const isNot2022 = isScreens.filter(s => s.convenio !== '2022-006');
  console.log("IS* no en 2022-006:", isNot2022.map(s => ({ inst: s.institucion, sede: s.sede, aula: s.aula, placa: s.placa, conv: s.convenio, serial: s.serial })));

  await client.close();
}

checkRufinoSur().catch(console.error);

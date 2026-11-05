const { MongoClient } = require('mongodb');

async function comprehensiveAnalysis() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Let's inspect all classrooms in NJMO
  console.log('=== AULAS EN NACIONAL JESUS MARIA OCAMPO ===');
  const njmo = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    institucion: /OCAMPO/i
  }).toArray();
  for (const s of njmo) {
    console.log(`${s.convenio.padEnd(10)} | ${s.sede.padEnd(30)} | ${s.aula.padEnd(25)} | placa: ${s.placa.padEnd(8)} | serial: ${s.serial || '(SIN SERIAL)'}`);
  }

  // Let's inspect Gustavo Matamoros
  console.log('\n=== AULAS EN GUSTAVO MATAMOROS D´COSTA ===');
  const gm = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    institucion: /MATAMOROS/i
  }).toArray();
  console.log(`Total en Gustavo Matamoros: ${gm.length}`);
  const gmByConv = {};
  for (const s of gm) gmByConv[s.convenio] = (gmByConv[s.convenio] || 0) + 1;
  console.log('Por convenio:', gmByConv);

  await client.close();
}

comprehensiveAnalysis().catch(console.error);

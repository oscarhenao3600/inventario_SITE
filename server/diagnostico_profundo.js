const { MongoClient } = require('mongodb');

async function checkDetails() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  console.log('=== 1. CAMARA JUNIOR ===');
  const cj = await col.find({ institucion: 'CAMARA JUNIOR', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const c of cj) {
    console.log(`${c.convenio} | ${c.sede} | ${c.aula} | placa: ${c.placa}`);
  }

  console.log('\n=== 2. BOSQUES DE PINARES ===');
  const bp = await col.find({ institucion: 'BOSQUES DE PINARES', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const c of bp) {
    console.log(`${c.convenio} | ${c.sede} | ${c.aula} | placa: ${c.placa}`);
  }

  console.log('\n=== 3. CASD HERMOGENES MAZA (2024-001) ===');
  const casd = await col.find({ institucion: 'CASD HERMOGENES MAZA', convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const c of casd) {
    console.log(`${c.convenio} | ${c.sede} | ${c.aula} | placa: ${c.placa}`);
  }

  console.log('\n=== 4. ENRIQUE OLAYA HERRERA (2024-001) ===');
  const eoh = await col.find({ institucion: 'ENRIQUE OLAYA HERRERA', convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const c of eoh) {
    console.log(`${c.convenio} | ${c.sede} | ${c.aula} | placa: ${c.placa}`);
  }

  console.log('\n=== 5. EL CAIMO (2024-001) ===');
  const caimo = await col.find({ institucion: 'EL CAIMO', convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const c of caimo) {
    console.log(`${c.convenio} | ${c.sede} | ${c.aula} | placa: ${c.placa}`);
  }

  console.log('\n=== 6. NORMAL SUPERIOR ===');
  const ens = await col.find({ institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const c of ens) {
    console.log(`${c.convenio} | ${c.sede} | ${c.aula} | placa: ${c.placa}`);
  }

  console.log('\n=== 7. CIUDADELA DEL SUR ===');
  const cs = await col.find({ institucion: 'CIUDADELA DEL SUR', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const c of cs) {
    console.log(`${c.convenio} | ${c.sede} | ${c.aula} | placa: ${c.placa}`);
  }

  console.log('\n=== 8. NJMO & BELEN (2025-001) ===');
  const njmo = await col.find({ institucion: { $in: ['NACIONAL JESUS MARIA OCAMPO', 'NUESTRA SEÑORA DE BELEN'] }, convenio: '2025-001', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const c of njmo) {
    console.log(`${c.convenio} | ${c.institucion} | ${c.sede} | ${c.aula} | placa: ${c.placa}`);
  }

  await client.close();
}

checkDetails().catch(console.error);

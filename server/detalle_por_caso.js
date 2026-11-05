const { MongoClient } = require('mongodb');

async function inspectCases() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  console.log('--- 1. CAMARA JUNIOR (CIUDAD MILAGRO) ---');
  const cm = await col.find({
    institucion: 'CAMARA JUNIOR',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.table(cm);

  console.log('--- 2. BOSQUES DE PINARES ---');
  const bp = await col.find({
    institucion: 'BOSQUES DE PINARES',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.table(bp);

  console.log('--- 3. CASD HERMOGENES MAZA en 2024-001 ---');
  const casd = await col.find({
    institucion: 'CASD HERMOGENES MAZA',
    convenio: '2024-001',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.table(casd);

  console.log('--- 4. ENRIQUE OLAYA HERRERA en 2024-001 ---');
  const eoh = await col.find({
    institucion: 'ENRIQUE OLAYA HERRERA',
    convenio: '2024-001',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.table(eoh);

  console.log('--- 5. EL CAIMO en 2024-001 ---');
  const caimo = await col.find({
    institucion: 'EL CAIMO',
    convenio: '2024-001',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.table(caimo);

  console.log('--- 6. NORMAL SUPERIOR en 2022, 2024, 2025 ---');
  const ens = await col.find({
    institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.table(ens);

  console.log('--- 7. CIUDADELA DEL SUR en 2022, 2024, 2025 ---');
  const cs = await col.find({
    institucion: 'CIUDADELA DEL SUR',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.table(cs);

  console.log('--- 8. NJMO & BELEN en 2025 ---');
  const njmo = await col.find({
    institucion: { $in: ['NACIONAL JESUS MARIA OCAMPO', 'NUESTRA SEÑORA DE BELEN'] },
    convenio: '2025-001',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).project({ convenio: 1, institucion: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.table(njmo);

  console.log('--- 9. LA ADIELA & SANTA TERESA ---');
  const adiela = await col.find({
    institucion: 'LA ADIELA',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.table(adiela);

  const teresa = await col.find({
    institucion: 'SANTA TERESA DE JESUS',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.table(teresa);

  await client.close();
}

inspectCases().catch(console.error);

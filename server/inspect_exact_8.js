const { MongoClient } = require('mongodb');

async function inspectExact8() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('--- 1. SANTA TERESA DE JESUS (todas las pantallas) ---');
  const st = await col.find({ institucion: /SANTA TERESA/i, dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const s of st) console.log(`${s.convenio} | ${s.sede} | ${s.aula} | placa: ${s.placa} | serial: ${s.serial}`);

  console.log('\n--- 2. CIUDADELA DE OCCIDENTE (todas las pantallas 2024) ---');
  const occ = await col.find({ institucion: /OCCIDENTE/i, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log(`Total Occidente 2024: ${occ.length}`);

  console.log('\n--- 3. MADRE MARCELINA & RUFINO SUR (todas las pantallas 2022) ---');
  const mm = await col.find({
    $or: [{ institucion: /MADRE MARCELINA/i }, { institucion: /RUFINO/i, sede: /MARCELINA/i }],
    convenio: '2022-006',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();
  for (const s of mm) console.log(`${s.convenio} | ${s.institucion} | ${s.sede} | ${s.aula} | placa: ${s.placa}`);

  console.log('\n--- 4. RUFINO CENTRO (todas las pantallas) ---');
  const rc = await col.find({ institucion: /RUFINO.*CENTRO/i, dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log(`Total Rufino Centro: ${rc.length}`);
  const rcByConv = {};
  for (const s of rc) rcByConv[s.convenio + ' | ' + s.sede] = (rcByConv[s.convenio + ' | ' + s.sede] || 0) + 1;
  console.log(rcByConv);

  console.log('\n--- 5. ITI (todas las pantallas) ---');
  const iti = await col.find({ institucion: /INDUSTRIAL/i, dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log(`Total ITI: ${iti.length}`);
  const itiByConv = {};
  for (const s of iti) itiByConv[s.convenio + ' | ' + s.sede] = (itiByConv[s.convenio + ' | ' + s.sede] || 0) + 1;
  console.log(itiByConv);

  console.log('\n--- 6. LA ADIELA (todas las pantallas 2022) ---');
  const adiela = await col.find({ institucion: /ADIELA/i, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const s of adiela) console.log(`${s.convenio} | ${s.sede} | ${s.aula} | placa: ${s.placa}`);

  console.log('\n--- 7. CIUDADELA DEL SUR (todas las pantallas 2022 en sede Ciudadela del Sur) ---');
  const cs = await col.find({ institucion: /CIUDADELA DEL SUR/i, sede: 'CIUDADELA DEL SUR', convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  for (const s of cs) console.log(`${s.convenio} | ${s.sede} | ${s.aula} | placa: ${s.placa}`);

  await client.close();
}

inspectExact8().catch(console.error);

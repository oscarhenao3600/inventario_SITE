const { MongoClient } = require('mongodb');

async function checkDetails() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log("=== RUFINO JOSE CUERVO CENTRO ===");
  const rufino = await col.find({ institucion: 'RUFINO JOSE CUERVO CENTRO', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const rufConv = {};
  rufino.forEach(d => {
    const k = `${d.convenio} | ${d.sede}`;
    rufConv[k] = (rufConv[k] || 0) + 1;
  });
  console.log(rufConv);
  // Any in 2024-001?
  const ruf2024 = rufino.filter(d => d.convenio === '2024-001');
  console.log("Rufino en 2024-001 count:", ruf2024.length, ruf2024.map(d => ({ placa: d.placa, sede: d.sede, aula: d.aula, serial: d.serial })));

  console.log("\n=== INSTITUTO TECNICO INDUSTRIAL ===");
  const iti = await col.find({ institucion: 'INSTITUTO TECNICO INDUSTRIAL', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const itiConv = {};
  iti.forEach(d => {
    const k = `${d.convenio} | ${d.sede}`;
    itiConv[k] = (itiConv[k] || 0) + 1;
  });
  console.log(itiConv);
  const iti2024 = iti.filter(d => d.convenio === '2024-001');
  console.log("ITI en 2024-001 count:", iti2024.length, iti2024.map(d => ({ placa: d.placa, sede: d.sede, aula: d.aula, serial: d.serial })));

  console.log("\n=== MADRE MARCELINA ===");
  const mm = await col.find({ $or: [{ institucion: /MADRE MARCELINA/i }, { sede: /MADRE MARCELINA/i }], dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const mmConv = {};
  mm.forEach(d => {
    const k = `${d.convenio} | ${d.institucion} | ${d.sede}`;
    mmConv[k] = (mmConv[k] || 0) + 1;
  });
  console.log(mmConv);
  console.log("Todos los de Madre Marcelina:");
  mm.forEach(d => console.log(`  inst:${d.institucion} | conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== SANTA TERESA DE JESUS ===");
  const st = await col.find({ institucion: 'SANTA TERESA DE JESUS', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const stConv = {};
  st.forEach(d => {
    const k = `${d.convenio} | ${d.sede}`;
    stConv[k] = (stConv[k] || 0) + 1;
  });
  console.log(stConv);
  console.log("Santa Teresa pantallas:");
  st.forEach(d => console.log(`  conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== LA ADIELA ===");
  const adiela = await col.find({ institucion: 'LA ADIELA', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const adConv = {};
  adiela.forEach(d => {
    const k = `${d.convenio} | ${d.sede}`;
    adConv[k] = (adConv[k] || 0) + 1;
  });
  console.log(adConv);
  console.log("La Adiela pantallas:");
  adiela.forEach(d => console.log(`  conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== CIUDADELA DE OCCIDENTE ===");
  const occ = await col.find({ institucion: 'CIUDADELA DE OCCIDENTE', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const occConv = {};
  occ.forEach(d => {
    const k = `${d.convenio} | ${d.sede}`;
    occConv[k] = (occConv[k] || 0) + 1;
  });
  console.log(occConv);
  console.log("Occidente pantallas:");
  occ.forEach(d => console.log(`  conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== CIUDADELA DEL SUR (2022-006 sede Ciudadela del Sur) ===");
  const sur = await col.find({ institucion: 'CIUDADELA DEL SUR', sede: 'CIUDADELA DEL SUR', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const surConv = {};
  sur.forEach(d => {
    const k = `${d.convenio} | ${d.sede}`;
    surConv[k] = (surConv[k] || 0) + 1;
  });
  console.log(surConv);

  await client.close();
}

checkDetails().catch(console.error);

const { MongoClient } = require('mongodb');

async function check() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log("=== RUFINO JOSE CUERVO CENTRO ===");
  const rufino = await col.find({ institucion: 'RUFINO JOSE CUERVO CENTRO', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  rufino.forEach(d => console.log(`conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== INSTITUTO TECNICO INDUSTRIAL ===");
  const iti = await col.find({ institucion: 'INSTITUTO TECNICO INDUSTRIAL', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  iti.forEach(d => console.log(`conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== MADRE MARCELINA ===");
  const mm = await col.find({ $or: [{ institucion: /MADRE MARCELINA/i }, { sede: /MADRE MARCELINA/i }], dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  mm.forEach(d => console.log(`inst:${d.institucion} | conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== SANTA TERESA DE JESUS ===");
  const st = await col.find({ institucion: 'SANTA TERESA DE JESUS', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  st.forEach(d => console.log(`conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== LA ADIELA ===");
  const adiela = await col.find({ institucion: 'LA ADIELA', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  adiela.forEach(d => console.log(`conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== CIUDADELA DE OCCIDENTE ===");
  const occ = await col.find({ institucion: 'CIUDADELA DE OCCIDENTE', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  occ.forEach(d => console.log(`conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== CIUDADELA DEL SUR ===");
  const sur = await col.find({ institucion: 'CIUDADELA DEL SUR', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  sur.forEach(d => console.log(`conv:${d.convenio} | sede:${d.sede} | aula:${d.aula} | placa:${d.placa} | serial:${d.serial}`));

  await client.close();
}

check().catch(console.error);

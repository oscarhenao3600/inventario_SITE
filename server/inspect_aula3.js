const { MongoClient } = require('mongodb');

async function inspectAula3() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log("=== Dispositivos en aula: AULA 3 en Madre Marcelina ===");
  const a3 = await col.find({ sede: 'MADRE MARCELINA', aula: 'AULA 3' }).toArray();
  a3.forEach(d => console.log(`conv:${d.convenio} | inst:${d.institucion} | sede:${d.sede} | disp:${d.dispositivo} | placa:${d.placa} | serial:${d.serial}`));

  console.log("\n=== Dispositivos en aula: TECNOLOGIA 2 en Rufino Sur ===");
  const tec2 = await col.find({ aula: 'TECNOLOGIA 2' }).toArray();
  tec2.forEach(d => console.log(`conv:${d.convenio} | inst:${d.institucion} | sede:${d.sede} | disp:${d.dispositivo} | placa:${d.placa} | serial:${d.serial}`));

  await client.close();
}

inspectAula3().catch(console.error);

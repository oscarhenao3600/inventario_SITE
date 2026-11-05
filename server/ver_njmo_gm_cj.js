const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  console.log('=== NJMO 2022-006 ===');
  const njmo = await col.find({ institucion: /OCAMPO/i, convenio: '2022-006' }).toArray();
  for (const d of njmo) {
    console.log(`Sede: ${String(d.sede || '').padEnd(20)} | Aula: ${String(d.aula || '').padEnd(20)} | Placa: ${String(d.placa || '').padEnd(12)} | Serial: ${String(d.serial || '').padEnd(16)} | Disp: ${d.dispositivo}`);
  }

  console.log('\n=== GUSTAVO MATAMOROS 2022-006 ===');
  const gm = await col.find({ institucion: /MATAMOROS/i, convenio: '2022-006' }).toArray();
  for (const d of gm) {
    if (d.dispositivo === 'Pantalla Interactiva Táctil') {
      console.log(`Sede: ${String(d.sede || '').padEnd(20)} | Aula: ${String(d.aula || '').padEnd(20)} | Placa: ${String(d.placa || '').padEnd(12)} | Serial: ${String(d.serial || '').padEnd(16)} | Disp: ${d.dispositivo}`);
    }
  }

  console.log('\n=== CAMARA JUNIOR 2022-006 ===');
  const cj = await col.find({ institucion: /CAMARA JUNIOR/i, convenio: '2022-006' }).toArray();
  const cjBySede = {};
  for (const d of cj) {
    if (!cjBySede[d.sede]) cjBySede[d.sede] = { pan: 0, ser: 0, sop: 0, car: 0, doc: 0, est: 0 };
    if (d.dispositivo === 'Pantalla Interactiva Táctil') cjBySede[d.sede].pan++;
    else if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') cjBySede[d.sede].ser++;
    else if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') cjBySede[d.sede].sop++;
    else if (d.dispositivo === 'Carro Cargador de Tabletas') cjBySede[d.sede].car++;
    else if (d.dispositivo === 'Tablet Para Docentes') cjBySede[d.sede].doc++;
    else if (d.dispositivo === 'Tablet Para Estudiantes') cjBySede[d.sede].est++;
  }
  console.table(cjBySede);

  await client.close();
}

main();

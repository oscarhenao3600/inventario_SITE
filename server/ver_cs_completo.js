const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const cs = await col.find({ institucion: /CIUDADELA DEL SUR/i }).toArray();
  console.log(`Total dispositivos en CIUDADELA DEL SUR: ${cs.length}`);

  const bySedeConv = {};
  for (const d of cs) {
    const k = `${d.sede} - Conv: ${d.convenio}`;
    if (!bySedeConv[k]) bySedeConv[k] = { pan: 0, ser: 0, sop: 0, car: 0, doc: 0, est: 0 };
    if (d.dispositivo === 'Pantalla Interactiva Táctil') bySedeConv[k].pan++;
    else if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') bySedeConv[k].ser++;
    else if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') bySedeConv[k].sop++;
    else if (d.dispositivo === 'Carro Cargador de Tabletas') bySedeConv[k].car++;
    else if (d.dispositivo === 'Tablet Para Docentes') bySedeConv[k].doc++;
    else if (d.dispositivo === 'Tablet Para Estudiantes') bySedeConv[k].est++;
  }
  console.table(bySedeConv);

  await client.close();
}

main();

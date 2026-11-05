const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  // Let's print out 2022-006 results specifically
  const allDocs = await col.find({}).toArray();

  function getCounts(conv) {
    const map = {};
    for (const d of allDocs) {
      if (d.convenio !== conv) continue;
      const key = `${d.institucion} ||| ${d.sede}`;
      if (!map[key]) {
        map[key] = {
          institucion: d.institucion,
          sede: d.sede,
          pantallas: 0,
          servidores: 0,
          soportes: 0,
          carros: 0,
          docentes: 0,
          estudiantes: 0
        };
      }
      if (d.dispositivo === 'Pantalla Interactiva Táctil') map[key].pantallas++;
      else if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') map[key].servidores++;
      else if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') map[key].soportes++;
      else if (d.dispositivo === 'Carro Cargador de Tabletas') map[key].carros++;
      else if (d.dispositivo === 'Tablet Para Docentes') map[key].docentes++;
      else if (d.dispositivo === 'Tablet Para Estudiantes') map[key].estudiantes++;
    }
    return map;
  }

  console.log('=== CONTEOS REALES EN BD 2022-006 ===');
  console.table(Object.values(getCounts('2022-006')).map(x => ({
    institucion: x.institucion,
    sede: x.sede,
    pan: x.pantallas,
    ser: x.servidores,
    sop: x.soportes,
    car: x.carros,
    doc: x.docentes,
    est: x.estudiantes
  })));

  await client.close();
}

main();

const { MongoClient } = require('mongodb');

async function checkAffectedAulas() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const placas = ['37721', '28272', '40086', '40066', '34311', '41665', '44581', '19574', '20851'];
  
  for (const p of placas) {
    const d = await col.findOne({ placa: p });
    console.log(`\n---------------- PLACA ${p} ----------------`);
    if (!d) {
      console.log('NO ENCONTRADA');
      continue;
    }
    console.log(`Pantalla: conv:${d.convenio} | inst:${d.institucion} | sede:${d.sede} | aula:${d.aula} | serial:${d.serial}`);
    
    // Buscar todos los dispositivos en la misma aula/sede/institución
    const inAula = await col.find({
      institucion: d.institucion,
      sede: d.sede,
      aula: d.aula
    }).toArray();
    
    const summary = {};
    inAula.forEach(x => {
      const k = `${x.convenio} - ${x.dispositivo}`;
      summary[k] = (summary[k] || 0) + 1;
    });
    console.log(`Dispositivos en aula '${d.aula}' (${inAula.length} total):`, summary);
  }

  await client.close();
}

checkAffectedAulas().catch(console.error);

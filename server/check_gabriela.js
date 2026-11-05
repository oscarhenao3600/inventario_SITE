const { MongoClient } = require('mongodb');

async function checkGabriela() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const docs = await col.find({
    institucion: 'ENRIQUE OLAYA HERRERA',
    sede: 'GABRIELA MISTRAL'
  }).toArray();

  console.log(`Dispositivos en Gabriela Mistral: ${docs.length}`);
  const byDisp = {};
  for (const d of docs) {
    byDisp[d.dispositivo] = (byDisp[d.dispositivo] || 0) + 1;
    if (d.aula === 'SALA DE COMPUTO') {
      console.log(`Sala de Cómputo: ${d.dispositivo} - Placa: ${d.placa} - Serial: ${d.serial} - Conv: ${d.convenio}`);
    }
  }
  console.log(byDisp);

  await client.close();
}

checkGabriela().catch(console.error);

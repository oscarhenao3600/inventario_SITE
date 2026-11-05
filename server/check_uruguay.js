const { MongoClient } = require('mongodb');

async function checkUruguayAulas() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const devs = await col.find({
      institucion: 'NORMAL SUPERIOR',
      sede: 'REPUBLICA DE URUGUAY',
      aula: { $in: ['AULA 4', 'AULA 5'] }
    }).toArray();

    console.table(devs.map(d => ({
      aula: d.aula,
      dispositivo: d.dispositivo,
      placa: d.placa,
      serial: d.serial,
      convenio: d.convenio
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkUruguayAulas();

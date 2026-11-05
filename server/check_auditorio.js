const { MongoClient } = require('mongodb');

async function checkAuditorio() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const devs = await col.find({
      institucion: 'CIUDADELA DEL SUR',
      aula: 'AUDITORIO'
    }).toArray();

    console.log('Devices in CIUDADELA DEL SUR -> AUDITORIO:');
    console.table(devs.map(d => ({
      dispositivo: d.dispositivo,
      placa: d.placa,
      serial: d.serial,
      convenio: d.convenio,
      notas: d.notas
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkAuditorio();

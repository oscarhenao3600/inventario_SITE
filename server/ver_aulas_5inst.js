const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const insts = ['GUSTAVO MATAMOROS', 'CAMARA JUNIOR', 'BOSQUES DE PINARES', 'EL CAIMO', 'ENRIQUE OLAYA HERRERA'];

  for (const instPattern of insts) {
    console.log(`\n======================================================`);
    console.log(`INSTITUCIÓN: ${instPattern}`);
    console.log(`======================================================`);
    const docs = await col.find({
      institucion: new RegExp(instPattern, 'i'),
      dispositivo: 'Pantalla Interactiva Táctil'
    }).toArray();

    const bySede = {};
    for (const d of docs) {
      const k = `${d.sede} | ${d.aula}`;
      if (!bySede[k]) bySede[k] = { conv: d.convenio, placa: d.placa, serial: d.serial, notas: d.notas };
    }
    console.table(Object.entries(bySede).map(([k, v]) => ({
      sede_aula: k,
      convenio: v.conv,
      placa: v.placa,
      serial: v.serial,
      notas: v.notas
    })));
  }

  await client.close();
}

main();

const { MongoClient } = require('mongodb');

async function showCurrentTable() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const insts = await col.distinct('institucion');
  insts.sort();

  console.log("INSTITUCION                  | CONVENIO | PANTALLAS | SERVIDORES | SOPORTES | TAB_DOCENTE");
  console.log("---------------------------------------------------------------------------------------");

  for (const inst of insts) {
    for (const conv of ['2022-006', '2024-001', '2025-001']) {
      const p = await col.countDocuments({ institucion: inst, convenio: conv, dispositivo: 'Pantalla Interactiva Táctil' });
      const srv = await col.countDocuments({ institucion: inst, convenio: conv, dispositivo: 'Servidor Portable de Aula SITE Sistema Cloud' });
      const sop = await col.countDocuments({ institucion: inst, convenio: conv, dispositivo: 'Soporte Electrónico Pantalla Interactiva Táctil' });
      const td = await col.countDocuments({ institucion: inst, convenio: conv, dispositivo: 'Tablet Para Docentes' });

      if (p > 0 || srv > 0 || sop > 0 || td > 0) {
        console.log(`${inst.padEnd(28)} | ${conv.padEnd(8)} | ${String(p).padStart(9)} | ${String(srv).padStart(10)} | ${String(sop).padStart(8)} | ${String(td).padStart(11)}`);
      }
    }
  }

  await client.close();
}

showCurrentTable().catch(console.error);

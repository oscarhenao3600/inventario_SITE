const { MongoClient } = require('mongodb');

async function testTDMatching() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const insts = await col.distinct('institucion');
  insts.sort();

  console.log("INSTITUCION                  | PANTALLAS (22/24/25) | TABLETS DOC (22/24/25) | DIFERENCIA TD TOTAL");
  console.log("---------------------------------------------------------------------------------------------");

  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const p25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Pantalla Interactiva Táctil' });

    const td22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Tablet Para Docentes' });
    const td24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Tablet Para Docentes' });
    const td25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Tablet Para Docentes' });

    const totP = p22 + p24 + p25;
    const totTD = td22 + td24 + td25;

    console.log(`${inst.padEnd(28)} | P: ${String(p22).padStart(2)}/${String(p24).padStart(2)}/${String(p25).padStart(2)}      | TD: ${String(td22).padStart(2)}/${String(td24).padStart(2)}/${String(td25).padStart(2)}        | P:${totP} vs TD:${totTD} (${totTD - totP >= 0 ? '+' : ''}${totTD - totP})`);
  }

  await client.close();
}

testTDMatching().catch(console.error);

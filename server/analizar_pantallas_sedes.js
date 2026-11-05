const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const allDocs = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();

  const sedes = {};
  for (const d of allDocs) {
    const k = `${d.institucion} ||| ${d.sede}`;
    if (!sedes[k]) sedes[k] = { '2022-006': 0, '2024-001': 0, '2025-001': 0, 'SOBRANTE': 0, 'OTRO': 0, total: 0 };
    if (sedes[k][d.convenio] !== undefined) {
      sedes[k][d.convenio]++;
    } else {
      sedes[k]['OTRO']++;
    }
    sedes[k].total++;
  }

  console.log('=== PANTALLAS POR SEDE Y POR CONVENIO EN BD ===');
  console.table(Object.entries(sedes).map(([k, v]) => {
    const [inst, sede] = k.split(' ||| ');
    return {
      institucion: inst,
      sede: sede,
      '2022': v['2022-006'],
      '2024': v['2024-001'],
      '2025': v['2025-001'],
      'SOB': v['SOBRANTE'],
      total: v.total
    };
  }));

  await client.close();
}

main();

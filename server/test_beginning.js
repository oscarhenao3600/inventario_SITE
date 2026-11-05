const { MongoClient } = require('mongodb');

const targets = {
  'BOSQUES DE PINARES': { '2022-006': 8, '2024-001': 25, '2025-001': 5 },
  'CAMARA JUNIOR': { '2022-006': 14, '2024-001': 18, '2025-001': 4 },
  'CAMILO TORRES': { '2022-006': 6, '2024-001': 13, '2025-001': 2 },
  'CASD': { '2022-006': 21, '2024-001': 47, '2025-001': 6 },
  'CIUDAD DORADA': { '2022-006': 15, '2024-001': 5, '2025-001': 3 },
  'CIUDADELA CUYABRA': { '2022-006': 15, '2024-001': 12, '2025-001': 2 },
  'CIUDADELA DE OCCIDENTE': { '2022-006': 8, '2024-001': 30, '2025-001': 4 },
  'CIUDADELA DEL SUR': { '2022-006': 34, '2024-001': 26, '2025-001': 7 },
  'CRISTOBAL COLON': { '2022-006': 23, '2024-001': 2, '2025-001': 10 }
};

async function testBeginning() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const kitTypes = [
    'Pantalla Interactiva Táctil',
    'Servidor Portable de Aula SITE Sistema Cloud',
    'Soporte Electrónico Pantalla Interactiva Táctil',
    'Tablet Para Docentes'
  ];

  const allDocs = await col.find({ dispositivo: { $in: kitTypes } }).toArray();

  for (const [inst, t] of Object.entries(targets)) {
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`INSTITUCIÓN: ${inst}`);
    for (const conv of ['2022-006', '2024-001', '2025-001']) {
      const tgt = t[conv] || 0;
      const docsConv = allDocs.filter(d => d.institucion === inst && d.convenio === conv);
      
      const p = docsConv.filter(d => d.dispositivo === 'Pantalla Interactiva Táctil').length;
      const srv = docsConv.filter(d => d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
      const sop = docsConv.filter(d => d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
      const td = docsConv.filter(d => d.dispositivo === 'Tablet Para Docentes').length;

      const diffP = p - tgt;
      const status = (p === tgt && srv === tgt && sop === tgt && td === tgt) ? 'OK' : 'DESAJUSTE';
      console.log(`  Conv ${conv} | Meta: ${tgt} => Pantallas: ${p} (${diffP >= 0 ? '+' : ''}${diffP}) | Servidores: ${srv} | Soportes: ${sop} | TabDocente: ${td}  [${status}]`);
    }
  }

  await client.close();
}

testBeginning().catch(console.error);

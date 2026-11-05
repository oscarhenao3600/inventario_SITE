const { MongoClient } = require('mongodb');

// Metas agrupadas por institucion
const metasPorInst = {
  "BOSQUES DE PINARES": { '2022': 8, '2024': 25, '2025': 5 },
  "CAMARA JUNIOR": { '2022': 14, '2024': 18, '2025': 4 },
  "CAMILO TORRES": { '2022': 6, '2024': 13, '2025': 2 },
  "CASD HERMOGENES MAZA": { '2022': 21, '2024': 47, '2025': 6 },
  "CIUDAD DORADA": { '2022': 15, '2024': 5, '2025': 3 },
  "CIUDADELA CUYABRA": { '2022': 15, '2024': 12, '2025': 2 },
  "CIUDADELA DE OCCIDENTE": { '2022': 8, '2024': 30, '2025': 4 },
  "CIUDADELA DEL SUR": { '2022': 34, '2024': 26, '2025': 7 },
  "CRISTOBAL COLON": { '2022': 23, '2024': 2, '2025': 10 },
  "EL CAIMO": { '2022': 18, '2024': 9, '2025': 2 },
  "ENRIQUE OLAYA HERRERA": { '2022': 8, '2024': 9, '2025': 1 },
  "ESCUELA NORMAL SUPERIOR DEL QUINDIO": { '2022': 29, '2024': 50, '2025': 6 },
  "EUDORO GRANADA": { '2022': 12, '2024': 10, '2025': 3 },
  "GUSTAVO MATAMOROS D COSTA": { '2022': 9, '2024': 22, '2025': 3 },
  "INEM JOSE CELESTINO MUTIS": { '2022': 10, '2024': 10, '2025': 25 },
  "INSTITUTO TECNICO INDUSTRIAL": { '2022': 15, '2024': 0, '2025': 21 },
  "LA ADIELA": { '2022': 20, '2024': 0, '2025': 24 },
  "LAS COLINAS": { '2022': 13, '2024': 0, '2025': 3 },
  "LAURA VICUNA": { '2022': 12, '2024': 12, '2025': 1 },
  "LOS QUINDIOS": { '2022': 27, '2024': 0, '2025': 7 },
  "MARCELINO CHAMPAGNAT": { '2022': 12, '2024': 0, '2025': 24 }, // ZULDEMAYDA 12 en 2022, 24 en 2025
  "NACIONAL JESUS MARIA OCAMPO": { '2022': 0, '2024': 0, '2025': 17 },
  "NUESTRA SENORA DE BELEN": { '2022': 6, '2024': 0, '2025': 15 }, // NUEVA GRANADA 6 en 2022, 15 en 2025
  "REPUBLICA DE FRANCIA": { '2022': 9, '2024': 0, '2025': 2 },
  "RUFINO JOSE CUERVO CENTRO": { '2022': 38, '2024': 0, '2025': 39 },
  "RUFINO JOSE CUERVO SUR": { '2022': 10, '2024': 0, '2025': 46 }, // MADRE MARCELINA 10 en 2022, 46 en 2025
  "SANTA TERESA DE JESUS": { '2022': 14, '2024': 0, '2025': 16 },
  "TERESITA MONTES": { '2022': 23, '2024': 0, '2025': 5 }
};

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  function normInst(name) {
    if (!name) return '';
    let n = name.toUpperCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, ' ')
      .replace(/\s+/g, ' ').trim();
    if (n === 'CASD') return 'CASD HERMOGENES MAZA';
    if (n === 'INEM') return 'INEM JOSE CELESTINO MUTIS';
    if (n === 'ITI') return 'INSTITUTO TECNICO INDUSTRIAL';
    if (n === 'LOS QUINDOS') return 'LOS QUINDIOS';
    if (n === 'NORMAL SUPERIOR') return 'ESCUELA NORMAL SUPERIOR DEL QUINDIO';
    if (n === 'RUFINO CENTRO') return 'RUFINO JOSE CUERVO CENTRO';
    if (n === 'RUFINO JOSE CUERVO SUR') return 'RUFINO JOSE CUERVO SUR';
    if (n === 'MARCELINO CHAMPAGNAT' || n === 'MARCELINO CHAMPAGNANT') return 'MARCELINO CHAMPAGNAT';
    if (n === 'MADRE MARCELINA') return 'RUFINO JOSE CUERVO SUR';
    if (n === 'NUEVA GRANADA') return 'NUESTRA SENORA DE BELEN';
    return n;
  }

  const allPan = await col.find({ dispositivo: 'Pantalla Interactiva Táctil' }).toArray();

  const actual = {};
  for (const d of allPan) {
    const inst = normInst(d.institucion);
    if (!actual[inst]) actual[inst] = { '2022': 0, '2024': 0, '2025': 0, 'SOBRANTE': 0 };
    const c = d.convenio === 'SOBRANTE' ? 'SOBRANTE' : d.convenio.split('-')[0];
    if (actual[inst][c] !== undefined) actual[inst][c]++;
  }

  const comparison = [];
  for (const [inst, t] of Object.entries(metasPorInst)) {
    const a = actual[inst] || { '2022': 0, '2024': 0, '2025': 0, 'SOBRANTE': 0 };
    const tTot = t['2022'] + t['2024'] + t['2025'];
    const aTot = a['2022'] + a['2024'] + a['2025'] + a['SOBRANTE'];
    comparison.push({
      institucion: inst,
      '2022_Meta': t['2022'],
      '2022_BD': a['2022'],
      '2022_Dif': a['2022'] - t['2022'],
      '2024_Meta': t['2024'],
      '2024_BD': a['2024'],
      '2024_Dif': a['2024'] - t['2024'],
      '2025_Meta': t['2025'],
      '2025_BD': a['2025'],
      '2025_Dif': a['2025'] - t['2025'],
      'Total_Meta': tTot,
      'Total_BD': aTot,
      'Total_Dif': aTot - tTot
    });
  }

  console.log('=== COMPARACIÓN META VS BASE DE DATOS POR INSTITUCIÓN ===');
  console.table(comparison);

  await client.close();
}

main();

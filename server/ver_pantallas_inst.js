const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  // Let's get total pantallas by institucion in DB (normalized)
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
    return n;
  }

  const allPan = await col.find({ dispositivo: 'Pantalla Interactiva Táctil' }).toArray();

  const instData = {};
  for (const d of allPan) {
    const inst = normInst(d.institucion);
    if (!instData[inst]) {
      instData[inst] = { '2022': 0, '2024': 0, '2025': 0, 'SOBRANTE': 0, total: 0 };
    }
    const convKey = d.convenio === 'SOBRANTE' ? 'SOBRANTE' : d.convenio.split('-')[0];
    if (instData[inst][convKey] !== undefined) {
      instData[inst][convKey]++;
    }
    instData[inst].total++;
  }

  console.log('=== PANTALLAS EN BD AGRUPADAS POR INSTITUCIÓN NORMALIZADA ===');
  console.table(instData);

  await client.close();
}

main();

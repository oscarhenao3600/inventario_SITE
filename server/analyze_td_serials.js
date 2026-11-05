const { MongoClient } = require('mongodb');

async function analyzeTDSerials() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const tdList = await col.find({ dispositivo: 'Tablet Para Docentes' }).toArray();

  const patterns = {};
  for (const t of tdList) {
    const s = t.serial || 'SIN_SERIAL';
    let prefix = 'OTRO';
    if (s.startsWith('AD10X')) prefix = 'AD10X (Lenovo/2022)';
    else if (s.startsWith('AVT0162024') || s.startsWith('AVT01624')) prefix = 'AVT...2024 (2024)';
    else if (s.startsWith('AVT0162025') || s.startsWith('AVT01625')) prefix = 'AVT...2025 (2025)';
    else if (s.startsWith('AVT')) prefix = 'AVT (resto: ' + s.substring(0, 10) + ')';
    else prefix = s.substring(0, 8);

    if (!patterns[prefix]) patterns[prefix] = { total: 0, convs: {} };
    patterns[prefix].total++;
    patterns[prefix].convs[t.convenio] = (patterns[prefix].convs[t.convenio] || 0) + 1;
  }

  console.log("PATRONES DE SERIALES EN TABLETS DOCENTES:");
  console.log(patterns);

  await client.close();
}

analyzeTDSerials().catch(console.error);

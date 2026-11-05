const { MongoClient } = require('mongodb');

async function checkConveniosOfSurplus() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const surplusInsts = {
    'CIUDADELA DE OCCIDENTE': 7,
    'CIUDADELA CUYABRA': 6,
    'TERESITA MONTES': 5,
    'CAMARA JUNIOR': 3,
    'EUDORO GRANADA': 2,
    'GUSTAVO MATAMOROS D´COSTA': 2,
    'LAS COLINAS': 2,
    'REPUBLICA DE FRANCIA': 2,
    'NORMAL SUPERIOR': 2,
    'CIUDAD DORADA': 1
  };

  for (const [inst, count] of Object.entries(surplusInsts)) {
    const tds = await col.find({ institucion: inst, dispositivo: 'Tablet Para Docentes' }).toArray();
    console.log(`\n${inst} (Excedente: ${count}):`);
    const byConv = {};
    for (const t of tds) byConv[t.convenio] = (byConv[t.convenio] || 0) + 1;
    console.log("  Distribución por convenio:", byConv);
    const tds2022 = tds.filter(t => t.convenio === '2022-006');
    console.log(`  Tablets 2022-006 disponibles: ${tds2022.length}`);
  }

  await client.close();
}

checkConveniosOfSurplus().catch(console.error);

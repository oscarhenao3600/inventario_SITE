const { MongoClient } = require('mongodb');

async function inspectTablets() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Search tablets with "por asignar" or empty placa or in rectoria
  const tds = await col.find({ dispositivo: 'Tablet Para Docentes' }).toArray();
  console.log(`Total tablets docentes: ${tds.length}`);

  const porAsignar = tds.filter(t => 
    !t.placa || 
    t.placa.toLowerCase().includes('asignar') || 
    t.placa.trim() === '' || 
    t.placa === '0' ||
    (t.serial && t.serial.toLowerCase().includes('asignar'))
  );
  console.log(`Tablets con placa por asignar o vacía: ${porAsignar.length}`);
  porAsignar.forEach(t => console.log(`  - ID: ${t._id}, Inst: ${t.institucion}, Sede: ${t.sede}, Aula: ${t.aula}, Placa: '${t.placa}', Serial: '${t.serial}', Conv: ${t.convenio}`));

  const enRectoria = tds.filter(t => t.aula && t.aula.toUpperCase().includes('RECTOR'));
  console.log(`\nTablets en Rectoria: ${enRectoria.length}`);
  enRectoria.slice(0, 15).forEach(t => console.log(`  - Inst: ${t.institucion}, Sede: ${t.sede}, Aula: ${t.aula}, Placa: ${t.placa}, Serial: ${t.serial}, Conv: ${t.convenio}`));

  // Check tablets per institution where there is surplus
  const surplusInsts = [
    'CIUDADELA DE OCCIDENTE', 'CIUDADELA CUYABRA', 'TERESITA MONTES',
    'CAMARA JUNIOR', 'EUDORO GRANADA', 'GUSTAVO MATAMOROS D´COSTA',
    'LAS COLINAS', 'REPUBLICA DE FRANCIA', 'NORMAL SUPERIOR', 'CIUDAD DORADA'
  ];

  console.log("\nTablets en instituciones con excedente:");
  for (const inst of surplusInsts) {
    const instTds = tds.filter(t => t.institucion === inst);
    const rectoriaTds = instTds.filter(t => t.aula && t.aula.toUpperCase().includes('RECTOR'));
    const sinPlacaTds = instTds.filter(t => !t.placa || t.placa.toLowerCase().includes('asignar'));
    console.log(`${inst}: Total TD=${instTds.length}, En Rectoría=${rectoriaTds.length}, Sin Placa/Por Asignar=${sinPlacaTds.length}`);
  }

  await client.close();
}

inspectTablets().catch(console.error);

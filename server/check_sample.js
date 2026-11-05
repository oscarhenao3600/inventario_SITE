const { MongoClient } = require('mongodb');

async function run() {
  const c = new MongoClient('mongodb://localhost:27017/inventario_educativo');
  await c.connect();
  const col = c.db().collection('dispositivos');
  
  const d = await col.findOne();
  console.log('Sample device keys:', Object.keys(d));
  console.log('Sample device:', d);
  
  const convCount = await col.countDocuments({ convenio: { $exists: true, $ne: '' } });
  console.log('Devices with non-empty convenio:', convCount);

  const convCountEmpty = await col.countDocuments({ convenio: { $in: [null, '', undefined] } });
  console.log('Devices with empty/null/missing convenio:', convCountEmpty);

  const allConvs = await col.distinct('convenio');
  console.log('Distinct convenio values:', allConvs);

  // Check Excel files too:
  // Is there a file 'Reporte_Dispositivos_Sobrantes_Faltantes_SITE.xlsx' or 'BD AULAS SITE JEFE.xlsx'?
  await c.close();
}

run().catch(console.error);

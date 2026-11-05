const { MongoClient } = require('mongodb');

async function findMixedClassrooms() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Find all aulas where there are devices from both 2022-006 and 2024-001
  const aulas = await col.aggregate([
    { $match: { convenio: { $in: ['2022-006', '2024-001'] } } },
    { $group: { _id: { inst: '$institucion', sede: '$sede', aula: '$aula' }, convenios: { $addToSet: '$convenio' } } },
    { $match: { 'convenios.1': { $exists: true } } }
  ]).toArray();

  console.log(`Encontradas ${aulas.length} aulas con mezcla de 2022-006 y 2024-001:`);
  for (const a of aulas) {
    const items = await col.find({
      institucion: a._id.inst,
      sede: a._id.sede,
      aula: a._id.aula,
      convenio: { $in: ['2022-006', '2024-001'] }
    }).toArray();

    const pant = items.filter(d => d.dispositivo === 'Pantalla Interactiva Táctil');
    const srv = items.filter(d => d.dispositivo.includes('Servidor'));
    const sop = items.filter(d => d.dispositivo.includes('Soporte'));
    const car = items.filter(d => d.dispositivo.includes('Carro'));
    const tabDoc = items.filter(d => d.dispositivo.includes('Docentes'));
    const tabEst = items.filter(d => d.dispositivo.includes('Estudiantes'));

    console.log(`\nAula: ${a._id.inst} | ${a._id.sede} | ${a._id.aula}`);
    console.log(`  Pantallas:`, pant.map(p => `${p.convenio} (${p.placa})`));
    console.log(`  Servidores:`, srv.map(s => `${s.convenio} (${s.placa})`));
    console.log(`  Soportes:`, sop.map(s => `${s.convenio} (${s.placa})`));
    console.log(`  Carros:`, car.map(c => `${c.convenio} (${c.placa})`));
    console.log(`  Tab Doc:`, tabDoc.map(t => `${t.convenio} (${t.placa})`));
    console.log(`  Tab Est: ${tabEst.length} tablets (convs: ${[...new Set(tabEst.map(t => t.convenio))].join(', ')})`);
  }

  await client.close();
}

findMixedClassrooms().catch(console.error);

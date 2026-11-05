const { MongoClient } = require('mongodb');

async function balanceKits() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('=== IDENTIFICANDO ELEMENTOS A AJUSTAR ENTRE 2022 Y 2024 ===');

  // 1. Tablets de Estudiante: 2 aulas de 2024 que tienen tablets marcadas 2022-006
  // Por ejemplo, Bosques de Pinares | Pinares | Aula 4 (30 tablets)
  // y Bosques de Pinares | Simon Rodriguez | 8 (30 tablets)
  // Ambas aulas son 100% de Convenio 2024-001 (pantalla, servidor, soporte, carro están en 2024-001)
  const t1 = await col.find({
    institucion: 'BOSQUES DE PINARES',
    sede: 'PINARES',
    aula: 'Aula 4',
    dispositivo: 'Tablet Para Estudiantes',
    convenio: '2022-006'
  }).toArray();
  console.log(`Aula Pinares Aula 4: ${t1.length} tablets de estudiantes en 2022-006.`);

  const t2 = await col.find({
    institucion: 'BOSQUES DE PINARES',
    sede: 'SIMON RODRIGUEZ',
    aula: '8',
    dispositivo: 'Tablet Para Estudiantes',
    convenio: '2022-006'
  }).toArray();
  console.log(`Aula Simon Rodriguez 8: ${t2.length} tablets de estudiantes en 2022-006.`);

  if (t1.length === 30 && t2.length === 30) {
    console.log('-> Moviendo estas 60 tablets (2 aulas de 30) a Convenio 2024-001...');
    await col.updateMany(
      { _id: { $in: [...t1.map(d => d._id), ...t2.map(d => d._id)] } },
      { $set: { convenio: '2024-001' } }
    );
  }

  // 2. Servidor: 1 servidor que está en aula de 2024 pero marcado 2022-006
  // Por ejemplo en Bosques de Pinares | Aula 10 (placa 13086), donde la pantalla es 2024-001
  const srv = await col.findOne({
    placa: '13086',
    convenio: '2022-006',
    dispositivo: 'Servidor Portable de Aula SITE Sistema Cloud'
  });
  if (srv) {
    console.log(`-> Moviendo Servidor placa 13086 en aula 10 de Bosques de Pinares a Convenio 2024-001...`);
    await col.updateOne({ _id: srv._id }, { $set: { convenio: '2024-001' } });
  }

  // 3. Soporte: 1 soporte que está en aula de 2024 pero marcado 2022-006
  // Por ejemplo en Bosques de Pinares | Aula 10 (placa 13140), donde la pantalla es 2024-001
  const sop = await col.findOne({
    placa: '13140',
    convenio: '2022-006',
    dispositivo: 'Soporte Electrónico Pantalla Interactiva Táctil'
  });
  if (sop) {
    console.log(`-> Moviendo Soporte placa 13140 en aula 10 de Bosques de Pinares a Convenio 2024-001...`);
    await col.updateOne({ _id: sop._id }, { $set: { convenio: '2024-001' } });
  }

  // 4. Carros: 2 carros que están en aulas de 2024 pero marcados 2022-006
  // Por ejemplo en Bosques de Pinares | Aula 10 (placa 13014) y Pinares Aula 4 (placa 13004)
  const c1 = await col.findOne({ placa: '13014', convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
  const c2 = await col.findOne({ placa: '13004', convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
  if (c1 && c2) {
    console.log('-> Moviendo 2 Carros (placas 13014 y 13004) a Convenio 2024-001...');
    await col.updateMany(
      { _id: { $in: [c1._id, c2._id] } },
      { $set: { convenio: '2024-001' } }
    );
  }

  // 5. Tablet Docentes: 2 tablets docentes en aulas de 2022-006 que estaban marcadas 2024-001
  // Por ejemplo en Rufino Centro Aula 11 (placa 32924) y Aula 15 (placa 46629)
  const td1 = await col.findOne({ placa: '32924', convenio: '2024-001', dispositivo: 'Tablet Para Docentes' });
  const td2 = await col.findOne({ placa: '46629', convenio: '2024-001', dispositivo: 'Tablet Para Docentes' });
  if (td1 && td2) {
    console.log('-> Moviendo 2 Tablets Docentes (placas 32924 y 46629) a Convenio 2022-006...');
    await col.updateMany(
      { _id: { $in: [td1._id, td2._id] } },
      { $set: { convenio: '2022-006' } }
    );
  }

  // 6. Mesa táctil en 2022-006:
  // Hay 1 mesa táctil en 2022-006. Las mesas táctiles corresponden a Convenio 2024-001 o 2025-001
  const mesa2022 = await col.findOne({ convenio: '2022-006', dispositivo: 'Mesa Interactiva Tactil' });
  if (mesa2022) {
    console.log(`Mesa táctil en 2022-006 encontrada en ${mesa2022.institucion} | ${mesa2022.sede} | ${mesa2022.aula} (placa: ${mesa2022.placa})`);
    // Check if it belongs to 2024-001
    await col.updateOne({ _id: mesa2022._id }, { $set: { convenio: '2024-001' } });
    console.log('-> Mesa reasignada a 2024-001.');
  }

  console.log('\n--- VERIFICANDO TOTALES TRAS BALANCEO ---');
  const convenios = ['2022-006', '2024-001', '2025-001', 'SOBRANTE'];
  for (const c of convenios) {
    console.log(`\n================ RESUMEN CONVENIO ${c} ================`);
    const r = await col.aggregate([
      { $match: { convenio: c } },
      { $group: { _id: '$dispositivo', count: { $sum: 1 } } }
    ]).toArray();
    r.sort((a, b) => b.count - a.count);
    r.forEach(item => {
      console.log(`  ${item._id.padEnd(50)}: ${item.count}`);
    });
  }

  await client.close();
}

balanceKits().catch(console.error);

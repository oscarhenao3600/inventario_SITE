const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('dispositivos');

  console.log('================================================================');
  console.log('1. TOTALES GLOBALES POR TIPO Y CONVENIO');
  console.log('================================================================');
  const globalSummary = await col.aggregate([
    {
      $match: {
        dispositivo: {
          $in: [
            'Pantalla Interactiva Táctil',
            'Carro Cargador de Tabletas',
            'Tablet Para Estudiantes',
            'Tablet Para Docentes'
          ]
        }
      }
    },
    {
      $group: {
        _id: { dispositivo: '$dispositivo', convenio: '$convenio' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.dispositivo': 1, '_id.convenio': 1 } }
  ]).toArray();

  globalSummary.forEach(g => {
    console.log(`${g._id.dispositivo.padEnd(30)} | Conv: ${String(g._id.convenio).padEnd(12)} | ${g.count}`);
  });

  console.log('\n================================================================');
  console.log('2. CARROS EN AULAS SIN TABLETS DE ESTUDIANTES');
  console.log('================================================================');
  const allCarros = await col.find({ dispositivo: 'Carro Cargador de Tabletas' }).toArray();
  const allTabletsEst = await col.find({ dispositivo: 'Tablet Para Estudiantes' }).toArray();

  // Create lookup for student tablets by (institucion + ||| + sede + ||| + aula)
  const tabletsMap = {};
  for (const t of allTabletsEst) {
    const key = `${t.institucion || ''}|||${t.sede || ''}|||${t.aula || ''}`;
    tabletsMap[key] = (tabletsMap[key] || 0) + 1;
  }

  const carrosSinTablets = [];
  const carrosConTablets = [];

  for (const c of allCarros) {
    const key = `${c.institucion || ''}|||${c.sede || ''}|||${c.aula || ''}`;
    const tCount = tabletsMap[key] || 0;
    const info = {
      _id: c._id,
      placa: c.placa,
      serial: c.serial,
      modelo: c.modelo,
      institucion: c.institucion,
      sede: c.sede,
      aula: c.aula,
      convenio: c.convenio,
      tabletsEstEnAula: tCount
    };
    if (tCount === 0) {
      carrosSinTablets.push(info);
    } else {
      carrosConTablets.push(info);
    }
  }

  console.log(`Total carros: ${allCarros.length}`);
  console.log(`Carros CON tablets de estudiantes en el aula: ${carrosConTablets.length}`);
  console.log(`Carros SIN tablets de estudiantes en el aula: ${carrosSinTablets.length}`);
  console.log('\nDetalle de carros SIN tablets de estudiantes:');
  console.table(carrosSinTablets);

  console.log('\n================================================================');
  console.log('3. COMPARACIÓN INSTITUCIÓN: PANTALLAS VS CARROS POR CONVENIO');
  console.log('================================================================');
  const insts = await col.distinct('institucion');
  insts.sort();

  const instData = [];
  for (const inst of insts) {
    if (!inst) continue;
    // 2022-006
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    // 2024-001
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });
    // 2025-001
    const p25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c25 = await col.countDocuments({ institucion: inst, convenio: '2025-001', dispositivo: 'Carro Cargador de Tabletas' });
    // Totales
    const pTot = await col.countDocuments({ institucion: inst, dispositivo: 'Pantalla Interactiva Táctil' });
    const cTot = await col.countDocuments({ institucion: inst, dispositivo: 'Carro Cargador de Tabletas' });

    instData.push({
      institucion: inst,
      'P_2022': p22,
      'C_2022': c22,
      'Diff_22': c22 - p22,
      'P_2024': p24,
      'C_2024': c24,
      'Diff_24': c24 - p24,
      'P_2025': p25,
      'C_2025': c25,
      'P_Total': pTot,
      'C_Total': cTot,
      'Diff_Total': cTot - pTot
    });
  }

  console.table(instData);

  console.log('\n================================================================');
  console.log('4. AULAS CON MÁS DE 1 CARRO');
  console.log('================================================================');
  const aulasMultiCarros = await col.aggregate([
    { $match: { dispositivo: 'Carro Cargador de Tabletas' } },
    {
      $group: {
        _id: { institucion: '$institucion', sede: '$sede', aula: '$aula' },
        count: { $sum: 1 },
        placas: { $push: '$placa' },
        convenios: { $push: '$convenio' }
      }
    },
    { $match: { count: { $gt: 1 } } }
  ]).toArray();
  console.table(aulasMultiCarros.map(a => ({
    institucion: a._id.institucion,
    sede: a._id.sede,
    aula: a._id.aula,
    count: a.count,
    placas: a.placas.join(', '),
    convenios: a.convenios.join(', ')
  })));

  await client.close();
}

main().catch(console.error);

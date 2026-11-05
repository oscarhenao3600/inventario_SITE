const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://localhost:27017/inventario_educativo';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('=== TIPOS DE DISPOSITIVOS Y TOTALES ===');
  const types = await col.aggregate([
    { $group: { _id: { dispositivo: '$dispositivo', convenio: '$convenio' }, count: { $sum: 1 } } },
    { $sort: { '_id.dispositivo': 1, '_id.convenio': 1 } }
  ]).toArray();
  types.forEach(t => console.log(`${t._id.dispositivo.padEnd(45)} | Conv: ${String(t._id.convenio).padEnd(12)} | Cantidad: ${t.count}`));

  console.log('\n=== INSTITUCIONES: PANTALLAS VS CARROS POR CONVENIO ===');
  const insts = await col.distinct('institucion');
  insts.sort();

  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: { $regex: /pantalla/i } });
    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: { $regex: /carro/i } });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: { $regex: /pantalla/i } });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: { $regex: /carro/i } });
    const pTot = await col.countDocuments({ institucion: inst, dispositivo: { $regex: /pantalla/i } });
    const cTot = await col.countDocuments({ institucion: inst, dispositivo: { $regex: /carro/i } });

    if (pTot > 0 || cTot > 0) {
      console.log(`${inst.padEnd(30)} | 2022: Pant=${p22}, Carro=${c22} | 2024: Pant=${p24}, Carro=${c24} | TOTAL: Pant=${pTot}, Carro=${cTot} | Diff(C-P)=${cTot - pTot}`);
    }
  }

  console.log('\n=== CARROS POR CONVENIO ===');
  const carrosByConv = await col.aggregate([
    { $match: { dispositivo: { $regex: /carro/i } } },
    { $group: { _id: { convenio: '$convenio' }, count: { $sum: 1 } } }
  ]).toArray();
  console.log(carrosByConv);

  console.log('\n=== PANTALLAS POR CONVENIO ===');
  const pantallasByConv = await col.aggregate([
    { $match: { dispositivo: { $regex: /pantalla/i } } },
    { $group: { _id: { convenio: '$convenio' }, count: { $sum: 1 } } }
  ]).toArray();
  console.log(pantallasByConv);

  console.log('\n=== RELACIÓN CARROS Y TABLETS DE ESTUDIANTES ===');
  // How are student tablets distributed?
  const tabEstByConv = await col.aggregate([
    { $match: { dispositivo: { $regex: /estudiante/i } } },
    { $group: { _id: { convenio: '$convenio' }, count: { $sum: 1 } } }
  ]).toArray();
  console.log('Tablets de estudiantes por convenio:', tabEstByConv);

  // Check sample documents of carro and tablet de estudiante
  const sampleCarro = await col.findOne({ dispositivo: { $regex: /carro/i } });
  console.log('\nSample Carro:', sampleCarro);

  const sampleTabEst = await col.findOne({ dispositivo: { $regex: /estudiante/i } });
  console.log('\nSample Tablet Estudiante:', sampleTabEst);

  await client.close();
}

main().catch(console.error);

const { MongoClient } = require('mongodb');

async function verifyAll() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  console.log("======================= AUDITORÍA FINAL COMPLETA =======================");

  // 1. Totales globales por dispositivo y convenio
  const devSummary = await col.aggregate([
    { $match: { dispositivo: { $in: ['Pantalla Interactiva Táctil', 'Carro Cargador de Tabletas', 'Tablet Para Estudiantes'] } } },
    { $group: { _id: { d: '$dispositivo', c: '$convenio' }, count: { $sum: 1 } } },
    { $sort: { '_id.d': 1, '_id.c': 1 } }
  ]).toArray();

  console.table(devSummary.map(r => ({ Dispositivo: r._id.d, Convenio: r._id.c, Cantidad: r.count })));

  // 2. Verificación de las dos sobrantes en 2022-006 sin tablets
  const sobrantes = ['46566', '22639'];
  console.log('\n--- VERIFICACIÓN 2 CARROS SOBRANTES 2022-006 ---');
  for (const placa of sobrantes) {
    const doc = await col.findOne({ placa, dispositivo: 'Carro Cargador de Tabletas' });
    const teCount = await col.countDocuments({
      institucion: doc.institucion,
      sede: doc.sede,
      aula: doc.aula,
      dispositivo: 'Tablet Para Estudiantes'
    });
    console.log(`Placa: ${doc.placa} | Institución: ${doc.institucion} | Sede: ${doc.sede} | Aula: ${doc.aula} | Convenio: ${doc.convenio} | Tablets Estudiante: ${teCount} | Notas: ${doc.notas}`);
  }

  // 3. Verificación de carros sin tablets en 2022-006
  const allCarros22 = await col.find({ convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' }).toArray();
  const allTe22 = await col.find({ convenio: '2022-006', dispositivo: 'Tablet Para Estudiantes' }).toArray();
  const teMap = {};
  allTe22.forEach(t => {
    const k = `${t.institucion.trim().toUpperCase()}|||${t.sede.trim().toUpperCase()}|||${t.aula.trim().toUpperCase()}`;
    teMap[k] = (teMap[k] || 0) + 1;
  });

  const sinTe22 = allCarros22.filter(c => {
    const k = `${c.institucion.trim().toUpperCase()}|||${c.sede.trim().toUpperCase()}|||${c.aula.trim().toUpperCase()}`;
    return !teMap[k];
  });
  console.log(`\nTotal carros en 2022-006 sin tablets de estudiantes: ${sinTe22.length}`);
  console.table(sinTe22.map(c => ({
    placa: c.placa,
    institucion: c.institucion,
    sede: c.sede,
    aula: c.aula,
    convenio: c.convenio,
    notas: c.notas
  })));

  // 4. Tabla por institución
  const insts = (await col.distinct('institucion')).filter(Boolean).sort();
  const rows = [];
  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });

    let exp22 = p22;
    if (inst === 'CIUDADELA DEL SUR') exp22 += 1;
    if (inst === 'CRISTOBAL COLON') exp22 += 1;

    rows.push({
      Institución: inst,
      P_2022: p22,
      C_2022: c22,
      Status_22: c22 === exp22 ? (exp22 > p22 ? 'OK (+1 SOBRANTE)' : '100% PARIDAD') : `DIFF (${c22 - exp22})`,
      P_2024: p24,
      C_2024: c24,
      Status_24: c24 === p24 ? '100% PARIDAD' : (c24 > p24 ? `+${c24 - p24}` : `${c24 - p24}`)
    });
  }

  console.log('\n--- BALANCE POR INSTITUCIÓN ---');
  console.table(rows);

  await c.close();
}

verifyAll().catch(console.error);

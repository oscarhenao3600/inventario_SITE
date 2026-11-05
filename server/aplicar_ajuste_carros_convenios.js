const { MongoClient } = require('mongodb');

async function aplicarAjusteCarros() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  console.log("=== INICIANDO APLICACIÓN DE AJUSTE DE CARROS (CONVENIOS 2022-006 Y 2024-001) ===");

  const rawCarros = await col.find({
    convenio: { $in: ['2022-006', '2024-001'] },
    dispositivo: 'Carro Cargador de Tabletas'
  }).toArray();
  const carros = rawCarros.map(d => ({ ...d }));

  const pantallas = await col.find({
    convenio: { $in: ['2022-006', '2024-001'] },
    dispositivo: 'Pantalla Interactiva Táctil'
  }).toArray();

  const allTe = await col.find({
    dispositivo: 'Tablet Para Estudiantes'
  }).toArray();

  const teMap = {};
  for (const t of allTe) {
    const k = `${(t.institucion||'').trim().toUpperCase()}|||${(t.sede||'').trim().toUpperCase()}|||${(t.aula||'').trim().toUpperCase()}`;
    teMap[k] = (teMap[k] || 0) + 1;
  }

  // Las dos sobrantes fijas en 2022-006 sin tablets
  const sobrantes2022 = ['46566', '22639'];

  const screenByAula = {};
  for (const s of pantallas) {
    const k = `${(s.institucion||'').trim().toUpperCase()}|||${(s.sede||'').trim().toUpperCase()}|||${(s.aula||'').trim().toUpperCase()}`;
    screenByAula[k] = s;
  }

  const updateOps = [];

  // PASO 1: Movimientos internos entre sedes (misma institución)
  // 1. LA ADIELA: Sede LA ADIELA (11) -> LA CECILIA (9)
  const adielaCart = carros.find(c => c.institucion === 'LA ADIELA' && c.sede === 'LA ADIELA' && c.convenio === '2022-006' && !teMap[`LA ADIELA|||LA ADIELA|||${c.aula.toUpperCase()}`]);
  if (adielaCart) {
    console.log(`[SEDE] Placa ${adielaCart.placa} (${adielaCart.institucion}): LA ADIELA -> LA CECILIA (RECTORIA)`);
    updateOps.push({
      updateOne: {
        filter: { _id: adielaCart._id },
        update: { $set: { sede: 'LA CECILIA', aula: 'RECTORIA' } }
      }
    });
  }

  // 2. RUFINO JOSÉ CUERVO SUR: MADRE MARCELINA (10) -> RUFINO SUR sede (0)
  const rufinoSurCart = carros.find(c => c.institucion === 'RUFINO JOSÉ CUERVO SUR' && c.sede === 'MADRE MARCELINA' && c.convenio === '2022-006');
  if (rufinoSurCart) {
    console.log(`[SEDE] Placa ${rufinoSurCart.placa} (${rufinoSurCart.institucion}): MADRE MARCELINA -> RUFINO JOSÉ CUERVO SUR (RECTORIA)`);
    updateOps.push({
      updateOne: {
        filter: { _id: rufinoSurCart._id },
        update: { $set: { sede: 'RUFINO JOSÉ CUERVO SUR', aula: 'RECTORIA' } }
      }
    });
  }

  // 3. TERESITA MONTES: LUIS CARLOS GALAN -> TERESITA MONTES sede (2 carros)
  const galanCarts = carros.filter(c => c.institucion === 'TERESITA MONTES' && c.sede === 'LUIS CARLOS GALAN').slice(0, 2);
  for (const gc of galanCarts) {
    console.log(`[SEDE] Placa ${gc.placa} (${gc.institucion}): LUIS CARLOS GALAN -> TERESITA MONTES (RECTORIA)`);
    updateOps.push({
      updateOne: {
        filter: { _id: gc._id },
        update: { $set: { sede: 'TERESITA MONTES', aula: 'RECTORIA' } }
      }
    });
  }

  // PASO 2: 46 CARROS 2024-001 -> 2022-006
  const nsCarts = carros.filter(c => c.institucion === 'NORMAL SUPERIOR' && c.convenio === '2024-001' && screenByAula[`NORMAL SUPERIOR|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2022-006').slice(0, 18);
  const rcCarts = carros.filter(c => c.institucion === 'RUFINO CENTRO' && c.convenio === '2024-001' && screenByAula[`RUFINO CENTRO|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2022-006').slice(0, 12);
  const tmCarts = carros.filter(c => c.institucion === 'TERESITA MONTES' && c.convenio === '2024-001').slice(0, 9);
  const ecCarts = carros.filter(c => c.institucion === 'EL CAIMO' && c.convenio === '2024-001' && screenByAula[`EL CAIMO|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2022-006').slice(0, 4);
  const coCarts = carros.filter(c => c.institucion === 'CIUDADELA DE OCCIDENTE' && c.convenio === '2024-001' && screenByAula[`CIUDADELA DE OCCIDENTE|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2022-006').slice(0, 3);

  const list24to22 = [...nsCarts, ...rcCarts, ...tmCarts, ...ecCarts, ...coCarts];
  console.log(`\nPreparando ${list24to22.length} actualizaciones de 2024-001 -> 2022-006...`);
  for (const car of list24to22) {
    updateOps.push({
      updateOne: {
        filter: { _id: car._id },
        update: { $set: { convenio: '2022-006' } }
      }
    });
  }

  // PASO 3: 46 CARROS 2022-006 -> 2024-001
  const csCarts24 = carros.filter(c => c.institucion === 'CIUDADELA DEL SUR' && c.convenio === '2022-006' && !sobrantes2022.includes(c.placa) && screenByAula[`CIUDADELA DEL SUR|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2024-001');
  const csCartsExtra = carros.filter(c => c.institucion === 'CIUDADELA DEL SUR' && c.convenio === '2022-006' && !sobrantes2022.includes(c.placa) && !csCarts24.some(x => x.placa === c.placa) && (c.aula === 'AULA 4' || c.aula === 'AULA 22' || c.aula === 'AULA 1- TRASICION' || c.aula === 'AULA 5-GRADO 5' || c.aula === 'AULA 21')).slice(0, 5);
  const csCarts = [...csCarts24, ...csCartsExtra];

  const casdCarts = carros.filter(c => c.institucion === 'CASD' && c.convenio === '2022-006').slice(0, 5);
  const stCarts = carros.filter(c => c.institucion === 'SANTA TERESA DE JESUS' && c.convenio === '2022-006' && (c.aula === 'RECTORIA' || c.aula === 'AULA 27' || c.aula === 'AULA 30' || c.aula === 'AULA 28')).slice(0, 4);
  const cjCarts = carros.filter(c => c.institucion === 'CAMARA JUNIOR' && c.convenio === '2022-006' && screenByAula[`CAMARA JUNIOR|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2024-001').slice(0, 3);
  const bpCarts = carros.filter(c => c.institucion === 'BOSQUES DE PINARES' && c.convenio === '2022-006').slice(0, 2);
  const ctCarts = carros.filter(c => c.institucion === 'CAMILO TORRES' && c.convenio === '2022-006' && (c.placa === '42442' || screenByAula[`CAMILO TORRES|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2024-001')).slice(0, 1);
  const lvCarts = carros.filter(c => c.institucion === 'LAURA VICUÑA' && c.convenio === '2022-006' && screenByAula[`LAURA VICUÑA|||${c.sede.toUpperCase()}|||${c.aula.toUpperCase()}`]?.convenio === '2024-001').slice(0, 1);
  const cdCarts = carros.filter(c => c.institucion === 'CIUDAD DORADA' && c.convenio === '2022-006' && c.aula.toUpperCase().includes('RECTOR')).slice(0, 1);

  const list22to24 = [...csCarts, ...casdCarts, ...stCarts, ...cjCarts, ...bpCarts, ...ctCarts, ...lvCarts, ...cdCarts];
  console.log(`Preparando ${list22to24.length} actualizaciones de 2022-006 -> 2024-001...`);
  for (const car of list22to24) {
    updateOps.push({
      updateOne: {
        filter: { _id: car._id },
        update: { $set: { convenio: '2024-001' } }
      }
    });
  }

  console.log(`\nTotal operaciones en bulkWrite: ${updateOps.length}`);
  console.log(`Ejecutando bulkWrite en MongoDB sobre colección 'dispositivos'...`);
  const bulkRes = await col.bulkWrite(updateOps);
  console.log(`¡BulkWrite exitoso! Documentos modificados: ${bulkRes.modifiedCount}`);

  // PASO 4: AUDITORIA EN VIVO DIRECTAMENTE SOBRE MONGODB
  console.log("\n==================== AUDITORIA EN VIVO SOBRE MONGODB ====================");
  const totC22 = await col.countDocuments({ convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
  const totC24 = await col.countDocuments({ convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });
  const totP22 = await col.countDocuments({ convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
  const totP24 = await col.countDocuments({ convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });

  console.log(`Convenio 2022-006: Pantallas=${totP22}, Carros=${totC22} (Diferencia = ${totC22 - totP22} sobrantes)`);
  console.log(`Convenio 2024-001: Pantallas=${totP24}, Carros=${totC24} (Diferencia = ${totC24 - totP24})`);

  console.log('\n=== VERIFICACIÓN DE LAS 2 SOBRANTES DE 2022-006 ===');
  for (const p of sobrantes2022) {
    const car = await col.findOne({ placa: p, dispositivo: 'Carro Cargador de Tabletas' });
    const countTe = await col.countDocuments({ institucion: car.institucion, sede: car.sede, aula: car.aula, dispositivo: 'Tablet Para Estudiantes' });
    console.log(`Placa: ${car.placa}, Inst: ${car.institucion}, Sede: ${car.sede}, Aula: ${car.aula}, Conv: ${car.convenio}, TE en aula: ${countTe}`);
  }

  const insts = (await col.distinct('institucion')).filter(Boolean).sort();
  const summary = [];
  for (const inst of insts) {
    const p22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    const c22 = await col.countDocuments({ institucion: inst, convenio: '2022-006', dispositivo: 'Carro Cargador de Tabletas' });
    const p24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' });
    const c24 = await col.countDocuments({ institucion: inst, convenio: '2024-001', dispositivo: 'Carro Cargador de Tabletas' });

    let exp22 = p22;
    if (inst === 'CIUDADELA DEL SUR') exp22 += 1;
    if (inst === 'CRISTOBAL COLON') exp22 += 1;

    const diff22 = c22 - exp22;
    const diff24 = c24 - p24;

    summary.push({
      Institucion: inst,
      P22: p22, C22: c22, Diff22: diff22 === 0 ? '0 (OK)' : (diff22 > 0 ? `+${diff22}` : `${diff22}`),
      P24: p24, C24: c24, Diff24: diff24 === 0 ? '0 (OK)' : (diff24 > 0 ? `+${diff24}` : `${diff24}`)
    });
  }
  console.table(summary);

  await c.close();
}

aplicarAjusteCarros().catch(console.error);

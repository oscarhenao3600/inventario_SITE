const { MongoClient } = require('mongodb');

async function testFullSolution() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  const allCarros = (await col.find({
    dispositivo: 'Carro Cargador de Tabletas'
  }).toArray()).map(d => ({ ...d }));

  const allScreens = await col.find({
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

  // 1. Las dos sobrantes fijas en 2022-006 sin tablets
  const sobrantes2022 = ['46566', '22639'];

  // 2. Swaps directos por coincidencia de aula con Pantalla en 2022 y 2024
  const screenByAula = {};
  for (const s of allScreens) {
    const k = `${(s.institucion||'').trim().toUpperCase()}|||${(s.sede||'').trim().toUpperCase()}|||${(s.aula||'').trim().toUpperCase()}`;
    if (!screenByAula[k]) screenByAula[k] = [];
    screenByAula[k].push(s);
  }

  let aulaSwaps = 0;
  for (const car of allCarros) {
    if (sobrantes2022.includes(car.placa)) continue;
    if (car.convenio !== '2022-006' && car.convenio !== '2024-001') continue;

    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    const screens = screenByAula[k];
    if (screens && screens.length > 0) {
      const scrConv = screens[0].convenio;
      if ((scrConv === '2022-006' || scrConv === '2024-001') && car.convenio !== scrConv) {
        car.convenio = scrConv;
        aulaSwaps++;
      }
    }
  }

  // Instituciones y sus metas
  const insts = (await col.distinct('institucion')).filter(Boolean).sort();

  // 3. Rebalanceo institucional:
  // Encontrar qué instituciones tienen carros de más respecto a sus pantallas en (22+24)
  // y seleccionar exactamente los carros sobrantes (priorizando TE=0, aula Rectoria, etc.)
  const surplusCarts = [];
  
  // Conteo actual por institución
  for (const inst of insts) {
    const p22 = allScreens.filter(s => s.institucion === inst && s.convenio === '2022-006').length;
    const p24 = allScreens.filter(s => s.institucion === inst && s.convenio === '2024-001').length;
    const targetTot = p22 + p24;

    // Si tiene sobrantes de 2022 fijas (ej. Ciudadela del Sur tiene 1, Cristobal Colon tiene 1)
    let allowedSurplus = 0;
    if (inst === 'CIUDADELA DEL SUR') allowedSurplus = 1;
    if (inst === 'CRISTOBAL COLON') allowedSurplus = 1;

    const instCarts = allCarros.filter(c => c.institucion === inst && (c.convenio === '2022-006' || c.convenio === '2024-001') && !sobrantes2022.includes(c.placa));
    const excess = instCarts.length - (targetTot - (inst === 'CIUDADELA DEL SUR' || inst === 'CRISTOBAL COLON' ? 0 : 0)); // wait, let's calculate exact excess

    const currentTot = instCarts.length + (inst === 'CIUDADELA DEL SUR' ? 1 : 0) + (inst === 'CRISTOBAL COLON' ? 1 : 0);
    const netExcess = currentTot - (targetTot + allowedSurplus);

    if (netExcess > 0) {
      // Ordenar carros para elegir los mejores sobrantes:
      // 1. Sin tablets de estudiantes en aula (teMap === 0)
      // 2. Aula con palabra RECTORIA o prescolar o sin pantalla
      // 3. Convenio 2024-001 o 2022-006
      instCarts.sort((a, b) => {
        const ka = `${(a.institucion||'').trim().toUpperCase()}|||${(a.sede||'').trim().toUpperCase()}|||${(a.aula||'').trim().toUpperCase()}`;
        const kb = `${(b.institucion||'').trim().toUpperCase()}|||${(b.sede||'').trim().toUpperCase()}|||${(b.aula||'').trim().toUpperCase()}`;
        const tea = teMap[ka] || 0;
        const teb = teMap[kb] || 0;
        if (tea === 0 && teb > 0) return -1;
        if (tea > 0 && teb === 0) return 1;

        const aRec = a.aula.toUpperCase().includes('RECTOR');
        const bRec = b.aula.toUpperCase().includes('RECTOR');
        if (aRec && !bRec) return -1;
        if (!aRec && bRec) return 1;

        const aScreen = (screenByAula[ka] || []).length;
        const bScreen = (screenByAula[kb] || []).length;
        if (aScreen === 0 && bScreen > 0) return -1;
        if (aScreen > 0 && bScreen === 0) return 1;

        return 0;
      });

      const chosen = instCarts.slice(0, netExcess);
      for (const ch of chosen) {
        surplusCarts.push(ch);
      }
    }
  }

  console.log(`\nTotal carros sobrantes seleccionados para cubrir faltantes: ${surplusCarts.length} (esperado 39)`);

  // Destinos con faltantes:
  const deficits = [
    { inst: 'CASD', sede: 'CASD HERMOGENES MAZA', aula: 'RECTORIA', count: 31, conv: '2024-001' },
    { inst: 'INEM', sede: 'INEM', aula: 'RECTORIA', count: 5, conv: '2024-001' },
    { inst: 'BOSQUES DE PINARES', sede: 'BOSQUES DE PINARES', aula: 'RECTORIA', count: 1, conv: '2024-001' },
    { inst: 'CAMARA JUNIOR', sede: 'CAMARA JUNIOR', aula: 'RECTORIA', count: 1, conv: '2024-001' },
    { inst: 'CIUDADELA CUYABRA', sede: 'CIUDADELA CUYABRA', aula: 'RECTORIA', count: 1, conv: '2024-001' }
  ];

  let sIdx = 0;
  for (const def of deficits) {
    for (let i = 0; i < def.count; i++) {
      const cart = surplusCarts[sIdx++];
      cart.institucion = def.inst;
      cart.sede = def.sede;
      cart.aula = def.aula;
      cart.convenio = def.conv;
    }
  }

  // 4. Ajustes finales de convenio si alguna institución tiene swap pendiente interno
  for (const inst of insts) {
    const p22 = allScreens.filter(s => s.institucion === inst && s.convenio === '2022-006').length;
    const p24 = allScreens.filter(s => s.institucion === inst && s.convenio === '2024-001').length;
    let allowedSurplus22 = 0;
    if (inst === 'CIUDADELA DEL SUR') allowedSurplus22 = 1;
    if (inst === 'CRISTOBAL COLON') allowedSurplus22 = 1;

    const c22 = allCarros.filter(c => c.institucion === inst && c.convenio === '2022-006').length;
    const c24 = allCarros.filter(c => c.institucion === inst && c.convenio === '2024-001').length;

    const diff22 = c22 - (p22 + allowedSurplus22);
    const diff24 = c24 - p24;

    if (diff22 > 0 && diff24 < 0) {
      const move = Math.min(diff22, -diff24);
      const toMove = allCarros.filter(c => c.institucion === inst && c.convenio === '2022-006' && !sobrantes2022.includes(c.placa)).slice(0, move);
      for (const m of toMove) m.convenio = '2024-001';
    } else if (diff22 < 0 && diff24 > 0) {
      const move = Math.min(-diff22, diff24);
      const toMove = allCarros.filter(c => c.institucion === inst && c.convenio === '2024-001').slice(0, move);
      for (const m of toMove) m.convenio = '2022-006';
    }
  }

  // 5. Auditoría final 100%
  console.log('\n================ AUDITORÍA FINAL TRAS TRASLADOS Y AJUSTES ================');
  const finalTable = [];
  let allPerfect = true;

  for (const inst of insts) {
    const p22 = allScreens.filter(s => s.institucion === inst && s.convenio === '2022-006').length;
    const p24 = allScreens.filter(s => s.institucion === inst && s.convenio === '2024-001').length;
    const c22 = allCarros.filter(c => c.institucion === inst && c.convenio === '2022-006').length;
    const c24 = allCarros.filter(c => c.institucion === inst && c.convenio === '2024-001').length;

    let expectedC22 = p22;
    if (inst === 'CIUDADELA DEL SUR') expectedC22 += 1;
    if (inst === 'CRISTOBAL COLON') expectedC22 += 1;

    const ok22 = (c22 === expectedC22);
    const ok24 = (c24 === p24);
    if (!ok22 || !ok24) allPerfect = false;

    finalTable.push({
      Institucion: inst,
      P_2022: p22,
      C_2022: c22,
      Status_22: ok22 ? (expectedC22 > p22 ? 'OK (+1 SOBRANTE)' : '100% PARIDAD') : `ERROR (${c22 - expectedC22})`,
      P_2024: p24,
      C_2024: c24,
      Status_24: ok24 ? '100% PARIDAD' : `ERROR (${c24 - p24})`
    });
  }

  console.table(finalTable);

  const totC22 = allCarros.filter(c => c.convenio === '2022-006').length;
  const totC24 = allCarros.filter(c => c.convenio === '2024-001').length;
  const totP22 = allScreens.filter(s => s.convenio === '2022-006').length;
  const totP24 = allScreens.filter(s => s.convenio === '2024-001').length;

  console.log('\n--- TOTALES GLOBALES ---');
  console.log(`Convenio 2022-006 -> Pantallas: ${totP22}, Carros: ${totC22} (Sobrantes: ${totC22 - totP22})`);
  console.log(`Convenio 2024-001 -> Pantallas: ${totP24}, Carros: ${totC24} (Diferencia: ${totC24 - totP24})`);
  console.log(`¿Todas las instituciones tienen paridad perfecta y sobran exactamente los 2 carros sin tablets?: ${allPerfect ? 'SI, 100% PERFECTO' : 'NO'}`);

  await c.close();
}

testFullSolution().catch(console.error);

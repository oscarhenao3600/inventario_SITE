const { MongoClient } = require('mongodb');

async function simulateStrictBalance() {
  const c = new MongoClient(process.env.MONGODB_URI);
  await c.connect();
  const db = c.db(process.env.DB_NAME);
  const col = db.collection('dispositivos');

  // Load all data
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

  console.log(`Carros iniciales -> 2022-006: ${carros.filter(c => c.convenio === '2022-006').length}, 2024-001: ${carros.filter(c => c.convenio === '2024-001').length}`);
  console.log(`Pantallas iniciales -> 2022-006: ${pantallas.filter(s => s.convenio === '2022-006').length}, 2024-001: ${pantallas.filter(s => s.convenio === '2024-001').length}`);

  // Confirmar las 2 sobrantes fijas en 2022-006 sin tablets
  // 1. Placa 46566: CIUDADELA DEL SUR, AULA COWORKING (TE=0, "OK CONFIRMADO CARRO SIN TABLETS")
  // 2. Placa 22639: CRISTOBAL COLON, RECTORIA (TE=0, "Nuevo encontrado aula 11")
  const sobrantes2022 = ['46566', '22639'];

  for (const p of sobrantes2022) {
    const car = carros.find(c => c.placa === p);
    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    console.log(`Sobrante fija 2022: Placa ${p}, Inst: ${car.institucion}, Aula: ${car.aula}, TE: ${teMap[k] || 0}`);
  }

  // PASO 1: Movimientos de carros entre sedes dentro de la misma institución donde sea necesario
  // 1. LA ADIELA: Sede LA ADIELA tiene 11 carros (meta 10), Sede LA CECILIA tiene 9 carros (meta 10)
  // Movemos 1 carro de LA ADIELA a LA CECILIA
  const adielaCart = carros.find(c => c.institucion === 'LA ADIELA' && c.sede === 'LA ADIELA' && c.convenio === '2022-006' && !teMap[`LA ADIELA|||LA ADIELA|||${c.aula.toUpperCase()}`]);
  if (adielaCart) {
    console.log(`Mover dentro de LA ADIELA: Placa ${adielaCart.placa} de LA ADIELA -> LA CECILIA (AULA RECTORIA)`);
    adielaCart.sede = 'LA CECILIA';
    adielaCart.aula = 'RECTORIA';
  }

  // 2. RUFINO SUR: MADRE MARCELINA tiene 10 carros (meta 9), RUFINO SUR sede tiene 0 carros (meta 1)
  const rufinoSurCart = carros.find(c => c.institucion === 'RUFINO JOSÉ CUERVO SUR' && c.sede === 'MADRE MARCELINA' && c.convenio === '2022-006');
  if (rufinoSurCart) {
    console.log(`Mover dentro de RUFINO SUR: Placa ${rufinoSurCart.placa} de MADRE MARCELINA -> RUFINO JOSÉ CUERVO SUR (RECTORIA)`);
    rufinoSurCart.sede = 'RUFINO JOSÉ CUERVO SUR';
    rufinoSurCart.aula = 'RECTORIA';
  }

  // 3. TERESITA MONTES: LUIS CARLOS GALAN tiene excedentes, TERESITA MONTES sede tiene faltante de 2
  // En Teresita Montes sede P22=4, C22=2. En Galan P22=14, C22=10, C24=6 (total 16).
  // Movemos 2 carros de Galan a Teresita Montes sede:
  const galanCarts = carros.filter(c => c.institucion === 'TERESITA MONTES' && c.sede === 'LUIS CARLOS GALAN').slice(0, 2);
  for (const gc of galanCarts) {
    console.log(`Mover dentro de TERESITA MONTES: Placa ${gc.placa} de LUIS CARLOS GALAN -> TERESITA MONTES (RECTORIA)`);
    gc.sede = 'TERESITA MONTES';
    gc.aula = 'RECTORIA';
  }

  // PASO 2: SWAPS DE CONVENIO ENTRE 2022-006 Y 2024-001
  // Buscamos paridad exacta: N carros 22->24 y N carros 24->22
  // Veamos cuántos carros 22->24 directos tenemos por institución:
  // Priorizamos aulas donde la pantalla es del otro convenio
  const screenByAula = {};
  for (const s of pantallas) {
    const k = `${(s.institucion||'').trim().toUpperCase()}|||${(s.sede||'').trim().toUpperCase()}|||${(s.aula||'').trim().toUpperCase()}`;
    screenByAula[k] = s;
  }

  // Identificar candidatos naturales por aula
  const to2024 = [];
  const to2022 = [];

  for (const car of carros) {
    if (sobrantes2022.includes(car.placa)) continue;

    const k = `${(car.institucion||'').trim().toUpperCase()}|||${(car.sede||'').trim().toUpperCase()}|||${(car.aula||'').trim().toUpperCase()}`;
    const s = screenByAula[k];

    if (s) {
      if (car.convenio === '2022-006' && s.convenio === '2024-001') {
        to2024.push(car);
      } else if (car.convenio === '2024-001' && s.convenio === '2022-006') {
        to2022.push(car);
      }
    }
  }

  console.log(`\nCandidatos directos por coincidencia de aula -> 22->24: ${to2024.length}, 24->22: ${to2022.length}`);

  // Para que el balance global sea 100% exacto (431 y 300), el número de cambios 22->24 debe ser exactamente igual al de 24->22.
  // to2024 tiene 40 carros.
  // to2022 tiene 61 carros.
  // Si seleccionamos exactamente 40 de to2022, o expandimos to2024?
  // Veamos: ¿qué instituciones tienen carros en 2022-006 que pueden pasar a 2024-001?
  // Revisemos Ciudadela del Sur: tiene P22=26, P24=26. Tenía 56 carros en 2022 y 1 en 2024.
  // En to2024 entraron 24 carros de Ciudadela del Sur. Pero Ciudadela del Sur necesita 25 para llegar a 26 en 2024!
  // Agregando ese 1 carro de Ciudadela del Sur, to2024 llega a 41!
  // Y qué tal en CASD, Camara Junior, Bosques de Pinares, etc.?

  // Evaluemos el plan de swaps equilibrado:
  await c.close();
}

simulateStrictBalance().catch(console.error);

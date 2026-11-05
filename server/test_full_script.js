const { MongoClient } = require('mongodb');

async function testFullScript() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const kitTypes = [
    'Pantalla Interactiva Táctil',
    'Servidor Portable de Aula SITE Sistema Cloud',
    'Soporte Electrónico Pantalla Interactiva Táctil',
    'Tablet Para Docentes'
  ];

  const docs = await col.find({ dispositivo: { $in: kitTypes } }).toArray();
  console.log(`Dispositivos de kit cargados: ${docs.length}`);

  // In-memory clones
  const sim = docs.map(d => ({ ...d }));

  function moveKitItems(inst, fromConv, toConv, count) {
    let p = 0, srv = 0, sop = 0;
    for (const d of sim) {
      if (d.institucion === inst && d.convenio === fromConv) {
        if (d.dispositivo === 'Pantalla Interactiva Táctil' && p < count) {
          d.convenio = toConv;
          p++;
        } else if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud' && srv < count) {
          d.convenio = toConv;
          srv++;
        } else if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil' && sop < count) {
          d.convenio = toConv;
          sop++;
        }
      }
    }
  }

  // 1. Reasignaciones de kits
  moveKitItems('CIUDADELA CUYABRA', '2022-006', '2024-001', 6);
  moveKitItems('CIUDADELA DE OCCIDENTE', '2022-006', '2024-001', 2);
  moveKitItems('NORMAL SUPERIOR', '2022-006', '2024-001', 1);
  moveKitItems('CAMARA JUNIOR', '2022-006', '2024-001', 1);

  moveKitItems('ITI', '2024-001', '2022-006', 1);
  moveKitItems('LA ADIELA', '2024-001', '2022-006', 1);
  moveKitItems('RUFINO CENTRO', '2024-001', '2022-006', 1);
  moveKitItems('RUFINO JOSÉ CUERVO SUR', '2024-001', '2022-006', 1);
  moveKitItems('SANTA TERESA DE JESUS', '2024-001', '2022-006', 3);
  moveKitItems('EL CAIMO', '2024-001', '2022-006', 2);

  // Sobrante en Gabriela Mistral (placa 47058, 46956, 46994)
  for (const d of sim) {
    if (d.institucion === 'ENRIQUE OLAYA HERRERA' && ['47058', '46956', '46994'].includes(d.placa)) {
      d.convenio = 'SOBRANTE';
    }
  }

  // 2. Reasignaciones de Tablets Docentes para que coincidan con Pantallas en cada institución
  const insts = [...new Set(sim.map(d => d.institucion))].sort();

  for (const inst of insts) {
    const p22 = sim.filter(d => d.institucion === inst && d.convenio === '2022-006' && d.dispositivo === 'Pantalla Interactiva Táctil').length;
    const p24 = sim.filter(d => d.institucion === inst && d.convenio === '2024-001' && d.dispositivo === 'Pantalla Interactiva Táctil').length;
    const p25 = sim.filter(d => d.institucion === inst && d.convenio === '2025-001' && d.dispositivo === 'Pantalla Interactiva Táctil').length;

    const tds = sim.filter(d => d.institucion === inst && d.dispositivo === 'Tablet Para Docentes');
    let assigned22 = 0, assigned24 = 0, assigned25 = 0;

    tds.forEach(t => {
      if (assigned25 < p25) {
        t.convenio = '2025-001';
        assigned25++;
      } else if (assigned24 < p24) {
        t.convenio = '2024-001';
        assigned24++;
      } else if (assigned22 < p22) {
        t.convenio = '2022-006';
        assigned22++;
      } else {
        // Excedente
        t.convenio = '2022-006';
      }
    });
  }

  // Verificar totales por institución y por convenio
  console.log("\nINSTITUCION                  | CONVENIO | PANTALLAS | SERVIDORES | SOPORTES | TAB_DOCENTE | ESTADO");
  console.log("--------------------------------------------------------------------------------------------------");

  let globalConv = {
    '2022-006': { P: 0, Srv: 0, Sop: 0, TD: 0 },
    '2024-001': { P: 0, Srv: 0, Sop: 0, TD: 0 },
    '2025-001': { P: 0, Srv: 0, Sop: 0, TD: 0 },
    'SOBRANTE': { P: 0, Srv: 0, Sop: 0, TD: 0 }
  };

  for (const inst of insts) {
    for (const conv of ['2022-006', '2024-001', '2025-001']) {
      const p = sim.filter(d => d.institucion === inst && d.convenio === conv && d.dispositivo === 'Pantalla Interactiva Táctil').length;
      const srv = sim.filter(d => d.institucion === inst && d.convenio === conv && d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
      const sop = sim.filter(d => d.institucion === inst && d.convenio === conv && d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
      const td = sim.filter(d => d.institucion === inst && d.convenio === conv && d.dispositivo === 'Tablet Para Docentes').length;

      if (globalConv[conv]) {
        globalConv[conv].P += p;
        globalConv[conv].Srv += srv;
        globalConv[conv].Sop += sop;
        globalConv[conv].TD += td;
      }

      if (p > 0 || srv > 0 || sop > 0 || td > 0) {
        const ok = (p === srv && srv === sop && sop === td);
        console.log(`${inst.padEnd(28)} | ${conv.padEnd(8)} | ${String(p).padStart(9)} | ${String(srv).padStart(10)} | ${String(sop).padStart(8)} | ${String(td).padStart(11)} | ${ok ? '100% OK' : 'DIFERENCIA'}`);
      }
    }
  }

  // Sobrantes
  const pSob = sim.filter(d => d.convenio === 'SOBRANTE' && d.dispositivo === 'Pantalla Interactiva Táctil').length;
  const srvSob = sim.filter(d => d.convenio === 'SOBRANTE' && d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
  const sopSob = sim.filter(d => d.convenio === 'SOBRANTE' && d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
  globalConv['SOBRANTE'].P = pSob;
  globalConv['SOBRANTE'].Srv = srvSob;
  globalConv['SOBRANTE'].Sop = sopSob;

  console.log("\n================ TOTALES GLOBALES SIMULADOS ================");
  console.log(globalConv);

  await client.close();
}

testFullScript().catch(console.error);

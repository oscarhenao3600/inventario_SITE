const { MongoClient } = require('mongodb');

// Metas definidas por el usuario para cada convenio
const metas2022 = [
  { inst: "BOSQUES DE PINARES", sede: "BOSQUES DE PINARES", target: 3 },
  { inst: "BOSQUES DE PINARES", sede: "PINARES", target: 3 },
  { inst: "BOSQUES DE PINARES", sede: "SIMON RODRIGUEZ", target: 2 },
  { inst: "CAMARA JUNIOR", sede: "CAMARA JUNIOR", target: 6 },
  { inst: "CAMARA JUNIOR", sede: "CIUDAD MILAGRO", target: 3 },
  { inst: "CAMARA JUNIOR", sede: "LA PAVONA", target: 5 },
  { inst: "CAMILO TORRES", sede: "JORGE ELIECER GAITAN", target: 6 },
  { inst: "NUEVA GRANADA", sede: "NUEVA GRANADA", target: 6 }, // Nota: puede estar como NUESTRA SEÑORA DE BELEN - NUEVA GRANADA
  { inst: "CASD", sede: "SANTA EUFRASIA", target: 21 },
  { inst: "CIUDAD DORADA", sede: "CIUDAD DORADA", target: 15 },
  { inst: "CIUDADELA CUYABRA", sede: "CIUDADELA CUYABRA", target: 9 },
  { inst: "CIUDADELA CUYABRA", sede: "LUIS BERNAL GIRALDO", target: 6 },
  { inst: "CIUDADELA DE OCCIDENTE", sede: "CIUDADELA DE OCCIDENTE", target: 8 },
  { inst: "CIUDADELA DEL SUR", sede: "CIUDADELA DEL SUR", target: 9 },
  { inst: "CIUDADELA DEL SUR", sede: "JUAN XXIII", target: 15 }, // LA FACHADA JUAN XXIII
  { inst: "CIUDADELA DEL SUR", sede: "PUERTO ESPEJO", target: 10 },
  { inst: "CRISTOBAL COLON", sede: "CRISTOBAL COLON", target: 12 },
  { inst: "CRISTOBAL COLON", sede: "GRAN COLOMBIA", target: 11 },
  { inst: "EL CAIMO", sede: "ATANASIO GIRARDOT", target: 1 },
  { inst: "EL CAIMO", sede: "CORINTO", target: 1 },
  { inst: "EL CAIMO", sede: "EL CAIMO", target: 3 },
  { inst: "EL CAIMO", sede: "EL MESÓN", target: 1 },
  { inst: "EL CAIMO", sede: "ETELVINA LÓPEZ", target: 1 },
  { inst: "EL CAIMO", sede: "JOSÉ ANTONIO GALÁN", target: 2 },
  { inst: "EL CAIMO", sede: "JOSE MARIA CÓRDOBA", target: 1 },
  { inst: "EL CAIMO", sede: "LA PRADERA", target: 1 },
  { inst: "EL CAIMO", sede: "MURILLO", target: 1 },
  { inst: "EL CAIMO", sede: "NUEVO REINO", target: 2 },
  { inst: "EL CAIMO", sede: "PASTORA MONTOYA", target: 1 },
  { inst: "EL CAIMO", sede: "SANTA ANA", target: 1 },
  { inst: "EL CAIMO", sede: "TIGREROS", target: 1 },
  { inst: "EL CAIMO", sede: "VILLA OLIVA", target: 1 },
  { inst: "ENRIQUE OLAYA HERRERA", sede: "ENRIQUE OLAYA HERRERA", target: 5 },
  { inst: "ENRIQUE OLAYA HERRERA", sede: "GABRIELA MISTRAL", target: 3 },
  { inst: "NORMAL SUPERIOR", sede: "CIUDAD ARMENIA", target: 9 },
  { inst: "NORMAL SUPERIOR", sede: "REPUBLICA DE URUGUAY", target: 3 },
  { inst: "NORMAL SUPERIOR", sede: "NORMAL SUPERIOR", target: 4 },
  { inst: "NORMAL SUPERIOR", sede: "GUSTAVO ROJAS PINILLA", target: 13 },
  { inst: "EUDORO GRANADA", sede: "AGUSTIN NIETO CABALLERO", target: 6 },
  { inst: "EUDORO GRANADA", sede: "LOS FUNDADORES", target: 6 },
  { inst: "RUFINO JOSÉ CUERVO SUR", sede: "MADRE MARCELINA", target: 10 },
  { inst: "GUSTAVO MATAMOROS D´COSTA", sede: "GUSTAVO MATAMOROS D´COSTA", target: 9 },
  { inst: "INEM", sede: "INEM", target: 10 },
  { inst: "LAS COLINAS", sede: "LAS COLINAS", target: 13 },
  { inst: "LAURA VICUÑA", sede: "LAURA VICUÑA", target: 12 },
  { inst: "LOS QUINDOS", sede: "LOS QUINDOS", target: 10 },
  { inst: "LOS QUINDOS", sede: "POLICARPA SALABARRIETA", target: 10 },
  { inst: "LOS QUINDOS", sede: "ROSANA LONDOÑO", target: 7 },
  { inst: "RUFINO CENTRO", sede: "RUFINO CENTRO", target: 29 },
  { inst: "RUFINO CENTRO", sede: "ANTONIA SANTOS", target: 9 },
  { inst: "ITI", sede: "ITI", target: 15 },
  { inst: "REPUBLICA DE FRANCIA", sede: "REPUBLICA DE FRANCIA", target: 9 },
  { inst: "SANTA TERESA DE JESUS", sede: "LA FLORIDA", target: 10 },
  { inst: "SANTA TERESA DE JESUS", sede: "SANTA TERESA DE JESUS", target: 4 },
  { inst: "MARCELINO CHAMPAGNAT", sede: "ZULDEMAYDA", target: 12 },
  { inst: "TERESITA MONTES", sede: "TERESITA MONTES", target: 2 },
  { inst: "TERESITA MONTES", sede: "JUAN PABLO I", target: 5 },
  { inst: "TERESITA MONTES", sede: "LUIS CARLOS GALAN", target: 16 },
  { inst: "LA ADIELA", sede: "LA ADIELA", target: 11 },
  { inst: "LA ADIELA", sede: "LA CECILIA", target: 9 }
];

const metas2024 = [
  { inst: "BOSQUES DE PINARES", sede: "BOSQUES DE PINARES", target: 9 },
  { inst: "BOSQUES DE PINARES", sede: "PINARES", target: 3 },
  { inst: "BOSQUES DE PINARES", sede: "SIMON RODRIGUEZ", target: 13 },
  { inst: "CAMARA JUNIOR", sede: "CAMARA JUNIOR", target: 10 },
  { inst: "CAMARA JUNIOR", sede: "CIUDAD MILAGRO", target: 8 },
  { inst: "CAMILO TORRES", sede: "CAMILO TORRES", target: 12 },
  { inst: "CAMILO TORRES", sede: "JORGE ELIECER GAITAN", target: 1 },
  { inst: "CASD", sede: "HERMOGENES MAZA", target: 32 },
  { inst: "CASD", sede: "SANTA EUFRASIA", target: 15 },
  { inst: "CIUDAD DORADA", sede: "CIUDAD DORADA", target: 5 },
  { inst: "CIUDADELA CUYABRA", sede: "CIUDADELA CUYABRA", target: 11 },
  { inst: "CIUDADELA CUYABRA", sede: "LUIS BERNAL GIRALDO", target: 1 },
  { inst: "CIUDADELA DE OCCIDENTE", sede: "CIUDADELA DE OCCIDENTE", target: 30 },
  { inst: "CIUDADELA DEL SUR", sede: "CIUDADELA DEL SUR", target: 26 },
  { inst: "CRISTOBAL COLON", sede: "CRISTOBAL COLON", target: 1 },
  { inst: "CRISTOBAL COLON", sede: "GRAN COLOMBIA", target: 1 },
  { inst: "EL CAIMO", sede: "EL MESÓN", target: 1 },
  { inst: "EL CAIMO", sede: "JOSE MARIA CÓRDOBA", target: 1 },
  { inst: "EL CAIMO", sede: "LA ESPERANZA", target: 6 },
  { inst: "EL CAIMO", sede: "SANTA ANA", target: 1 }, // SANTANA
  { inst: "ENRIQUE OLAYA HERRERA", sede: "ENRIQUE OLAYA HERRERA", target: 1 },
  { inst: "ENRIQUE OLAYA HERRERA", sede: "GABRIELA MISTRAL", target: 8 },
  { inst: "EUDORO GRANADA", sede: "EUDORO GRANADA", target: 10 },
  { inst: "GUSTAVO MATAMOROS D´COSTA", sede: "GUSTAVO MATAMOROS D´COSTA", target: 22 },
  { inst: "INEM", sede: "INEM", target: 10 },
  { inst: "LAURA VICUÑA", sede: "LAURA VICUÑA", target: 12 },
  { inst: "NORMAL SUPERIOR", sede: "CIUDAD ARMENIA", target: 8 },
  { inst: "NORMAL SUPERIOR", sede: "NORMAL SUPERIOR", target: 38 },
  { inst: "NORMAL SUPERIOR", sede: "GUSTAVO ROJAS PINILLA", target: 4 }
];

const metas2025 = [
  { inst: "BOSQUES DE PINARES", sede: "BOSQUES DE PINARES", target: 3 },
  { inst: "BOSQUES DE PINARES", sede: "PINARES", target: 1 },
  { inst: "BOSQUES DE PINARES", sede: "SIMON RODRIGUEZ", target: 1 },
  { inst: "CAMARA JUNIOR", sede: "CAMARA JUNIOR", target: 1 },
  { inst: "CAMARA JUNIOR", sede: "LA PAVONA", target: 1 },
  { inst: "CAMARA JUNIOR", sede: "CIUDAD MILAGRO", target: 2 },
  { inst: "CAMILO TORRES", sede: "CAMILO TORRES", target: 0 },
  { inst: "CAMILO TORRES", sede: "JORGE ELIECER GAITAN", target: 2 },
  { inst: "CASD", sede: "HERMOGENES MAZA", target: 1 },
  { inst: "CASD", sede: "SANTA EUFRASIA", target: 5 },
  { inst: "CIUDAD DORADA", sede: "CIUDAD DORADA", target: 3 },
  { inst: "CIUDADELA CUYABRA", sede: "CIUDADELA CUYABRA", target: 1 },
  { inst: "CIUDADELA CUYABRA", sede: "LUIS BERNAL GIRALDO", target: 1 },
  { inst: "CIUDADELA DE OCCIDENTE", sede: "CIUDADELA DE OCCIDENTE", target: 2 },
  { inst: "CIUDADELA DE OCCIDENTE", sede: "PARQUES DE BOLIVAR", target: 2 },
  { inst: "CIUDADELA DEL SUR", sede: "CIUDADELA DEL SUR", target: 3 },
  { inst: "CIUDADELA DEL SUR", sede: "JUAN XXIII", target: 2 },
  { inst: "CIUDADELA DEL SUR", sede: "PUERTO ESPEJO", target: 2 },
  { inst: "CRISTOBAL COLON", sede: "CRISTOBAL COLON", target: 6 },
  { inst: "CRISTOBAL COLON", sede: "GRAN COLOMBIA", target: 4 },
  { inst: "EL CAIMO", sede: "EL CAIMO", target: 1 },
  { inst: "EL CAIMO", sede: "TIGREROS", target: 1 },
  { inst: "ENRIQUE OLAYA HERRERA", sede: "ENRIQUE OLAYA HERRERA", target: 1 },
  { inst: "ENRIQUE OLAYA HERRERA", sede: "GABRIELA MISTRAL", target: 0 },
  { inst: "NORMAL SUPERIOR", sede: "CIUDAD ARMENIA", target: 1 },
  { inst: "NORMAL SUPERIOR", sede: "REPUBLICA DE URUGUAY", target: 2 },
  { inst: "NORMAL SUPERIOR", sede: "NORMAL SUPERIOR", target: 1 },
  { inst: "NORMAL SUPERIOR", sede: "GUSTAVO ROJAS PINILLA", target: 2 },
  { inst: "EUDORO GRANADA", sede: "AGUSTIN NIETO CABALLERO", target: 1 },
  { inst: "EUDORO GRANADA", sede: "EUDORO GRANADA", target: 1 },
  { inst: "EUDORO GRANADA", sede: "LOS FUNDADORES", target: 1 },
  { inst: "GUSTAVO MATAMOROS D´COSTA", sede: "GUSTAVO MATAMOROS D´COSTA", target: 3 },
  { inst: "INEM", sede: "INEM", target: 25 },
  { inst: "ITI", sede: "ITI", target: 21 },
  { inst: "LA ADIELA", sede: "LA CECILIA", target: 14 },
  { inst: "LA ADIELA", sede: "LA ADIELA", target: 10 },
  { inst: "LAS COLINAS", sede: "LAS COLINAS", target: 3 },
  { inst: "LAURA VICUÑA", sede: "LAURA VICUÑA", target: 1 },
  { inst: "LOS QUINDOS", sede: "LOS QUINDOS", target: 3 },
  { inst: "LOS QUINDOS", sede: "POLICARPA SALABARRIETA", target: 2 },
  { inst: "LOS QUINDOS", sede: "ROSANA LONDOÑO", target: 2 },
  { inst: "MARCELINO CHAMPAGNAT", sede: "MARCELINO CHAMPAGNAT", target: 24 },
  { inst: "NACIONAL JESUS MARIA OCAMPO", sede: "NACIONAL JESUS MARIA OCAMPO", target: 17 },
  { inst: "NUESTRA SEÑORA DE BELEN", sede: "NUESTRA SEÑORA DE BELEN", target: 15 },
  { inst: "RUFINO CENTRO", sede: "RUFINO CENTRO", target: 33 },
  { inst: "RUFINO CENTRO", sede: "ANTONIA SANTOS", target: 6 },
  { inst: "RUFINO JOSÉ CUERVO SUR", sede: "MADRE MARCELINA", target: 15 },
  { inst: "RUFINO JOSÉ CUERVO SUR", sede: "RUFINO JOSÉ CUERVO SUR", target: 31 },
  { inst: "REPUBLICA DE FRANCIA", sede: "REPUBLICA DE FRANCIA", target: 2 },
  { inst: "SANTA TERESA DE JESUS", sede: "SANTA TERESA DE JESUS", target: 14 },
  { inst: "SANTA TERESA DE JESUS", sede: "LA FLORIDA", target: 2 },
  { inst: "TERESITA MONTES", sede: "TERESITA MONTES", target: 1 },
  { inst: "TERESITA MONTES", sede: "JUAN PABLO I", target: 1 },
  { inst: "TERESITA MONTES", sede: "LUIS CARLOS GALAN", target: 3 }
];

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  function normalize(str) {
    if (!str) return '';
    return str.toString().trim().toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  // Get all devices
  const allDocs = await col.find({}).toArray();

  async function checkConvenio(convName, metas) {
    console.log(`\n======================================================`);
    console.log(`VERIFICACIÓN CONVENIO: ${convName}`);
    console.log(`======================================================`);

    // Group actual devices in this convenio by normalized inst & sede
    const actualMap = {};
    for (const d of allDocs) {
      if (d.convenio !== convName) continue;
      const kInst = normalize(d.institucion);
      const kSede = normalize(d.sede);
      const key = `${kInst} ||| ${kSede}`;
      if (!actualMap[key]) {
        actualMap[key] = {
          rawInst: d.institucion,
          rawSede: d.sede,
          pantallas: 0,
          servidores: 0,
          soportes: 0,
          carros: 0,
          docentes: 0,
          estudiantes: 0,
          otros: 0
        };
      }
      if (d.dispositivo === 'Pantalla Interactiva Táctil') actualMap[key].pantallas++;
      else if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') actualMap[key].servidores++;
      else if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') actualMap[key].soportes++;
      else if (d.dispositivo === 'Carro Cargador de Tabletas') actualMap[key].carros++;
      else if (d.dispositivo === 'Tablet Para Docentes') actualMap[key].docentes++;
      else if (d.dispositivo === 'Tablet Para Estudiantes') actualMap[key].estudiantes++;
      else actualMap[key].otros++;
    }

    let diffCount = 0;
    const diffs = [];

    for (const m of metas) {
      const normInst = normalize(m.inst);
      const normSede = normalize(m.sede);
      
      // Try exact match or partial match
      let foundKey = Object.keys(actualMap).find(k => {
        const [actInst, actSede] = k.split(' ||| ');
        return (actSede === normSede || actSede.includes(normSede) || normSede.includes(actSede)) &&
               (actInst === normInst || actInst.includes(normInst) || normInst.includes(actInst));
      });

      // Special mappings if needed
      if (!foundKey) {
        if (normSede.includes('URUGUAY')) {
          foundKey = Object.keys(actualMap).find(k => k.includes('URUGUAY'));
        } else if (normSede.includes('JUAN XXIII') || normSede.includes('FACHADA')) {
          foundKey = Object.keys(actualMap).find(k => k.includes('JUAN XXIII') || k.includes('FACHADA'));
        } else if (normSede.includes('GRAN COLOMBIA') || normSede.includes('GRANCOLOMBIA')) {
          foundKey = Object.keys(actualMap).find(k => k.includes('GRAN COLOMBIA') || k.includes('GRANCOLOMBIA'));
        } else if (normSede.includes('NUEVA GRANADA')) {
          foundKey = Object.keys(actualMap).find(k => k.includes('NUEVA GRANADA'));
        } else if (normSede.includes('MADRE MARCELINA')) {
          foundKey = Object.keys(actualMap).find(k => k.includes('MADRE MARCELINA'));
        } else if (normSede.includes('ZULDEMAYDA')) {
          foundKey = Object.keys(actualMap).find(k => k.includes('ZULDEMAYDA'));
        } else if (normSede.includes('HERMOGENES MAZA')) {
          foundKey = Object.keys(actualMap).find(k => k.includes('HERMOGENES MAZA'));
        }
      }

      const act = foundKey ? actualMap[foundKey] : null;
      const actualPan = act ? act.pantallas : 0;
      const dif = actualPan - m.target;

      if (dif !== 0 || !act || act.pantallas !== act.servidores || act.pantallas !== act.soportes) {
        diffCount++;
        diffs.push({
          inst: m.inst,
          sede: m.sede,
          target: m.target,
          actualPan: actualPan,
          actualSer: act ? act.servidores : 0,
          actualSop: act ? act.soportes : 0,
          actualCar: act ? act.carros : 0,
          actualDoc: act ? act.docentes : 0,
          actualEst: act ? act.estudiantes : 0,
          dif: dif,
          foundKey: foundKey || 'NO ENCONTRADA'
        });
      }
    }

    console.log(`Total diferencias encontradas en ${convName}: ${diffCount}`);
    if (diffs.length > 0) {
      console.table(diffs);
    } else {
      console.log(`¡TODAS LAS SEDES DE ${convName} COINCIDEN EXACTAMENTE CON LA META!`);
    }

    // Check if there are keys in actualMap that were NOT in metas
    const unusedKeys = Object.keys(actualMap).filter(k => {
      const [actInst, actSede] = k.split(' ||| ');
      return !metas.some(m => {
        const nI = normalize(m.inst);
        const nS = normalize(m.sede);
        return (actSede === nS || actSede.includes(nS) || nS.includes(actSede)) &&
               (actInst === nI || actInst.includes(nI) || nI.includes(actInst));
      });
    });

    if (unusedKeys.length > 0) {
      console.log(`\nSedes en BD con dispositivos en ${convName} no mapeadas directamente en metas:`);
      for (const uk of unusedKeys) {
        console.log(`- ${uk}: Pantallas: ${actualMap[uk].pantallas}, Servidores: ${actualMap[uk].servidores}, Soportes: ${actualMap[uk].soportes}`);
      }
    }
  }

  await checkConvenio('2022-006', metas2022);
  await checkConvenio('2024-001', metas2024);
  await checkConvenio('2025-001', metas2025);

  await client.close();
}

main().catch(console.error);

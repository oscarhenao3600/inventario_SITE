const { MongoClient } = require('mongodb');

const target2022 = [
  { inst: "BOSQUES DE PINARES", sede: "BOSQUES DE PINARES", target: 3 },
  { inst: "BOSQUES DE PINARES", sede: "PINARES", target: 3 },
  { inst: "BOSQUES DE PINARES", sede: "SIMON RODRIGUEZ", target: 2 },
  { inst: "CAMARA JUNIOR", sede: "CAMARA JUNIOR", target: 6 },
  { inst: "CAMARA JUNIOR", sede: "CIUDAD MILAGRO", target: 3 },
  { inst: "CAMARA JUNIOR", sede: "LA PAVONA", target: 5 },
  { inst: "CAMILO TORRES", sede: "JORGE ELIECER GAITAN", target: 6 },
  { inst: "NUEVA GRANADA", sede: "NUEVA GRANADA", target: 6 },
  { inst: "CASD HERMOGENES MAZA", sede: "SANTA EUFRASIA", target: 21 },
  { inst: "CIUDAD DORADA", sede: "CIUDAD DORADA", target: 15 },
  { inst: "CIUDADELA CUYABRA", sede: "CIUDADELA CUYABRA", target: 9 },
  { inst: "CIUDADELA CUYABRA", sede: "LUIS BERNAL GIRALDO", target: 6 },
  { inst: "CIUDADELA DE OCCIDENTE", sede: "CIUDADELA DE OCCIDENTE", target: 8 },
  { inst: "CIUDADELA DEL SUR", sede: "CIUDADELA DEL SUR", target: 9 },
  { inst: "CIUDADELA DEL SUR", sede: "LA FACHADA JUAN XXIII", target: 15 },
  { inst: "CIUDADELA DEL SUR", sede: "PUERTO ESPEJO", target: 10 },
  { inst: "CRISTOBAL COLON", sede: "CRISTOBAL COLON", target: 12 },
  { inst: "CRISTOBAL COLON", sede: "GRANCOLOMBIA", target: 11 },
  { inst: "EL CAIMO", sede: "ATANASIO GIRARDOT", target: 1 },
  { inst: "EL CAIMO", sede: "CORINTO", target: 1 },
  { inst: "EL CAIMO", sede: "EL CAIMO", target: 3 },
  { inst: "EL CAIMO", sede: "EL MESON", target: 1 },
  { inst: "EL CAIMO", sede: "ETELVINA LOPEZ", target: 1 },
  { inst: "EL CAIMO", sede: "JOSE ANTONIO GALAN", target: 2 },
  { inst: "EL CAIMO", sede: "JOSE MARIA CORDOBA", target: 1 },
  { inst: "EL CAIMO", sede: "LA PRADERA", target: 1 },
  { inst: "EL CAIMO", sede: "MURILLO", target: 1 },
  { inst: "EL CAIMO", sede: "NUEVO REINO", target: 2 },
  { inst: "EL CAIMO", sede: "PASTORA DE MONTOYA", target: 1 },
  { inst: "EL CAIMO", sede: "SANTA ANA", target: 1 },
  { inst: "EL CAIMO", sede: "TIGREROS", target: 1 },
  { inst: "EL CAIMO", sede: "VILLA OLIVA", target: 1 },
  { inst: "ENRIQUE OLAYA HERRERA", sede: "ENRIQUE OLAYA HERRERA", target: 5 },
  { inst: "ENRIQUE OLAYA HERRERA", sede: "GABRIELA MISTRAL", target: 3 },
  { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "CIUDAD ARMENIA", target: 9 },
  { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "SEDE URUGUAY", target: 3 },
  { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", target: 4 },
  { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "GUSTAVO ROJAS PINILLA", target: 13 },
  { inst: "EUDORO GRANADA", sede: "AGUSTIN NIETO CABALLERO", target: 6 },
  { inst: "EUDORO GRANADA", sede: "FUNDADORES", target: 6 },
  { inst: "MADRE MARCELINA", sede: "MADRE MARCELINA", target: 10 },
  { inst: "GUSTAVO MATAMOROS D´COSTA", sede: "GUSTAVO MATAMOROS D´COSTA", target: 9 },
  { inst: "INEM JOSE CELESTINO MUTIS", sede: "INEM JOSE CELESTINO MUTIS", target: 10 },
  { inst: "LAS COLINAS", sede: "LAS COLINAS", target: 13 },
  { inst: "LAURA VICUÑA", sede: "LAURA VICUÑA", target: 12 },
  { inst: "LOS QUINDIOS", sede: "LOS QUINDIOS", target: 10 },
  { inst: "LOS QUINDIOS", sede: "POLICARPA SALAVARRIETA", target: 10 },
  { inst: "LOS QUINDIOS", sede: "ROSANA LONDOÑO", target: 7 },
  { inst: "RUFINO JOSE CUERVO CENTRO", sede: "RUFINO JOSE CUERVO CENTRO", target: 29 },
  { inst: "RUFINO JOSE CUERVO CENTRO", sede: "ANTONIA SANTOS", target: 9 },
  { inst: "INSTITUTO TECNICO INDUSTRIAL", sede: "INSTITUTO TECNICO INDUSTRIAL", target: 15 },
  { inst: "REPUBLICA DE FRANCIA", sede: "REPUBLICA DE FRANCIA", target: 9 },
  { inst: "SANTA TERESA DE JESUS", sede: "LA FLORIDA", target: 10 },
  { inst: "SANTA TERESA DE JESUS", sede: "SANTA TERESA DE JESUS", target: 4 },
  { inst: "MARCELINO CHAMPAGNAT", sede: "ZULDEMAYDA", target: 12 },
  { inst: "TERESITA MONTES", sede: "TERESITA MONTES", target: 2 },
  { inst: "TERESITA MONTES", sede: "JUAN PABLO I", target: 5 },
  { inst: "TERESITA MONTES", sede: "LUIS CARLOS GALAN SARMIENTO", target: 16 },
  { inst: "LA ADIELA", sede: "LA ADIELA", target: 11 },
  { inst: "LA ADIELA", sede: "LA CECILIA", target: 9 }
];

async function findExtra2022() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const screens2022 = await col.find({ convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log(`Pantallas en 2022-006: ${screens2022.length} (Meta: 429)`);

  let matched = 0;
  for (const t of target2022) {
    const list = screens2022.filter(s => s.institucion === t.inst && s.sede === t.sede);
    matched += list.length;
    if (list.length !== t.target) {
      console.log(`DIFERENCIA: ${t.inst} | ${t.sede} => Target: ${t.target}, Actual: ${list.length}`);
    }
  }
  console.log(`Total emparejadas: ${matched}`);

  // Buscar si hay pantallas en 2022-006 con institución o sede no listada en target2022:
  const extras = screens2022.filter(s => !target2022.some(t => t.inst === s.institucion && t.sede === s.sede));
  console.log('Pantallas 2022 fuera de metas:', extras.map(e => ({ inst: e.institucion, sede: e.sede, aula: e.aula, placa: e.placa, serial: e.serial })));

  await client.close();
}

findExtra2022().catch(console.error);

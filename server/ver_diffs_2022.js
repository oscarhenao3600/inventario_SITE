const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  // Load target2022
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
    { inst: "MARCELINO CHAMPAGNANT", sede: "ZULDEMAYDA", target: 12 },
    { inst: "TERESITA MONTES", sede: "TERESITA MONTES", target: 2 },
    { inst: "TERESITA MONTES", sede: "JUAN PABLO I", target: 5 },
    { inst: "TERESITA MONTES", sede: "LUIS CARLOS GALAN SARMIENTO", target: 16 },
    { inst: "LA ADIELA", sede: "LA ADIELA", target: 11 },
    { inst: "LA ADIELA", sede: "LA CECILIA", target: 9 }
  ];

  function matchSede(dbInst, dbSede, targetInst, targetSede) {
    const ni = (s) => (s||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, '');
    const di = ni(dbInst);
    const ds = ni(dbSede);
    const ti = ni(targetInst);
    const ts = ni(targetSede);

    if (ts.includes('URUGUAY') && ds.includes('URUGUAY')) return true;
    if ((ts.includes('JUANXXIII') || ts.includes('FACHADA')) && (ds.includes('JUANXXIII') || ds.includes('FACHADA'))) return true;
    if (ts.includes('GRANCOLOMBIA') && ds.includes('GRANCOLOMBIA')) return true;
    if (ts.includes('FUNDADORES') && ds.includes('FUNDADORES')) return true;
    if (ts.includes('LUISCARLOSGALAN') && ds.includes('LUISCARLOSGALAN')) return true;
    if (ts.includes('HERMOGENESMAZA') && ds.includes('HERMOGENESMAZA')) return true;
    if (ts.includes('SANTAEUFRASIA') && ds.includes('SANTAEUFRASIA')) return true;
    if (ts.includes('MADREMARCELINA') && ds.includes('MADREMARCELINA')) return true;
    if (ts.includes('ZULDEMAYDA') && ds.includes('ZULDEMAYDA')) return true;
    if (ts.includes('NUEVAGRANADA') && ds.includes('NUEVAGRANADA')) return true;
    if (ts.includes('SANTANA') && ds.includes('SANTAANA')) return true;
    if (ts.includes('ELMESON') && ds.includes('ELMESON')) return true;
    if (ts.includes('ETELVINALOPEZ') && ds.includes('ETELVINALOPEZ')) return true;
    if (ts.includes('JOSEMARIACORDOBA') && ds.includes('JOSEMARIACORDOBA')) return true;
    if (ts.includes('JOSEANTONIOGALAN') && ds.includes('JOSEANTONIOGALAN')) return true;
    if (ts.includes('PASTORAMONTOYA') && ds.includes('PASTORAMONTOYA')) return true;
    if (ti.includes('RUFINOCENTRO') && di.includes('RUFINOCENTRO')) {
      if (ts.includes('ANTONIASANTOS') && ds.includes('ANTONIASANTOS')) return true;
      if (ts.includes('RUFINOCENTRO') && ds.includes('RUFINOCENTRO')) return true;
    }
    if (ti.includes('RUFINO') && ti.includes('SUR') && di.includes('RUFINO') && di.includes('SUR')) {
      if (ts.includes('MADREMARCELINA') && ds.includes('MADREMARCELINA')) return true;
    }
    if ((ti.includes('ITI') || di.includes('ITI') || di.includes('INDUSTRIAL')) && (ti.includes('INDUSTRIAL') || di.includes('INDUSTRIAL'))) {
      if (ts.includes('ITI') || ds.includes('ITI') || ds.includes('INDUSTRIAL')) return true;
    }
    if (ti.includes('LOSQUIND') && di.includes('LOSQUIND')) {
      if (ts.includes('POLICARPA') && ds.includes('POLICARPA')) return true;
      if (ts.includes('ROSANA') && ds.includes('ROSANA')) return true;
      if (ts === 'LOSQUINDIOS' && ds === 'LOSQUINDOS') return true;
    }
    if (ti.includes('NORMAL') && di.includes('NORMAL')) {
      if (ts.includes('CIUDADARMENIA') && ds.includes('CIUDADARMENIA')) return true;
      if (ts.includes('GUSTAVOROJAS') && ds.includes('GUSTAVOROJAS')) return true;
      if (ts.includes('URUGUAY') && ds.includes('URUGUAY')) return true;
      if (ts.includes('NORMAL') && ds.includes('NORMAL')) return true;
    }

    return (ds === ts || ds.includes(ts) || ts.includes(ds)) &&
           (di === ti || di.includes(ti) || ti.includes(di));
  }

  const convDocs = await col.find({ convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  const diffs = [];

  for (const t of target2022) {
    const matched = convDocs.filter(d => matchSede(d.institucion, d.sede, t.inst, t.sede));
    const actual = matched.length;
    const diff = actual - t.target;
    if (diff !== 0) {
      diffs.push({ inst: t.inst, sede: t.sede, target: t.target, actual, diff });
    }
  }

  console.log(`DIFERENCIAS EN 2022-006 (${diffs.length} sedes):`);
  console.table(diffs);

  await client.close();
}

main();

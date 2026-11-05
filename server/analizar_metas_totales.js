const { MongoClient } = require('mongodb');

// Metas del usuario
const metas = {
  '2022-006': [
    { inst: "BOSQUES DE PINARES", sede: "BOSQUES DE PINARES", target: 3 },
    { inst: "BOSQUES DE PINARES", sede: "PINARES", target: 3 },
    { inst: "BOSQUES DE PINARES", sede: "SIMON RODRIGUEZ", target: 2 },
    { inst: "CAMARA JUNIOR", sede: "CAMARA JUNIOR", target: 6 },
    { inst: "CAMARA JUNIOR", sede: "CIUDAD MILAGRO", target: 3 },
    { inst: "CAMARA JUNIOR", sede: "LA PAVONA", target: 5 },
    { inst: "CAMILO TORRES", sede: "CAMILO TORRES", target: 0 },
    { inst: "CAMILO TORRES", sede: "JORGE ELIECER GAITAN", target: 6 },
    { inst: "NUEVA GRANADA", sede: "NUEVA GRANADA", target: 6 },
    { inst: "CASD HERMOGENES MAZA", sede: "CASD HERMOGENES MAZA", target: 0 },
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
    { inst: "MARCELINO CHAMPAGNANT", sede: "MARCELINO CHAMPAGNANT", target: 0 },
    { inst: "MARCELINO CHAMPAGNANT", sede: "ZULDEMAYDA", target: 12 },
    { inst: "TERESITA MONTES", sede: "TERESITA MONTES", target: 2 },
    { inst: "TERESITA MONTES", sede: "JUAN PABLO I", target: 5 },
    { inst: "TERESITA MONTES", sede: "LUIS CARLOS GALAN SARMIENTO", target: 16 },
    { inst: "LA ADIELA", sede: "LA ADIELA", target: 11 },
    { inst: "LA ADIELA", sede: "LA CECILIA", target: 9 }
  ],
  '2024-001': [
    { inst: "BOSQUES DE PINARES", sede: "BOSQUES DE PINARES", target: 9 },
    { inst: "BOSQUES DE PINARES", sede: "PINARES", target: 3 },
    { inst: "BOSQUES DE PINARES", sede: "SIMON RODRIGUEZ", target: 13 },
    { inst: "CAMARA JUNIOR", sede: "CAMARA JUNIOR", target: 10 },
    { inst: "CAMARA JUNIOR", sede: "CIUDAD MILAGRO", target: 8 },
    { inst: "CAMILO TORRES", sede: "CAMILO TORRES", target: 12 },
    { inst: "CAMILO TORRES", sede: "JORGE ELIECER GAITAN", target: 1 },
    { inst: "CASD HERMOGENES MAZA", sede: "CASD HERMOGENES MAZA", target: 32 },
    { inst: "CASD HERMOGENES MAZA", sede: "SANTA EUFRASIA", target: 15 },
    { inst: "CIUDAD DORADA", sede: "CIUDAD DORADA", target: 5 },
    { inst: "CIUDADELA CUYABRA", sede: "CIUDADELA CUYABRA", target: 11 },
    { inst: "CIUDADELA CUYABRA", sede: "LUIS BERNAL GIRALDO", target: 1 },
    { inst: "CIUDADELA DE OCCIDENTE", sede: "CIUDADELA DE OCCIDENTE", target: 30 },
    { inst: "CIUDADELA DEL SUR", sede: "CIUDADELA DEL SUR", target: 26 },
    { inst: "CRISTOBAL COLON", sede: "CRISTOBAL COLON", target: 1 },
    { inst: "CRISTOBAL COLON", sede: "GRANCOLOMBIA", target: 1 },
    { inst: "EL CAIMO", sede: "EL MESON", target: 1 },
    { inst: "EL CAIMO", sede: "JOSE MARIA CORDOBA", target: 1 },
    { inst: "EL CAIMO", sede: "LA ESPERANZA", target: 6 },
    { inst: "EL CAIMO", sede: "SANTA ANA", target: 1 },
    { inst: "ENRIQUE OLAYA HERRERA", sede: "ENRIQUE OLAYA HERRERA", target: 1 },
    { inst: "ENRIQUE OLAYA HERRERA", sede: "GABRIELA MISTRAL", target: 8 },
    { inst: "EUDORO GRANADA", sede: "EUDORO GRANADA", target: 10 },
    { inst: "GUSTAVO MATAMOROS D´COSTA", sede: "GUSTAVO MATAMOROS D´COSTA", target: 22 },
    { inst: "INEM JOSE CELESTINO MUTIS", sede: "INEM JOSE CELESTINO MUTIS", target: 10 },
    { inst: "LAURA VICUÑA", sede: "LAURA VICUÑA", target: 12 },
    { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "CIUDAD ARMENIA", target: 8 },
    { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", target: 38 },
    { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "GUSTAVO ROJAS PINILLA", target: 4 }
  ],
  '2025-001': [
    { inst: "BOSQUES DE PINARES", sede: "BOSQUES DE PINARES", target: 3 },
    { inst: "BOSQUES DE PINARES", sede: "PINARES", target: 1 },
    { inst: "BOSQUES DE PINARES", sede: "SIMON RODRIGUEZ", target: 1 },
    { inst: "CAMARA JUNIOR", sede: "CAMARA JUNIOR", target: 1 },
    { inst: "CAMARA JUNIOR", sede: "LA PAVONA", target: 1 },
    { inst: "CAMARA JUNIOR", sede: "CIUDAD MILAGRO", target: 2 },
    { inst: "CAMILO TORRES", sede: "CAMILO TORRES", target: 0 },
    { inst: "CAMILO TORRES", sede: "JORGE ELIECER GAITAN", target: 2 },
    { inst: "CASD HERMOGENES MAZA", sede: "CASD HERMOGENES MAZA", target: 1 },
    { inst: "CASD HERMOGENES MAZA", sede: "SANTA EUFRASIA", target: 5 },
    { inst: "CIUDAD DORADA", sede: "CIUDAD DORADA", target: 3 },
    { inst: "CIUDADELA CUYABRA", sede: "CIUDADELA CUYABRA", target: 1 },
    { inst: "CIUDADELA CUYABRA", sede: "LUIS BERNAL GIRALDO", target: 1 },
    { inst: "CIUDADELA DE OCCIDENTE", sede: "CIUDADELA DE OCCIDENTE", target: 2 },
    { inst: "CIUDADELA DE OCCIDENTE", sede: "PARQUES DE BOLIVAR", target: 2 },
    { inst: "CIUDADELA DEL SUR", sede: "CIUDADELA DEL SUR", target: 3 },
    { inst: "CIUDADELA DEL SUR", sede: "LA FACHADA JUAN XXIII", target: 2 },
    { inst: "CIUDADELA DEL SUR", sede: "PUERTO ESPEJO", target: 2 },
    { inst: "CRISTOBAL COLON", sede: "CRISTOBAL COLON", target: 6 },
    { inst: "CRISTOBAL COLON", sede: "GRANCOLOMBIA", target: 4 },
    { inst: "EL CAIMO", sede: "EL CAIMO", target: 1 },
    { inst: "EL CAIMO", sede: "TIGREROS", target: 1 },
    { inst: "ENRIQUE OLAYA HERRERA", sede: "ENRIQUE OLAYA HERRERA", target: 1 },
    { inst: "ENRIQUE OLAYA HERRERA", sede: "GABRIELA MISTRAL", target: 0 },
    { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "CIUDAD ARMENIA", target: 1 },
    { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "SEDE URUGUAY", target: 2 },
    { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", target: 1 },
    { inst: "ESCUELA NORMAL SUPERIOR DEL QUINDIO", sede: "GUSTAVO ROJAS PINILLA", target: 2 },
    { inst: "EUDORO GRANADA", sede: "AGUSTIN NIETO CABALLERO", target: 1 },
    { inst: "EUDORO GRANADA", sede: "EUDORO GRANADA", target: 1 },
    { inst: "EUDORO GRANADA", sede: "FUNDADORES", target: 1 },
    { inst: "GUSTAVO MATAMOROS D´COSTA", sede: "GUSTAVO MATAMOROS D´COSTA", target: 3 },
    { inst: "INEM JOSE CELESTINO MUTIS", sede: "INEM JOSE CELESTINO MUTIS", target: 25 },
    { inst: "INSTITUTO TECNICO INDUSTRIAL", sede: "INSTITUTO TECNICO INDUSTRIAL", target: 21 },
    { inst: "LA ADIELA", sede: "LA CECILIA", target: 14 },
    { inst: "LA ADIELA", sede: "LA ADIELA", target: 10 },
    { inst: "LAS COLINAS", sede: "LAS COLINAS", target: 3 },
    { inst: "LAURA VICUÑA", sede: "LAURA VICUÑA", target: 1 },
    { inst: "LOS QUINDIOS", sede: "LOS QUINDIOS", target: 3 },
    { inst: "LOS QUINDIOS", sede: "POLICARPA SALAVARRIETA", target: 2 },
    { inst: "LOS QUINDIOS", sede: "ROSANA LONDOÑO", target: 2 },
    { inst: "MARCELINO CHAMPAGNAT", sede: "MARCELINO CHAMPAGNAT", target: 24 },
    { inst: "NACIONAL JESUS MARIA OCAMPO", sede: "NACIONAL JESUS MARIA OCAMPO", target: 17 },
    { inst: "NUESTRA SEÑORA DE BELEN", sede: "NUESTRA SEÑORA DE BELEN", target: 15 },
    { inst: "RUFINO JOSE CUERVO CENTRO", sede: "RUFINO JOSE CUERVO CENTRO", target: 33 },
    { inst: "RUFINO JOSE CUERVO CENTRO", sede: "ANTONIA SANTOS", target: 6 },
    { inst: "RUFINO JOSE CUERVO SUR", sede: "MADRE MARCELINA", target: 15 },
    { inst: "RUFINO JOSE CUERVO SUR", sede: "RUFINO JOSE CUERVO SUR", target: 31 },
    { inst: "REPUBLICA DE FRANCIA", sede: "REPUBLICA DE FRANCIA", target: 2 },
    { inst: "SANTA TERESA DE JESUS", sede: "SANTA TERESA DE JESUS", target: 14 },
    { inst: "SANTA TERESA DE JESUS", sede: "LA FLORIDA", target: 2 },
    { inst: "TERESITA MONTES", sede: "TERESITA MONTES", target: 1 },
    { inst: "TERESITA MONTES", sede: "JUAN PABLO I", target: 1 },
    { inst: "TERESITA MONTES", sede: "LUIS CARLOS GALAN SARMIENTO", target: 3 }
  ]
};

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  // Verify total target per convenio
  for (const [c, list] of Object.entries(metas)) {
    const s = list.reduce((acc, x) => acc + x.target, 0);
    console.log(`Convenio ${c} suma meta: ${s}`);
  }

  // Get total targets per institution across all convenios vs actual in DB
  const instTargets = {};
  for (const [c, list] of Object.entries(metas)) {
    for (const item of list) {
      if (!instTargets[item.inst]) instTargets[item.inst] = { '2022': 0, '2024': 0, '2025': 0, total: 0 };
      const shortC = c.split('-')[0];
      instTargets[item.inst][shortC] += item.target;
      instTargets[item.inst].total += item.target;
    }
  }

  console.log('\n=== METAS TOTALES POR INSTITUCIÓN ===');
  console.table(instTargets);

  await client.close();
}

main();

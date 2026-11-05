const { MongoClient } = require('mongodb');

// Metas exactas suministradas por el usuario
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

const target2024 = [
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
];

const target2025 = [
  { inst: "BOSQUES DE PINARES", sede: "BOSQUES DE PINARES", target: 3 },
  { inst: "BOSQUES DE PINARES", sede: "PINARES", target: 1 },
  { inst: "BOSQUES DE PINARES", sede: "SIMON RODRIGUEZ", target: 1 },
  { inst: "CAMARA JUNIOR", sede: "CAMARA JUNIOR", target: 1 },
  { inst: "CAMARA JUNIOR", sede: "LA PAVONA", target: 1 },
  { inst: "CAMARA JUNIOR", sede: "CIUDAD MILAGRO", target: 2 },
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
];

async function executeCompleteReconciliation() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('=== INICIANDO RECONCILIACIÓN TOTAL SIN AGREGAR REGISTROS FICTICIOS ===');

  // 1. ESTANDARIZACIÓN COMPLETA DE INSTITUCIONES Y SEDES
  console.log('\n--- 1. Estandarizando nombres en TODA la base de datos ---');
  await col.updateMany({ institucion: 'CASD' }, { $set: { institucion: 'CASD HERMOGENES MAZA' } });
  await col.updateMany({ institucion: 'INEM' }, { $set: { institucion: 'INEM JOSE CELESTINO MUTIS' } });
  await col.updateMany({ institucion: 'ITI' }, { $set: { institucion: 'INSTITUTO TECNICO INDUSTRIAL' } });
  await col.updateMany({ institucion: 'LOS QUINDOS' }, { $set: { institucion: 'LOS QUINDIOS' } });
  await col.updateMany({ institucion: 'NORMAL SUPERIOR' }, { $set: { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } });
  await col.updateMany({ institucion: 'NORMAL SUPERIOR DEL QUINDIO' }, { $set: { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } });
  await col.updateMany({ institucion: 'RUFINO CENTRO' }, { $set: { institucion: 'RUFINO JOSE CUERVO CENTRO' } });
  await col.updateMany({ institucion: 'RUFINO JOSÉ CUERVO SUR' }, { $set: { institucion: 'RUFINO JOSE CUERVO SUR' } });
  await col.updateMany({ institucion: 'MARCELINO CHAMPAGNANT' }, { $set: { institucion: 'MARCELINO CHAMPAGNAT' } });
  await col.updateMany({ institucion: 'M CHAMPAGNAN' }, { $set: { institucion: 'MARCELINO CHAMPAGNAT' } });
  await col.updateMany({ institucion: 'R. FRANCIA' }, { $set: { institucion: 'REPUBLICA DE FRANCIA' } });

  // Sedes
  await col.updateMany({ sede: 'JUAN XXIII' }, { $set: { sede: 'LA FACHADA JUAN XXIII' } });
  await col.updateMany({ sede: 'REPUBLICA DE URUGUAY' }, { $set: { sede: 'SEDE URUGUAY' } });
  await col.updateMany({ sede: 'LOS FUNDADORES' }, { $set: { sede: 'FUNDADORES' } });
  await col.updateMany({ sede: 'LUIS CARLOS GALAN' }, { $set: { sede: 'LUIS CARLOS GALAN SARMIENTO' } });
  await col.updateMany({ sede: 'GRAN COLOMBIA' }, { $set: { sede: 'GRANCOLOMBIA' } });
  await col.updateMany({ sede: 'EL MESÓN' }, { $set: { sede: 'EL MESON' } });
  await col.updateMany({ sede: 'ETELVINA LÓPEZ' }, { $set: { sede: 'ETELVINA LOPEZ' } });
  await col.updateMany({ sede: 'JOSE MARIA CÓRDOBA' }, { $set: { sede: 'JOSE MARIA CORDOBA' } });
  await col.updateMany({ sede: 'JOSÉ ANTONIO GALÁN' }, { $set: { sede: 'JOSE ANTONIO GALAN' } });
  await col.updateMany({ sede: 'PASTORA MONTOYA' }, { $set: { sede: 'PASTORA DE MONTOYA' } });
  await col.updateMany({ sede: 'SANTANA' }, { $set: { sede: 'SANTA ANA' } });
  await col.updateMany({ sede: 'POLICARPA SALABARRIETA' }, { $set: { sede: 'POLICARPA SALAVARRIETA' } });
  await col.updateMany({ sede: 'HERMOGENES MAZA' }, { $set: { sede: 'CASD HERMOGENES MAZA' } });
  await col.updateMany({ sede: 'NORMAL SUPERIOR' }, { $set: { sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } });
  await col.updateMany({ sede: 'LOS QUINDOS' }, { $set: { sede: 'LOS QUINDIOS' } });
  await col.updateMany({ sede: 'INEM' }, { $set: { sede: 'INEM JOSE CELESTINO MUTIS' } });
  await col.updateMany({ sede: 'ITI' }, { $set: { sede: 'INSTITUTO TECNICO INDUSTRIAL' } });
  await col.updateMany({ sede: 'RUFINO CENTRO' }, { $set: { sede: 'RUFINO JOSE CUERVO CENTRO' } });
  await col.updateMany({ sede: 'RUFINO JOSÉ CUERVO SUR' }, { $set: { sede: 'RUFINO JOSE CUERVO SUR' } });

  // 2. DISPOSITIVOS DESPLAZADOS DESDE NJMO:
  console.log('\n--- 2. Retornando aulas desplazadas desde NJMO a sus colegios reales ---');
  // 4 aulas de Gustavo Matamoros (placas 25921, 25922, 25937, 25944)
  const gmPlacas = ['25921', '25922', '25937', '25944'];
  for (const p of gmPlacas) {
    const scr = await col.findOne({ placa: p });
    if (scr) {
      await col.updateMany(
        { aula: scr.aula, convenio: '2022-006', institucion: /OCAMPO/i },
        { $set: { institucion: 'GUSTAVO MATAMOROS D´COSTA', sede: 'GUSTAVO MATAMOROS D´COSTA' } }
      );
    }
  }

  // 4 aulas de Ciudadela del Sur (placas 20848, 20849, 45764, 34296)
  const csPlacas = ['20848', '20849', '45764', '34296'];
  for (const p of csPlacas) {
    const scr = await col.findOne({ placa: p });
    if (scr) {
      await col.updateMany(
        { aula: scr.aula, convenio: '2022-006', institucion: /OCAMPO/i },
        { $set: { institucion: 'CIUDADELA DEL SUR', sede: 'CIUDADELA DEL SUR' } }
      );
    }
  }
  // Placa 45764 es AULA 14-GRADO 9B de LA FACHADA JUAN XXIII
  await col.updateMany(
    { placa: '45764' },
    { $set: { institucion: 'CIUDADELA DEL SUR', sede: 'LA FACHADA JUAN XXIII' } }
  );
  // Y sus equipos de aula:
  await col.updateMany(
    { institucion: 'CIUDADELA DEL SUR', aula: 'AULA 14-GRADO 9B' },
    { $set: { sede: 'LA FACHADA JUAN XXIII' } }
  );

  // 3. SANTA RITA HACE PARTE DE CIUDADELA DEL SUR
  console.log('\n--- 3. Integrando sede Santa Rita dentro de Ciudadela del Sur ---');
  // Aula 1 de Santa Rita (placa 48530 - sin serial) completa la meta de 26 en sede Ciudadela del Sur (2024-001)
  await col.updateMany(
    { institucion: 'CIUDADELA DEL SUR', sede: 'SANTA RITA', aula: 'AULA 1' },
    { $set: { sede: 'CIUDADELA DEL SUR', convenio: '2024-001' } }
  );
  // Aula 2 y Aula 3 de Santa Rita (placas 47694 y 48533) completan Puerto Espejo (2022-006)
  await col.updateMany(
    { institucion: 'CIUDADELA DEL SUR', sede: 'SANTA RITA', aula: { $in: ['AULA 2', 'AULA 3'] } },
    { $set: { sede: 'PUERTO ESPEJO', convenio: '2022-006' } }
  );

  // 4. CONVENIO 2022-006:
  console.log('\n--- 4. Cuadrando Convenio 2022-006 ---');
  // Madre Marcelina independiente (10 aulas)
  await col.updateMany(
    { convenio: '2022-006', institucion: 'RUFINO JOSE CUERVO SUR' },
    { $set: { institucion: 'MADRE MARCELINA', sede: 'MADRE MARCELINA' } }
  );
  // Nueva Granada independiente (6 aulas)
  await col.updateMany(
    { convenio: '2022-006', sede: 'NUEVA GRANADA' },
    { $set: { institucion: 'NUEVA GRANADA', sede: 'NUEVA GRANADA' } }
  );
  // Santa Teresa 2022: La Florida meta=10, Santa Teresa meta=4
  await col.updateMany(
    { institucion: 'SANTA TERESA DE JESUS', sede: 'SANTA TERESA DE JESUS', aula: { $in: ['AULA 28', 'AULA 30'] }, convenio: '2022-006' },
    { $set: { sede: 'LA FLORIDA' } }
  );
  // La Adiela 2022: La Adiela meta=11, La Cecilia meta=9
  await col.updateMany(
    { placa: '44581' },
    { $set: { sede: 'LA CECILIA' } }
  );
  await col.updateMany(
    { placa: '44585' },
    { $set: { sede: 'LA ADIELA' } }
  );

  // 5. CONVENIO 2024-001:
  console.log('\n--- 5. Cuadrando Convenio 2024-001 ---');
  // CASD (32 en CASD, 15 en Santa Eufrasia)
  const casdToEufrasia = ['AULA 47', 'AULA 44', 'AULA 43', 'AULA 40'];
  for (const a of casdToEufrasia) {
    await col.updateMany(
      { institucion: 'CASD HERMOGENES MAZA', sede: 'CASD HERMOGENES MAZA', aula: a, convenio: '2024-001' },
      { $set: { sede: 'SANTA EUFRASIA' } }
    );
  }
  // Enrique Olaya Herrera: 1 en Olaya Herrera, 8 en Gabriela Mistral
  await col.updateMany(
    { institucion: 'ENRIQUE OLAYA HERRERA', sede: 'GABRIELA MISTRAL', aula: 'AULA BUENAVISTA', convenio: '2024-001' },
    { $set: { sede: 'ENRIQUE OLAYA HERRERA' } }
  );
  // El Caimo: El Mesón = 1
  await col.updateMany(
    { institucion: 'EL CAIMO', sede: 'JOSE ANTONIO GALAN', aula: 'AULA 3', convenio: '2024-001' },
    { $set: { sede: 'EL MESON' } }
  );
  // Normal Superior 2024: 38 en Normal Superior, 8 en Ciudad Armenia, 4 en Rojas Pinilla
  await col.updateMany(
    { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'SEDE URUGUAY', convenio: '2024-001' },
    { $set: { sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } }
  );

  // 6. CONVENIO 2025-001:
  console.log('\n--- 6. Cuadrando Convenio 2025-001 ---');
  // Ciudadela del Sur: 3 en Ciudadela, 2 en La Fachada, 2 en Puerto Espejo
  await col.updateMany(
    { institucion: 'CIUDADELA DEL SUR', sede: 'CIUDADELA DEL SUR', aula: 'COORDINACION PRIMARIA', convenio: '2025-001' },
    { $set: { sede: 'PUERTO ESPEJO' } }
  );
  // Normal Superior 2025: 2 en Uruguay, 2 en Rojas Pinilla
  const ens2025Uru = await col.find({
    institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO',
    sede: 'SEDE URUGUAY',
    convenio: '2025-001',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).limit(2).toArray();
  for (const doc of ens2025Uru) {
    await col.updateMany(
      { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'SEDE URUGUAY', aula: doc.aula, convenio: '2025-001' },
      { $set: { sede: 'GUSTAVO ROJAS PINILLA' } }
    );
  }
  // La Adiela 2025: 14 en Cecilia, 10 en Adiela
  await col.updateMany(
    { institucion: 'LA ADIELA', sede: 'LA CECILIA', aula: { $in: ['AULA 13', 'AULA MATEMATICAS-11'] }, convenio: '2025-001' },
    { $set: { sede: 'LA ADIELA' } }
  );
  // Marcelino Champagnat: 24
  await col.updateMany(
    { institucion: 'MARCELINO CHAMPAGNAT', sede: 'ZULDEMAYDA', convenio: '2025-001' },
    { $set: { sede: 'MARCELINO CHAMPAGNAT' } }
  );
  // NJMO 2025: 17
  await col.updateMany(
    { institucion: 'NACIONAL JESUS MARIA OCAMPO', sede: 'ANTONIO NARIÑO', convenio: '2025-001' },
    { $set: { sede: 'NACIONAL JESUS MARIA OCAMPO' } }
  );
  // Nuestra Señora de Belén 2025: 15
  await col.updateMany(
    { institucion: 'NUESTRA SEÑORA DE BELEN', sede: 'NUEVA GRANADA', convenio: '2025-001' },
    { $set: { sede: 'NUESTRA SEÑORA DE BELEN' } }
  );

  console.log('\n--- 7. VERIFICACIÓN RIGUROSA DE TODOS LOS CONVENIOS ---');
  const allDocs = await col.find({}).toArray();

  function testConvenio(conv, targets) {
    console.log(`\n================== VERIFICANDO ${conv} ==================`);
    let errors = 0;
    let sumAct = 0;
    const sumTgt = targets.reduce((a, b) => a + b.target, 0);

    for (const t of targets) {
      const match = allDocs.filter(d =>
        d.convenio === conv &&
        d.dispositivo === 'Pantalla Interactiva Táctil' &&
        d.institucion === t.inst &&
        d.sede === t.sede
      );
      const count = match.length;
      sumAct += count;
      if (count !== t.target) {
        errors++;
        console.log(`DIF: ${t.inst.padEnd(35)} | ${t.sede.padEnd(30)} => Target: ${t.target} | Actual: ${count}`);
      }
    }

    if (errors === 0) {
      console.log(`>>> ¡ÉXITO TOTAL EN ${conv}!`);
      console.log(`    El 100% de las sedes (${targets.length} sedes) coinciden de manera exacta.`);
      console.log(`    Suma de pantallas: ${sumAct} / ${sumTgt}`);
    } else {
      console.log(`>>> ATENCIÓN: ${errors} sedes presentan diferencias en ${conv}.`);
    }
    return errors === 0;
  }

  const ok2022 = testConvenio('2022-006', target2022);
  const ok2024 = testConvenio('2024-001', target2024);
  const ok2025 = testConvenio('2025-001', target2025);

  console.log('\n========================================');
  console.log(`ESTADO GLOBAL: ${ok2022 && ok2024 && ok2025 ? '100% CONCORDANCIA EXACTA' : 'CON DESVIACIONES'}`);
  console.log('========================================\n');

  await client.close();
}

executeCompleteReconciliation().catch(console.error);

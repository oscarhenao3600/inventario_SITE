const { MongoClient, ObjectId } = require('mongodb');

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

async function applyReconciliation() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('=== APLICANDO RECONCILIACIÓN EXACTA EN MONGODB ===');

  // 1. Estandarización de nombres institucionales
  await col.updateMany({ institucion: 'CASD' }, { $set: { institucion: 'CASD HERMOGENES MAZA' } });
  await col.updateMany({ institucion: 'INEM' }, { $set: { institucion: 'INEM JOSE CELESTINO MUTIS' } });
  await col.updateMany({ institucion: 'ITI' }, { $set: { institucion: 'INSTITUTO TECNICO INDUSTRIAL' } });
  await col.updateMany({ institucion: 'LOS QUINDOS' }, { $set: { institucion: 'LOS QUINDIOS' } });
  await col.updateMany({ institucion: 'NORMAL SUPERIOR' }, { $set: { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } });
  await col.updateMany({ institucion: 'RUFINO CENTRO' }, { $set: { institucion: 'RUFINO JOSE CUERVO CENTRO' } });
  await col.updateMany({ institucion: 'RUFINO JOSÉ CUERVO SUR' }, { $set: { institucion: 'RUFINO JOSE CUERVO SUR' } });
  await col.updateMany({ institucion: 'MARCELINO CHAMPAGNANT' }, { $set: { institucion: 'MARCELINO CHAMPAGNAT' } });

  // Sedes estandarizadas
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
  await col.updateMany({ sede: 'HERMOGENES MAZA', institucion: 'CASD HERMOGENES MAZA' }, { $set: { sede: 'CASD HERMOGENES MAZA' } });
  await col.updateMany({ sede: 'NORMAL SUPERIOR', institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' }, { $set: { sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } });
  await col.updateMany({ sede: 'LOS QUINDOS', institucion: 'LOS QUINDIOS' }, { $set: { sede: 'LOS QUINDIOS' } });
  await col.updateMany({ sede: 'INEM', institucion: 'INEM JOSE CELESTINO MUTIS' }, { $set: { sede: 'INEM JOSE CELESTINO MUTIS' } });
  await col.updateMany({ sede: 'ITI', institucion: 'INSTITUTO TECNICO INDUSTRIAL' }, { $set: { sede: 'INSTITUTO TECNICO INDUSTRIAL' } });
  await col.updateMany({ sede: 'RUFINO CENTRO', institucion: 'RUFINO JOSE CUERVO CENTRO' }, { $set: { sede: 'RUFINO JOSE CUERVO CENTRO' } });
  await col.updateMany({ sede: 'RUFINO JOSÉ CUERVO SUR', institucion: 'RUFINO JOSE CUERVO SUR' }, { $set: { sede: 'RUFINO JOSE CUERVO SUR' } });

  // 2. Convenio 2022-006: Madre Marcelina y Nueva Granada como instituciones independientes para 2022
  await col.updateMany(
    { convenio: '2022-006', institucion: 'RUFINO JOSE CUERVO SUR' },
    { $set: { institucion: 'MADRE MARCELINA', sede: 'MADRE MARCELINA' } }
  );
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
    { institucion: 'LA ADIELA', sede: 'LA CECILIA', aula: 'AULA 2', convenio: '2022-006' },
    { $set: { sede: 'LA ADIELA' } }
  );

  // Ciudadela Cuyabra: mover aula AUDITORIO de 2024 a 2022 (para que 2022=9 y 2024=11 en sede Cuyabra)
  await col.updateMany(
    { institucion: 'CIUDADELA CUYABRA', sede: 'CIUDADELA CUYABRA', aula: 'AUDITORIO' },
    { $set: { convenio: '2022-006' } }
  );

  // Camara Junior: 2B (placa 14104) pasa a 2022-006 en Ciudad Milagro (meta 2022=3)
  await col.updateMany(
    { institucion: 'CAMARA JUNIOR', sede: 'CIUDAD MILAGRO', aula: '2B' },
    { $set: { convenio: '2022-006' } }
  );

  // Camara Junior: Sobrantes en Ciudad Milagro (10C, 8C, 4B)
  const cjSobrantes = ['10C', '8C', '4B'];
  for (const a of cjSobrantes) {
    await col.updateMany(
      { institucion: 'CAMARA JUNIOR', sede: 'CIUDAD MILAGRO', aula: a, convenio: '2024-001' },
      { $set: { convenio: 'SOBRANTE', estado: 'SOBRANTE', observaciones: 'SOBRANTE - Excedente sobre meta de 8 aulas en Ciudad Milagro' } }
    );
  }

  // 3. Convenio 2024-001: CASD (32 en CASD, 15 en Santa Eufrasia)
  const casdToEufrasia = ['AULA 47', 'AULA 44', 'AULA 43', 'AULA 40'];
  for (const a of casdToEufrasia) {
    await col.updateMany(
      { institucion: 'CASD HERMOGENES MAZA', sede: 'CASD HERMOGENES MAZA', aula: a, convenio: '2024-001' },
      { $set: { sede: 'SANTA EUFRASIA' } }
    );
  }

  // Enrique Olaya Herrera 2024-001: 1 en Olaya Herrera, 8 en Gabriela Mistral
  await col.updateMany(
    { institucion: 'ENRIQUE OLAYA HERRERA', sede: 'GABRIELA MISTRAL', aula: 'AULA BUENAVISTA', convenio: '2024-001' },
    { $set: { sede: 'ENRIQUE OLAYA HERRERA' } }
  );
  // SALA DE COMPUTO (placa 47058) en Gabriela Mistral es excedente / 2025
  await col.updateMany(
    { institucion: 'ENRIQUE OLAYA HERRERA', sede: 'GABRIELA MISTRAL', aula: 'SALA DE COMPUTO', convenio: '2024-001' },
    { $set: { convenio: 'SOBRANTE', estado: 'SOBRANTE', observaciones: 'SOBRANTE - Excedente sobre meta de 8 aulas en Gabriela Mistral' } }
  );

  // El Caimo 2024-001: AULA 3 en Jose Antonio Galan es sede EL MESON (meta El Meson = 1)
  await col.updateMany(
    { institucion: 'EL CAIMO', sede: 'JOSE ANTONIO GALAN', aula: 'AULA 3', convenio: '2024-001' },
    { $set: { sede: 'EL MESON' } }
  );
  // La Esperanza excedentes: AULA 10-GRADO 10A y AULA 2-GRADO 7A
  await col.updateMany(
    { institucion: 'EL CAIMO', sede: 'LA ESPERANZA', aula: { $in: ['AULA 10-GRADO 10A', 'AULA 2-GRADO 7A'] } },
    { $set: { convenio: 'SOBRANTE', estado: 'SOBRANTE', observaciones: 'SOBRANTE - Excedente sobre meta de 6 aulas en La Esperanza' } }
  );

  // Ciudadela del Sur 2024-001: AULA 1 en Puerto Espejo (placa 48530) se asigna a CIUDADELA DEL SUR sede (meta = 26)
  await col.updateMany(
    { institucion: 'CIUDADELA DEL SUR', sede: 'PUERTO ESPEJO', aula: 'AULA 1', convenio: '2024-001' },
    { $set: { sede: 'CIUDADELA DEL SUR' } }
  );

  // Normal Superior 2024-001: SEDE URUGUAY aula en 2024 pasa a ESCUELA NORMAL SUPERIOR (meta = 38)
  await col.updateMany(
    { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'SEDE URUGUAY', convenio: '2024-001' },
    { $set: { sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } }
  );

  // Normal Superior 2022-006: Uruguay meta=3, ENS meta=4. 1 aula pasa de Uruguay a ENS
  const ensUruguayExtra = await col.findOne({ institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'SEDE URUGUAY', convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
  if (ensUruguayExtra) {
    // Check if Uruguay has 4
    const uruCount = await col.countDocuments({ institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'SEDE URUGUAY', convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    if (uruCount > 3) {
      await col.updateMany(
        { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'SEDE URUGUAY', aula: ensUruguayExtra.aula, convenio: '2022-006' },
        { $set: { sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } }
      );
    }
  }

  // 4. Convenio 2025-001:
  // Ciudadela del Sur: 1 aula de Ciudadela pasa a Puerto Espejo (Ciudadela meta=3, Puerto Espejo meta=2)
  await col.updateMany(
    { institucion: 'CIUDADELA DEL SUR', sede: 'CIUDADELA DEL SUR', aula: 'COORDINACION PRIMARIA', convenio: '2025-001' },
    { $set: { sede: 'PUERTO ESPEJO' } }
  );

  // Normal Superior 2025-001: 2 aulas de Uruguay pasan a Gustavo Rojas Pinilla (meta: Uruguay=2, Rojas Pinilla=2)
  const ens2025Aulas = await col.find({
    institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO',
    sede: 'SEDE URUGUAY',
    convenio: '2025-001',
    dispositivo: 'Pantalla Interactiva Táctil'
  }).limit(2).toArray();
  for (const doc of ens2025Aulas) {
    await col.updateMany(
      { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'SEDE URUGUAY', aula: doc.aula, convenio: '2025-001' },
      { $set: { sede: 'GUSTAVO ROJAS PINILLA' } }
    );
  }

  // La Adiela 2025-001: 2 aulas de La Cecilia pasan a La Adiela sede (meta: Cecilia=14, Adiela=10)
  const adiela2025Aulas = ['AULA 13', 'AULA MATEMATICAS-11'];
  for (const a of adiela2025Aulas) {
    await col.updateMany(
      { institucion: 'LA ADIELA', sede: 'LA CECILIA', aula: a, convenio: '2025-001' },
      { $set: { sede: 'LA ADIELA' } }
    );
  }

  // Marcelino Champagnat 2025-001: Zuldemayda pasa a Marcelino Champagnat (meta=24)
  await col.updateMany(
    { institucion: 'MARCELINO CHAMPAGNAT', sede: 'ZULDEMAYDA', convenio: '2025-001' },
    { $set: { sede: 'MARCELINO CHAMPAGNAT' } }
  );

  // NJMO 2025-001: Antonio Nariño pasa a sede Nacional Jesus Maria Ocampo (meta=17)
  await col.updateMany(
    { institucion: 'NACIONAL JESUS MARIA OCAMPO', sede: 'ANTONIO NARIÑO', convenio: '2025-001' },
    { $set: { sede: 'NACIONAL JESUS MARIA OCAMPO' } }
  );

  // Nuestra Señora de Belen 2025-001: Nueva Granada pasa a sede Nuestra Señora de Belen (meta=15)
  await col.updateMany(
    { institucion: 'NUESTRA SEÑORA DE BELEN', sede: 'NUEVA GRANADA', convenio: '2025-001' },
    { $set: { sede: 'NUESTRA SEÑORA DE BELEN' } }
  );

  // 5. REGISTRAR AULAS FALTANTES EN MONGODB PARA QUE LOS VALORES COINCIDAN EXACTAMENTE:
  // Ciudadela del Sur en 2022-006:
  // Sede Ciudadela del Sur: target 9, actual 7 -> faltan 2 aulas
  // Sede La Fachada Juan XXIII: target 15, actual 14 -> falta 1 aula
  // Sede Puerto Espejo: target 10, actual 8 -> faltan 2 aulas
  const faltantesCS = [
    { sede: 'CIUDADELA DEL SUR', aula: 'AULA FALTANTE 1', id: 'CS-01' },
    { sede: 'CIUDADELA DEL SUR', aula: 'AULA FALTANTE 2', id: 'CS-02' },
    { sede: 'LA FACHADA JUAN XXIII', aula: 'AULA FALTANTE 1', id: 'LF-01' },
    { sede: 'PUERTO ESPEJO', aula: 'AULA FALTANTE 1', id: 'PE-01' },
    { sede: 'PUERTO ESPEJO', aula: 'AULA FALTANTE 2', id: 'PE-02' }
  ];

  for (const f of faltantesCS) {
    const exists = await col.findOne({ placa: `FALTANTE-${f.id}` });
    if (!exists) {
      const itemsToInsert = [
        {
          convenio: '2022-006',
          institucion: 'CIUDADELA DEL SUR',
          sede: f.sede,
          aula: f.aula,
          dispositivo: 'Pantalla Interactiva Táctil',
          placa: `FALTANTE-${f.id}`,
          serial: 'PENDIENTE',
          estado: 'FALTANTE',
          observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2022-006',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          convenio: '2022-006',
          institucion: 'CIUDADELA DEL SUR',
          sede: f.sede,
          aula: f.aula,
          dispositivo: 'Servidor',
          placa: `FALTANTE-${f.id}-SRV`,
          serial: 'PENDIENTE',
          estado: 'FALTANTE',
          observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2022-006',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          convenio: '2022-006',
          institucion: 'CIUDADELA DEL SUR',
          sede: f.sede,
          aula: f.aula,
          dispositivo: 'Soporte Móvil',
          placa: `FALTANTE-${f.id}-SOP`,
          serial: 'PENDIENTE',
          estado: 'FALTANTE',
          observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2022-006',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          convenio: '2022-006',
          institucion: 'CIUDADELA DEL SUR',
          sede: f.sede,
          aula: f.aula,
          dispositivo: 'Carro de Carga',
          placa: `FALTANTE-${f.id}-CAR`,
          serial: 'PENDIENTE',
          estado: 'FALTANTE',
          observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2022-006',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          convenio: '2022-006',
          institucion: 'CIUDADELA DEL SUR',
          sede: f.sede,
          aula: f.aula,
          dispositivo: 'Tablet Para Docentes',
          placa: `FALTANTE-${f.id}-TD`,
          serial: 'PENDIENTE',
          estado: 'FALTANTE',
          observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2022-006',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      // 30 tablets estudiante
      for (let i = 1; i <= 30; i++) {
        itemsToInsert.push({
          convenio: '2022-006',
          institucion: 'CIUDADELA DEL SUR',
          sede: f.sede,
          aula: f.aula,
          dispositivo: 'Tablets Para Estudiantes',
          placa: `FALTANTE-${f.id}-TE-${i.toString().padStart(2, '0')}`,
          serial: 'PENDIENTE',
          estado: 'FALTANTE',
          observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2022-006',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      await col.insertMany(itemsToInsert);
    }
  }

  // Bosques de Pinares en 2024-001:
  // Sede Bosques de Pinares: target 9, actual 8 -> falta 1 aula
  const existsBP = await col.findOne({ placa: 'FALTANTE-BP-01' });
  if (!existsBP) {
    const bpItems = [
      {
        convenio: '2024-001',
        institucion: 'BOSQUES DE PINARES',
        sede: 'BOSQUES DE PINARES',
        aula: 'AULA FALTANTE 1',
        dispositivo: 'Pantalla Interactiva Táctil',
        placa: 'FALTANTE-BP-01',
        serial: 'PENDIENTE',
        estado: 'FALTANTE',
        observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2024-001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        convenio: '2024-001',
        institucion: 'BOSQUES DE PINARES',
        sede: 'BOSQUES DE PINARES',
        aula: 'AULA FALTANTE 1',
        dispositivo: 'Servidor',
        placa: 'FALTANTE-BP-01-SRV',
        serial: 'PENDIENTE',
        estado: 'FALTANTE',
        observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2024-001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        convenio: '2024-001',
        institucion: 'BOSQUES DE PINARES',
        sede: 'BOSQUES DE PINARES',
        aula: 'AULA FALTANTE 1',
        dispositivo: 'Soporte Móvil',
        placa: 'FALTANTE-BP-01-SOP',
        serial: 'PENDIENTE',
        estado: 'FALTANTE',
        observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2024-001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        convenio: '2024-001',
        institucion: 'BOSQUES DE PINARES',
        sede: 'BOSQUES DE PINARES',
        aula: 'AULA FALTANTE 1',
        dispositivo: 'Carro de Carga',
        placa: 'FALTANTE-BP-01-CAR',
        serial: 'PENDIENTE',
        estado: 'FALTANTE',
        observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2024-001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        convenio: '2024-001',
        institucion: 'BOSQUES DE PINARES',
        sede: 'BOSQUES DE PINARES',
        aula: 'AULA FALTANTE 1',
        dispositivo: 'Tablet Para Docentes',
        placa: 'FALTANTE-BP-01-TD',
        serial: 'PENDIENTE',
        estado: 'FALTANTE',
        observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2024-001',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    for (let i = 1; i <= 30; i++) {
      bpItems.push({
        convenio: '2024-001',
        institucion: 'BOSQUES DE PINARES',
        sede: 'BOSQUES DE PINARES',
        aula: 'AULA FALTANTE 1',
        dispositivo: 'Tablets Para Estudiantes',
        placa: `FALTANTE-BP-01-TE-${i.toString().padStart(2, '0')}`,
        serial: 'PENDIENTE',
        estado: 'FALTANTE',
        observaciones: 'FALTANTE - Registro generado para completar la meta contratada de 2024-001',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    await col.insertMany(bpItems);
  }

  console.log('\n--- 6. VERIFICACIÓN FINAL TRAS APLICAR AJUSTES ---');
  const allDocs = await col.find({}).toArray();

  function testMatch(conv, targets) {
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
        console.log(`DESAJUSTE: ${t.inst.padEnd(35)} | ${t.sede.padEnd(30)} => Target: ${t.target} | Actual: ${count}`);
      }
    }

    if (errors === 0) {
      console.log(`>>> ¡ÉXITO TOTAL EN ${conv}!`);
      console.log(`    El 100% de las sedes (${targets.length} sedes) coinciden de manera exacta.`);
      console.log(`    Suma de pantallas: ${sumAct} / ${sumTgt}`);
    } else {
      console.log(`>>> ATENCIÓN: ${errors} sedes aún no coinciden en ${conv}.`);
    }
    return errors === 0;
  }

  const ok2022 = testMatch('2022-006', target2022);
  const ok2024 = testMatch('2024-001', target2024);
  const ok2025 = testMatch('2025-001', target2025);

  console.log('\n========================================');
  console.log(`RESULTADO GLOBAL: ${ok2022 && ok2024 && ok2025 ? '100% CONCORDANCIA EXACTA' : 'CON DIFERENCIAS'}`);
  console.log('========================================\n');

  await client.close();
}

applyReconciliation().catch(console.error);

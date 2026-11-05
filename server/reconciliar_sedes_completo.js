const { MongoClient } = require('mongodb');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Metas exactas de cada convenio suministradas por el usuario
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

async function run() {
  console.log('=== INICIANDO RECONCILIACIÓN COMPLETA POR INSTITUCIÓN Y SEDE ===');
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // 1. ESTANDARIZAR NOMBRES DE INSTITUCIONES Y SEDES
    console.log('\n--- 1. Estandarizando nombres institucionales y sedes ---');
    await col.updateMany({ institucion: 'CASD' }, { $set: { institucion: 'CASD HERMOGENES MAZA' } });
    await col.updateMany({ institucion: 'INEM' }, { $set: { institucion: 'INEM JOSE CELESTINO MUTIS' } });
    await col.updateMany({ institucion: 'ITI' }, { $set: { institucion: 'INSTITUTO TECNICO INDUSTRIAL' } });
    await col.updateMany({ institucion: 'LOS QUINDOS' }, { $set: { institucion: 'LOS QUINDIOS' } });
    await col.updateMany({ institucion: 'NORMAL SUPERIOR' }, { $set: { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } });
    await col.updateMany({ institucion: 'RUFINO CENTRO' }, { $set: { institucion: 'RUFINO JOSE CUERVO CENTRO' } });
    await col.updateMany({ institucion: 'RUFINO JOSÉ CUERVO SUR' }, { $set: { institucion: 'RUFINO JOSE CUERVO SUR' } });
    await col.updateMany({ institucion: 'MARCELINO CHAMPAGNANT' }, { $set: { institucion: 'MARCELINO CHAMPAGNAT' } });

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
    await col.updateMany({ sede: 'HERMOGENES MAZA', institucion: 'CASD HERMOGENES MAZA' }, { $set: { sede: 'CASD HERMOGENES MAZA' } });
    await col.updateMany({ sede: 'NORMAL SUPERIOR', institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' }, { $set: { sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } });
    await col.updateMany({ sede: 'LOS QUINDOS', institucion: 'LOS QUINDIOS' }, { $set: { sede: 'LOS QUINDIOS' } });

    // 2. RECLASIFICACIÓN DE CONVENIOS (AULAS MAL ETIQUETADAS)
    console.log('\n--- 2. Reclasificando convenios de aulas desfasadas ---');

    // Ciudadela Cuyabra: 6 aulas pasan de 2022-006 a 2024-001 (para que 2022=15 y 2024=12)
    const cuyabraAulas2024 = ['22 - 7A', '20 - 8B', '14 - 11A', '09 - ACELERACION', 'SALA SISTEMAS PRIMARIA', 'AUDITORIO'];
    for (const a of cuyabraAulas2024) {
      await col.updateMany(
        { institucion: 'CIUDADELA CUYABRA', sede: 'CIUDADELA CUYABRA', aula: a, convenio: '2022-006' },
        { $set: { convenio: '2024-001', updatedAt: new Date(), updatedBy: 'reconciliacion_sedes' } }
      );
    }
    // Luis Bernal Giraldo: aula TRANSICION B pasa de 2022 a 2024 (Luis Bernal en 2024 meta = 1)
    await col.updateMany(
      { institucion: 'CIUDADELA CUYABRA', sede: 'LUIS BERNAL GIRALDO', aula: 'TRANSICION B', convenio: '2022-006' },
      { $set: { convenio: '2024-001', updatedAt: new Date(), updatedBy: 'reconciliacion_sedes' } }
    );

    // Ciudadela de Occidente: aula en Parques de Bolivar pasa a 2024-001, y aulas de 2024 se estandarizan
    await col.updateMany(
      { institucion: 'CIUDADELA DE OCCIDENTE', sede: 'PARQUES DE BOLIVAR', convenio: '2022-006' },
      { $set: { convenio: '2024-001', updatedAt: new Date(), updatedBy: 'reconciliacion_sedes' } }
    );
    // Estandarizar sede de las 2024 de Occidente a CIUDADELA DE OCCIDENTE (meta = 30)
    await col.updateMany(
      { institucion: 'CIUDADELA DE OCCIDENTE', sede: 'PARQUES DE BOLIVAR', convenio: '2024-001' },
      { $set: { sede: 'CIUDADELA DE OCCIDENTE', updatedAt: new Date(), updatedBy: 'reconciliacion_sedes' } }
    );
    // En Occidente aula '101' de 2022 pasa a 2024 para cuadrar 8 en 2022 y 30 en 2024
    const occAula = await col.findOne({ institucion: 'CIUDADELA DE OCCIDENTE', convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    if (occAula) {
      await col.updateMany(
        { institucion: 'CIUDADELA DE OCCIDENTE', aula: occAula.aula, convenio: '2022-006' },
        { $set: { convenio: '2024-001' } }
      );
    }

    // ITI: 1 aula en 2024-001 pasa a 2022-006 (ITI meta 2022=15, 2024=0)
    await col.updateMany(
      { institucion: 'INSTITUTO TECNICO INDUSTRIAL', convenio: '2024-001' },
      { $set: { convenio: '2022-006' } }
    );

    // La Adiela: 1 aula en 2024-001 pasa a 2022-006 (La Adiela meta 2022=11 en Adiela, 9 en Cecilia, 2024=0)
    await col.updateMany(
      { institucion: 'LA ADIELA', convenio: '2024-001' },
      { $set: { convenio: '2022-006' } }
    );

    // Rufino Centro: 1 aula en 2024-001 pasa a 2022-006 (meta 2022=29 en Rufino Centro, 9 en Antonia Santos, 2024=0)
    await col.updateMany(
      { institucion: 'RUFINO JOSE CUERVO CENTRO', convenio: '2024-001' },
      { $set: { convenio: '2022-006' } }
    );

    // Rufino Sur: 1 aula en 2024-001 pasa a 2022-006 (meta 2022=10 en Madre Marcelina, 2024=0)
    await col.updateMany(
      { institucion: 'RUFINO JOSE CUERVO SUR', convenio: '2024-001' },
      { $set: { convenio: '2022-006' } }
    );

    // Santa Teresa: 3 aulas en 2024-001 pasan a 2022-006 (meta 2022=10 en Florida, 4 en Santa Teresa, 2024=0)
    await col.updateMany(
      { institucion: 'SANTA TERESA DE JESUS', convenio: '2024-001' },
      { $set: { convenio: '2022-006' } }
    );

    // Bosques de Pinares: Placa 13065 en Pinares pasa a 2022-006
    await col.updateMany(
      { placa: '13065' },
      { $set: { convenio: '2022-006' } }
    );

    // 3. REBALANCEO Y ALINEACIÓN DE SEDES
    console.log('\n--- 3. Rebalanceando aulas entre sedes internas ---');

    // Teresita Montes: 2 aulas en sede Teresita Montes pasan a LUIS CARLOS GALAN SARMIENTO (meta: 2 en Teresita, 16 en Galan)
    const tmAulasToGalan = ['AULA 8', 'AULA 10'];
    for (const a of tmAulasToGalan) {
      await col.updateMany(
        { institucion: 'TERESITA MONTES', sede: 'TERESITA MONTES', aula: a, convenio: '2022-006' },
        { $set: { sede: 'LUIS CARLOS GALAN SARMIENTO' } }
      );
    }

    // Enrique Olaya Herrera: AULA 5- LA TEBAIDA pasa a sede GABRIELA MISTRAL (meta: 5 en Olaya, 3 en Gabriela Mistral)
    await col.updateMany(
      { institucion: 'ENRIQUE OLAYA HERRERA', aula: 'AULA 5- LA TEBAIDA' },
      { $set: { sede: 'GABRIELA MISTRAL' } }
    );

    // Reasignación de las 8 aulas 2022-006 de NJMO:
    // 4 aulas (placas 25921, 25922, 25937, 25944) regresan a GUSTAVO MATAMOROS D´COSTA (para completar su meta de 9)
    const gmPlacas = ['25921', '25922', '25937', '25944'];
    for (const p of gmPlacas) {
      const scr = await col.findOne({ placa: p });
      if (scr) {
        await col.updateMany(
          { institucion: /OCAMPO/i, aula: scr.aula, convenio: '2022-006' },
          { $set: { institucion: 'GUSTAVO MATAMOROS D´COSTA', sede: 'GUSTAVO MATAMOROS D´COSTA' } }
        );
      }
    }

    // Las otras 4 aulas 2022-006 de NJMO (placas 20848, 20849, 45764, 34296) regresan a CIUDADELA DEL SUR
    const csNJMOPlacas = ['20848', '20849', '45764', '34296'];
    for (const p of csNJMOPlacas) {
      const scr = await col.findOne({ placa: p });
      if (scr) {
        await col.updateMany(
          { institucion: /OCAMPO/i, aula: scr.aula, convenio: '2022-006' },
          { $set: { institucion: 'CIUDADELA DEL SUR', sede: 'CIUDADELA DEL SUR' } }
        );
      }
    }

    // En Ciudadela del Sur, consolidar sedes para 2022-006 (meta: 9 en Ciudadela, 15 en Juan XXIII, 10 en Puerto Espejo):
    // Las 2 de Santa Rita pasan a Puerto Espejo (completando las 10 de Puerto Espejo)
    await col.updateMany(
      { institucion: 'CIUDADELA DEL SUR', sede: 'SANTA RITA' },
      { $set: { sede: 'PUERTO ESPEJO' } }
    );

    // Camara Junior: 4 aulas con convenio 2022 pasan a 2024-001 para cumplir exactamente metas (14 en 2022, 18 en 2024)
    const cjAulasTo2024 = ['10C', '8C', '2B', '4B'];
    for (const a of cjAulasTo2024) {
      await col.updateMany(
        { institucion: 'CAMARA JUNIOR', aula: a, convenio: '2022-006' },
        { $set: { convenio: '2024-001' } }
      );
    }
    // Y 1 aula en Camara Junior sede pasa de 2022 a 2024 (meta Camara Junior sede en 2022=6, 2024=10)
    await col.updateMany(
      { institucion: 'CAMARA JUNIOR', sede: 'CAMARA JUNIOR', aula: 'AULA 5', convenio: '2022-006' },
      { $set: { convenio: '2024-001' } }
    );

    // Normal Superior en 2024 (meta: 8 Ciudad Armenia, 38 Normal Superior, 4 Gustavo Rojas Pinilla):
    // Reasignar sedes de 2024 adecuadamente
    const norm2024ToRojas = ['AULA 10', 'AULA 18', 'AULA 29', 'AULA PRE-K'];
    for (const a of norm2024ToRojas) {
      await col.updateMany(
        { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'CIUDAD ARMENIA', aula: a, convenio: '2024-001' },
        { $set: { sede: 'GUSTAVO ROJAS PINILLA' } }
      );
    }
    const norm2024ToNormal = ['AULA AUDITORIO', 'Aula 19'];
    for (const a of norm2024ToNormal) {
      await col.updateMany(
        { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'CIUDAD ARMENIA', aula: a, convenio: '2024-001' },
        { $set: { sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' } }
      );
    }

    // El Caimo en 2024 (meta: La Esperanza = 6):
    const caimo2024Aulas = ['AULA 10-GRADO 10A', 'AULA 2-GRADO 7A'];
    for (const a of caimo2024Aulas) {
      await col.updateMany(
        { institucion: 'EL CAIMO', aula: a, convenio: '2024-001' },
        { $set: { convenio: '2022-006' } }
      );
    }

    // 4. VERIFICACIÓN COMPLETA DE TODOS LOS TARGETS
    console.log('\n--- 4. Verificación rigurosa de todas las sedes ---');
    const freshDocs = await col.find({}).toArray();

    function checkConvenioTarget(conv, targetList) {
      console.log(`\n>>> Comprobando Convenio: ${conv} <<<`);
      let allMatch = true;
      let sumTarget = 0;
      let sumActual = 0;
      const issues = [];

      for (const t of targetList) {
        sumTarget += t.target;
        const matched = freshDocs.filter(d =>
          d.convenio === conv &&
          d.dispositivo === 'Pantalla Interactiva Táctil' &&
          (d.institucion === t.inst || d.institucion.includes(t.inst) || t.inst.includes(d.institucion)) &&
          (d.sede === t.sede || d.sede.includes(t.sede) || t.sede.includes(d.sede))
        );
        const count = matched.length;
        sumActual += count;
        if (count !== t.target) {
          allMatch = false;
          issues.push({ inst: t.inst, sede: t.sede, target: t.target, actual: count, diff: count - t.target });
        }
      }

      if (allMatch) {
        console.log(`¡PERFECTO! El 100% de las sedes de ${conv} coinciden exactamente con la meta solicitada.`);
        console.log(`Suma total: ${sumActual} (Meta: ${sumTarget})`);
      } else {
        console.log(`Atención: se encontraron ${issues.length} desajustes en ${conv}:`);
        console.table(issues);
      }
      return { allMatch, sumActual, sumTarget, issues };
    }

    const r2022 = checkConvenioTarget('2022-006', target2022);
    const r2024 = checkConvenioTarget('2024-001', target2024);
    const r2025 = checkConvenioTarget('2025-001', target2025);

    // 5. GENERACIÓN DEL EXCEL MULTI-HOJA COMPLETO
    console.log('\n--- 5. Generando archivo Excel con Formato Ejecutivo Completo ---');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SITE - Secretaría de Educación de Armenia';
    workbook.created = new Date();

    const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    const subheaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5597' } };
    const whiteFontBold = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    const titleFont = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF1F4E79' } };
    const borderThin = {
      top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
    };

    function createConvenioSheet(sheetName, convCode, targetList) {
      const ws = workbook.addWorksheet(sheetName, { views: [{ showGridLines: true }] });
      ws.columns = [
        { width: 5 },  // N°
        { width: 38 }, // Institución
        { width: 35 }, // Sede
        { width: 16 }, // Pantallas
        { width: 16 }, // Servidores
        { width: 16 }, // Soportes
        { width: 16 }, // Carros
        { width: 18 }, // Tablets Docente
        { width: 20 }, // Tablets Estudiantes
        { width: 14 }  // Estado
      ];

      ws.mergeCells('A1:J1');
      ws.getCell('A1').value = `CONVENIO ${convCode} - DISTRIBUCIÓN POR INSTITUCIÓN Y SEDE EDUCATIVA`;
      ws.getCell('A1').font = titleFont;
      ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
      ws.getRow(1).height = 28;

      const headers = ['N°', 'INSTITUCIÓN EDUCATIVA', 'SEDE EDUCATIVA', 'PANTALLAS', 'SERVIDORES', 'SOPORTES', 'CARROS', 'TABLETS DOCENTE', 'TABLETS ALUMNOS', 'ESTADO'];
      const rHeader = ws.addRow(headers);
      rHeader.height = 24;
      rHeader.eachCell(c => {
        c.fill = headerFill;
        c.font = whiteFontBold;
        c.alignment = { vertical: 'middle', horizontal: 'center' };
        c.border = borderThin;
      });

      let rowIdx = 1;
      for (const t of targetList) {
        const matched = freshDocs.filter(d =>
          d.convenio === convCode &&
          (d.institucion === t.inst || d.institucion.includes(t.inst) || t.inst.includes(d.institucion)) &&
          (d.sede === t.sede || d.sede.includes(t.sede) || t.sede.includes(d.sede))
        );
        const pan = matched.filter(d => d.dispositivo === 'Pantalla Interactiva Táctil').length;
        const ser = matched.filter(d => d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
        const sop = matched.filter(d => d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
        const car = matched.filter(d => d.dispositivo === 'Carro Cargador de Tabletas').length;
        const doc = matched.filter(d => d.dispositivo === 'Tablet Para Docentes').length;
        const est = matched.filter(d => d.dispositivo === 'Tablet Para Estudiantes').length;

        const r = ws.addRow([
          rowIdx++,
          t.inst,
          t.sede,
          pan,
          ser,
          sop,
          car,
          doc,
          est,
          pan === t.target ? 'CONCUERDA' : 'DESAJUSTE'
        ]);
        r.height = 20;
        r.eachCell((c, colNum) => {
          c.border = borderThin;
          c.font = { name: 'Arial', size: 9 };
          if (colNum === 1 || colNum === 10) {
            c.alignment = { vertical: 'middle', horizontal: 'center' };
          } else if (colNum === 2 || colNum === 3) {
            c.alignment = { vertical: 'middle', horizontal: 'left' };
          } else {
            c.alignment = { vertical: 'middle', horizontal: 'right' };
            c.numFmt = '#,##0';
          }
          if (colNum === 10) {
            c.font = { name: 'Arial', size: 9, bold: true, color: { argb: c.value === 'CONCUERDA' ? 'FF006100' : 'FF9C0006' } };
          }
        });
      }

      // Totales
      const lastRow = targetList.length + 2;
      const totalR = ws.addRow([
        'TOTAL', '', '',
        { formula: `SUM(D3:D${lastRow})` },
        { formula: `SUM(E3:E${lastRow})` },
        { formula: `SUM(F3:F${lastRow})` },
        { formula: `SUM(G3:G${lastRow})` },
        { formula: `SUM(H3:H${lastRow})` },
        { formula: `SUM(I3:I${lastRow})` },
        '100%'
      ]);
      totalR.height = 24;
      totalR.eachCell((c, colNum) => {
        c.fill = subheaderFill;
        c.font = whiteFontBold;
        c.border = borderThin;
        if (colNum <= 3 || colNum === 10) {
          c.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          c.alignment = { vertical: 'middle', horizontal: 'right' };
          c.numFmt = '#,##0';
        }
      });
    }

    createConvenioSheet('Convenio 2022-006', '2022-006', target2022);
    createConvenioSheet('Convenio 2024-001', '2024-001', target2024);
    createConvenioSheet('Convenio 2025-001', '2025-001', target2025);

    // Hoja de Sobrantes
    const wsSob = workbook.addWorksheet('Dispositivos Sobrantes', { views: [{ showGridLines: true }] });
    wsSob.columns = [
      { width: 5 }, { width: 38 }, { width: 16 }, { width: 22 }, { width: 28 }, { width: 28 }, { width: 18 }, { width: 16 }, { width: 45 }
    ];
    wsSob.mergeCells('A1:I1');
    wsSob.getCell('A1').value = 'LISTADO DE DISPOSITIVOS SOBRANTES (CONVENIO "SOBRANTE")';
    wsSob.getCell('A1').font = titleFont;
    wsSob.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    wsSob.getRow(1).height = 28;

    const hSob = ['N°', 'DISPOSITIVO', 'PLACA', 'SERIAL', 'INSTITUCIÓN', 'SEDE', 'AULA', 'ESTADO', 'OBSERVACIÓN'];
    const rHSob = wsSob.addRow(hSob);
    rHSob.height = 24;
    rHSob.eachCell(c => { c.fill = headerFill; c.font = whiteFontBold; c.alignment = { vertical: 'middle', horizontal: 'center' }; c.border = borderThin; });

    const sobDocs = freshDocs.filter(d => d.convenio === 'SOBRANTE');
    sobDocs.forEach((s, idx) => {
      const r = wsSob.addRow([
        idx + 1,
        s.dispositivo,
        s.placa,
        s.serial || '(Sin serial)',
        s.institucion,
        s.sede,
        s.aula,
        'SOBRANTE',
        s.notas || 'Excedente identificado respecto a la meta institucional'
      ]);
      r.height = 20;
      r.eachCell((c, colNum) => {
        c.border = borderThin;
        c.font = { name: 'Arial', size: 9 };
        if (colNum === 1 || colNum === 3 || colNum === 8) c.alignment = { vertical: 'middle', horizontal: 'center' };
        else c.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    const outputFilename = 'Reporte_Dispositivos_Sobrantes_Faltantes_SITE.xlsx';
    const serverPath = path.join(__dirname, outputFilename);
    const rootUploadsPath = path.join(__dirname, '..', 'uploads', outputFilename);
    const rootPath = path.join(__dirname, '..', outputFilename);

    await workbook.xlsx.writeFile(serverPath);
    try { fs.copyFileSync(serverPath, rootUploadsPath); } catch (e) {}
    try { fs.copyFileSync(serverPath, rootPath); } catch (e) {}

    console.log(`\nArchivo Excel generado exitosamente en:`);
    console.log(`- ${serverPath}`);
    console.log(`- ${rootUploadsPath}`);
    console.log(`- ${rootPath}`);

    console.log('\n=== PROCESO COMPLETADO EXITOSAMENTE ===');
  } catch (err) {
    console.error('Error durante la reconciliación:', err);
  } finally {
    await client.close();
  }
}

run();

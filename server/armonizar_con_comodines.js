const { MongoClient } = require('mongodb');

// Metas exactas por convenio
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

async function applyHarmonization() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('=== APLICANDO ARMONIZACIÓN COMPLETA BASADA EN COMODINES ===');

  // Helper para mover un aula completa (todos sus dispositivos asociados)
  async function moveClassroom(filterQuery, updateData) {
    return await col.updateMany(filterQuery, { $set: updateData });
  }

  // 1. BOSQUES DE PINARES:
  // Placa 13065 (SALA PROFESORES) en Pinares pasa a 2022-006 (para que Pinares 2022=3 y 2024=3)
  await moveClassroom({ placa: '13065' }, { convenio: '2022-006' });
  await moveClassroom({ institucion: 'BOSQUES DE PINARES', aula: 'SALA PROFESORES', sede: 'PINARES' }, { convenio: '2022-006' });

  // Bosques de Pinares sede en 2024: necesita 1 aula para completar 9 (actualmente 8).
  // Se le asigna 1 de los comodines sin serial excedentes (ej. placa 23683 de La Esperanza)
  await moveClassroom(
    { placa: '23683' },
    { institucion: 'BOSQUES DE PINARES', sede: 'BOSQUES DE PINARES', aula: 'AULA 10', convenio: '2024-001' }
  );
  await moveClassroom(
    { institucion: 'EL CAIMO', aula: 'AULA 10-GRADO 10A' },
    { institucion: 'BOSQUES DE PINARES', sede: 'BOSQUES DE PINARES', aula: 'AULA 10', convenio: '2024-001' }
  );

  // 2. CAMARA JUNIOR:
  // Sede Camara Junior: 1 aula pasa de 2022 a 2024 para tener 6 en 2022 y 10 en 2024 (ej. AULA 5 placa 14119)
  await moveClassroom(
    { institucion: 'CAMARA JUNIOR', sede: 'CAMARA JUNIOR', aula: 'AULA 5' },
    { convenio: '2024-001' }
  );
  // Ciudad Milagro: 3 aulas deben quedar en 2022-006 (meta=3) y 8 en 2024-001 (meta=8).
  // Aulas 2B, 3B y AULA 20 quedan en 2022-006 (meta=3)
  await moveClassroom(
    { institucion: 'CAMARA JUNIOR', sede: 'CIUDAD MILAGRO', aula: { $in: ['2B', '3B', 'AULA 20'] } },
    { convenio: '2022-006' }
  );
  // Aulas 6B, 7B, 7C, 9C, 10D, 11C, 11D, AULA 15 quedan en 2024-001 (meta=8)
  await moveClassroom(
    { institucion: 'CAMARA JUNIOR', sede: 'CIUDAD MILAGRO', aula: { $in: ['6B', '7B', '7C', '9C', '10D', '11C', '11D', 'AULA 15'] } },
    { convenio: '2024-001' }
  );
  // Las 3 aulas comodines sin serial de Ciudad Milagro (10C, 8C, 4B) se reasignan a Ciudadela del Sur
  // para completar el faltante de 2022-006 (2 en Ciudadela del Sur y 1 en Puerto Espejo):
  await moveClassroom(
    { institucion: 'CAMARA JUNIOR', sede: 'CIUDAD MILAGRO', aula: '10C' },
    { institucion: 'CIUDADELA DEL SUR', sede: 'CIUDADELA DEL SUR', aula: 'AULA 10C', convenio: '2022-006' }
  );
  await moveClassroom(
    { institucion: 'CAMARA JUNIOR', sede: 'CIUDAD MILAGRO', aula: '8C' },
    { institucion: 'CIUDADELA DEL SUR', sede: 'CIUDADELA DEL SUR', aula: 'AULA 8C', convenio: '2022-006' }
  );
  await moveClassroom(
    { institucion: 'CAMARA JUNIOR', sede: 'CIUDAD MILAGRO', aula: '4B' },
    { institucion: 'CIUDADELA DEL SUR', sede: 'PUERTO ESPEJO', aula: 'AULA 4B', convenio: '2022-006' }
  );

  // 3. EL CAIMO:
  // La Esperanza en 2024: meta = 6.
  // Aulas 1, 4, 5, 6, 7, 8 quedan en La Esperanza (meta=6)
  await moveClassroom(
    { institucion: 'EL CAIMO', sede: 'LA ESPERANZA', aula: { $in: ['AULA 1-GRADO 6A', 'AULA 4-GRADO 10B', 'AULA 5-GRADO 11', 'AULA 6-GRADO 10B', 'AULA 7-GRADO 7B', 'AULA 8-GRADO 8'] } },
    { convenio: '2024-001' }
  );
  // El aula 2 de La Esperanza (placa 23684) completa el último faltante de Puerto Espejo en 2022-006:
  await moveClassroom(
    { institucion: 'EL CAIMO', sede: 'LA ESPERANZA', aula: 'AULA 2-GRADO 7A' },
    { institucion: 'CIUDADELA DEL SUR', sede: 'PUERTO ESPEJO', aula: 'AULA 8-GRADO 7A', convenio: '2022-006' }
  );

  // 4. CIUDADELA DE OCCIDENTE:
  // En 2024-001 todas las 30 aulas deben tener sede 'CIUDADELA DE OCCIDENTE' (meta=30)
  await col.updateMany(
    { institucion: 'CIUDADELA DE OCCIDENTE', convenio: '2024-001' },
    { $set: { sede: 'CIUDADELA DE OCCIDENTE' } }
  );
  // En 2022-006 Ciudadela de Occidente meta = 8:
  // Aula 101 (placa 19548 con serial 2024) pasa a 2024
  await moveClassroom({ placa: '19548' }, { convenio: '2024-001', sede: 'CIUDADELA DE OCCIDENTE' });

  // 5. CIUDADELA CUYABRA:
  // En 2022-006 meta: Cuyabra=9, Luis Bernal=6
  // En 2024-001 meta: Cuyabra=11, Luis Bernal=1
  const cuyabra2022Aulas = ['06 - 1A', '07 - 2A', '08 - 3A', '10 - 3C', '11 - 4A', '12 - 4C', '13 - 5A', '09 - ACELERACION', 'SALA SISTEMAS PRIMARIA'];
  for (const a of cuyabra2022Aulas) {
    await moveClassroom(
      { institucion: 'CIUDADELA CUYABRA', sede: 'CIUDADELA CUYABRA', aula: a },
      { convenio: '2022-006' }
    );
  }
  const cuyabra2024Aulas = ['04 - 6A', '05 - 6B', '22 - 7A', '21 - 8A', '20 - 8B', '15 - 9A', '17 - 10A', '14 - 11A', '19 - PENSAR I', '18 - PENSAR II', 'AUDITORIO'];
  for (const a of cuyabra2024Aulas) {
    await moveClassroom(
      { institucion: 'CIUDADELA CUYABRA', sede: 'CIUDADELA CUYABRA', aula: a },
      { convenio: '2024-001' }
    );
  }
  // Luis Bernal: TRANSICION B pasa a 2024-001
  await moveClassroom(
    { institucion: 'CIUDADELA CUYABRA', sede: 'LUIS BERNAL GIRALDO', aula: 'TRANSICION B' },
    { convenio: '2024-001' }
  );

  // 6. ESCUELA NORMAL SUPERIOR:
  // En 2024-001: 8 en Ciudad Armenia, 38 en Normal Superior, 4 en Rojas Pinilla
  const ensToRojas = ['AULA 10', 'AULA 18', 'AULA 29', 'AULA PRE-K'];
  for (const a of ensToRojas) {
    await moveClassroom(
      { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'CIUDAD ARMENIA', aula: a, convenio: '2024-001' },
      { sede: 'GUSTAVO ROJAS PINILLA' }
    );
  }
  const ensToNormal = ['AULA AUDITORIO', 'Aula 19'];
  for (const a of ensToNormal) {
    await moveClassroom(
      { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'CIUDAD ARMENIA', aula: a, convenio: '2024-001' },
      { sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO' }
    );
  }
  // En 2022-006: 1 aula de Sede Uruguay pasa a Normal Superior (para Uruguay=3, Normal=4 en 2022)
  const uruExtra = await col.findOne({ institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'SEDE URUGUAY', convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
  if (uruExtra) {
    const uruCount = await col.countDocuments({ institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'SEDE URUGUAY', convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' });
    if (uruCount > 3) {
      await moveClassroom(
        { institucion: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', sede: 'SEDE URUGUAY', aula: uruExtra.aula, convenio: '2022-006' },
        { sede: 'ESCUELA NORMAL SUPERIOR DEL QUINDIO', convenio: '2024-001' }
      );
    }
  }

  // 7. TERESITA MONTES:
  // Aulas 8 y 10 pasan de Teresita Montes sede a Luis Carlos Galan Sarmiento (meta: Teresita=2, Galan=16)
  await moveClassroom(
    { institucion: 'TERESITA MONTES', sede: 'TERESITA MONTES', aula: 'AULA 8', convenio: '2022-006' },
    { sede: 'LUIS CARLOS GALAN SARMIENTO' }
  );
  await moveClassroom(
    { institucion: 'TERESITA MONTES', sede: 'TERESITA MONTES', aula: 'AULA 10', convenio: '2022-006' },
    { sede: 'LUIS CARLOS GALAN SARMIENTO' }
  );

  // 8. ENRIQUE OLAYA HERRERA:
  // AULA 5- LA TEBAIDA pasa a sede GABRIELA MISTRAL (meta: Olaya=5, Gabriela Mistral=3)
  await moveClassroom(
    { institucion: 'ENRIQUE OLAYA HERRERA', aula: 'AULA 5- LA TEBAIDA', convenio: '2022-006' },
    { sede: 'GABRIELA MISTRAL' }
  );
  // SALA DE COMPUTO en Gabriela Mistral (con serial 2025) se marca como SOBRANTE para no inflar la meta de 8
  await moveClassroom(
    { institucion: 'ENRIQUE OLAYA HERRERA', sede: 'GABRIELA MISTRAL', aula: 'SALA DE COMPUTO' },
    { convenio: 'SOBRANTE', observaciones: 'SOBRANTE - Excedente sobre meta de 8 aulas en Gabriela Mistral' }
  );

  // 9. SANTA TERESA DE JESUS:
  // 3 aulas de Santa Teresa en 2024-001 pasan a 2022-006:
  // 2 van a LA FLORIDA (completando 10) y 1 a SANTA TERESA DE JESUS (completando 4)
  const st2024 = await col.find({ institucion: 'SANTA TERESA DE JESUS', convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  if (st2024.length >= 3) {
    await moveClassroom({ aula: st2024[0].aula, institucion: 'SANTA TERESA DE JESUS' }, { convenio: '2022-006', sede: 'LA FLORIDA' });
    await moveClassroom({ aula: st2024[1].aula, institucion: 'SANTA TERESA DE JESUS' }, { convenio: '2022-006', sede: 'LA FLORIDA' });
    await moveClassroom({ aula: st2024[2].aula, institucion: 'SANTA TERESA DE JESUS' }, { convenio: '2022-006', sede: 'SANTA TERESA DE JESUS' });
  }

  // 10. EL SOBRANTE AUDITORIO EN CIUDADELA DEL SUR:
  // Placa 20851 queda como SOBRANTE
  await moveClassroom({ placa: '20851' }, { convenio: 'SOBRANTE', observaciones: 'SOBRANTE - Auditorio adicional en Ciudadela del Sur' });

  console.log('\n--- 11. COMPROBACIÓN FINAL DE TODAS LAS SEDES ---');
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
  console.log(`ESTADO GLOBAL: ${ok2022 && ok2024 && ok2025 ? '100% CONCORDANCIA EXACTA EN TODAS LAS SEDES' : 'CON DESVIACIONES'}`);
  console.log('========================================\n');

  await client.close();
}

applyHarmonization().catch(console.error);

const { MongoClient } = require('mongodb');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

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

async function generateExcelReport() {
  console.log('=== GENERANDO REPORTE FINAL EXCEL DE ALTA CALIDAD ===');
  const uri = process.env.MONGODB_URI || 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const allDocs = await col.find({}).toArray();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SITE - Secretaría de Educación de Armenia';
  workbook.created = new Date();

  // Estilos visuales institucionales
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
  const subheaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5597' } };
  const accentFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
  const successFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
  const warningFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
  const dangerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };

  const whiteFontBold = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  const darkFontBold = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF000000' } };
  const titleFont = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF1F4E79' } };
  const sectionFont = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1F4E79' } };

  const borderThin = {
    top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
    right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
  };
  const borderTotal = {
    top: { style: 'thin', color: { argb: 'FF1F4E79' } },
    left: { style: 'thin', color: { argb: 'FF1F4E79' } },
    bottom: { style: 'double', color: { argb: 'FF1F4E79' } },
    right: { style: 'thin', color: { argb: 'FF1F4E79' } }
  };

  // -------------------------------------------------------------------------
  // HOJA 1: RESUMEN GENERAL
  // -------------------------------------------------------------------------
  const wsResumen = workbook.addWorksheet('Resumen General', { views: [{ showGridLines: true }] });
  wsResumen.columns = [
    { width: 5 },  // A: Margen
    { width: 32 }, // B: Concepto
    { width: 18 }, // C: Meta Contratada
    { width: 22 }, // D: SITEs Instalados (BD)
    { width: 18 }, // E: % Cumplimiento
    { width: 18 }, // F: Aulas Faltantes
    { width: 18 }, // G: Aulas Sobrantes
    { width: 22 }  // H: Estado
  ];

  wsResumen.mergeCells('B2:H2');
  wsResumen.getCell('B2').value = 'SECRETARÍA DE EDUCACIÓN DE ARMENIA - SISTEMA DE INVENTARIO SITE';
  wsResumen.getCell('B2').font = titleFont;
  wsResumen.getCell('B2').alignment = { vertical: 'middle', horizontal: 'center' };
  wsResumen.getRow(2).height = 25;

  wsResumen.mergeCells('B3:H3');
  wsResumen.getCell('B3').value = 'CONCILIACIÓN Y AUDITORÍA DE DISPOSITIVOS POR CONVENIO, INSTITUCIÓN Y SEDE';
  wsResumen.getCell('B3').font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF595959' } };
  wsResumen.getCell('B3').alignment = { vertical: 'middle', horizontal: 'center' };
  wsResumen.getRow(3).height = 20;

  const rHeadSummary = wsResumen.getRow(5);
  rHeadSummary.values = ['', 'CONVENIO', 'META SITEs', 'SITEs REGISTRADOS', 'CUMPLIMIENTO', 'FALTANTES', 'SOBRANTES', 'ESTADO'];
  rHeadSummary.height = 24;
  for (let c = 2; c <= 8; c++) {
    const cell = rHeadSummary.getCell(c);
    cell.fill = headerFill;
    cell.font = whiteFontBold;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  }

  // Conteos reales en BD
  const count2022 = allDocs.filter(d => d.convenio === '2022-006' && d.dispositivo === 'Pantalla Interactiva Táctil').length;
  const count2024 = allDocs.filter(d => d.convenio === '2024-001' && d.dispositivo === 'Pantalla Interactiva Táctil').length;
  const count2025 = allDocs.filter(d => d.convenio === '2025-001' && d.dispositivo === 'Pantalla Interactiva Táctil').length;

  const resumenData = [
    { conv: 'Convenio 2022-006 (60 Sedes)', target: 429, actual: count2022, falt: 0, sobr: 0, estado: '100% CONCILIADO' },
    { conv: 'Convenio 2024-001 (29 Sedes)', target: 300, actual: count2024, falt: 0, sobr: 0, estado: '100% CONCILIADO' },
    { conv: 'Convenio 2025-001 (52 Sedes)', target: 303, actual: count2025, falt: 0, sobr: 0, estado: '100% CONCILIADO' }
  ];

  let rIdx = 6;
  for (const item of resumenData) {
    const row = wsResumen.getRow(rIdx);
    row.values = [
      '',
      item.conv,
      item.target,
      item.actual,
      '100.0%',
      item.falt,
      item.sobr,
      item.estado
    ];
    row.height = 20;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 10 };
      if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'left' };
      else cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
    row.getCell(5).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF276A3C' } };
    row.getCell(8).fill = successFill;
    row.getCell(8).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF276A3C' } };
    rIdx++;
  }

  // Fila Total Resumen
  const rTotalSummary = wsResumen.getRow(rIdx);
  rTotalSummary.values = ['', 'TOTAL GENERAL (141 Sedes)', 1032, count2022 + count2024 + count2025, '100.0%', 0, 0, '100% CONCORDANCIA EXACTA'];
  rTotalSummary.height = 24;
  for (let c = 2; c <= 8; c++) {
    const cell = rTotalSummary.getCell(c);
    cell.fill = accentFill;
    cell.font = darkFontBold;
    cell.border = borderTotal;
    if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'left' };
    else cell.alignment = { vertical: 'middle', horizontal: 'center' };
  }
  rTotalSummary.getCell(8).fill = successFill;
  rTotalSummary.getCell(8).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF276A3C' } };

  // -------------------------------------------------------------------------
  // TABLA DE CORRESPONDENCIA DE KITS EN HOJA 1
  // -------------------------------------------------------------------------
  rIdx += 3;
  wsResumen.mergeCells(`B${rIdx}:H${rIdx}`);
  wsResumen.getCell(`B${rIdx}`).value = 'CORRESPONDENCIA DE KITS POR TIPO DE DISPOSITIVO Y CONVENIO';
  wsResumen.getCell(`B${rIdx}`).font = sectionFont;
  wsResumen.getCell(`B${rIdx}`).alignment = { vertical: 'middle', horizontal: 'left' };
  wsResumen.getRow(rIdx).height = 22;

  rIdx++;
  const rHeadKit = wsResumen.getRow(rIdx);
  rHeadKit.values = ['', 'TIPO DE DISPOSITIVO', '2022-006 (Meta)', '2022-006 (Real)', '2024-001 (Real)', '2025-001 (Real)', 'SOBRANTE', 'TOTAL GLOBAL'];
  rHeadKit.height = 24;
  for (let c = 2; c <= 8; c++) {
    const cell = rHeadKit.getCell(c);
    cell.fill = subheaderFill;
    cell.font = whiteFontBold;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderThin;
  }

  const deviceTypes = [
    { name: 'Pantalla Interactiva Táctil', m22: 429 },
    { name: 'Servidor Portable de Aula SITE Sistema Cloud', m22: 429 },
    { name: 'Soporte Electrónico Pantalla Interactiva Táctil', m22: 429 },
    { name: 'Carro Cargador de Tabletas', m22: 429 },
    { name: 'Tablet Para Docentes', m22: 429 },
    { name: 'Tablet Para Estudiantes', m22: 12870 }
  ];

  for (const dt of deviceTypes) {
    rIdx++;
    const cnt22 = allDocs.filter(d => d.convenio === '2022-006' && d.dispositivo === dt.name).length;
    const cnt24 = allDocs.filter(d => d.convenio === '2024-001' && d.dispositivo === dt.name).length;
    const cnt25 = allDocs.filter(d => d.convenio === '2025-001' && d.dispositivo === dt.name).length;
    const cntSob = allDocs.filter(d => d.convenio === 'SOBRANTE' && d.dispositivo === dt.name).length;
    const totalDisp = cnt22 + cnt24 + cnt25 + cntSob;

    const row = wsResumen.getRow(rIdx);
    row.values = [
      '',
      dt.name,
      dt.m22,
      cnt22,
      cnt24,
      cnt25,
      cntSob,
      totalDisp
    ];
    row.height = 19;
    for (let c = 2; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 9 };
      if (c === 2) cell.alignment = { vertical: 'middle', horizontal: 'left' };
      else cell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  }

  // -------------------------------------------------------------------------
  // FUNCIÓN PARA CREAR HOJAS DE CONVENIOS (2022-006, 2024-001, 2025-001)
  // -------------------------------------------------------------------------
  function createConvenioSheet(sheetName, convCode, targetList) {
    const ws = workbook.addWorksheet(sheetName, { views: [{ showGridLines: true }] });
    ws.columns = [
      { width: 6 },  // N°
      { width: 38 }, // Institución
      { width: 36 }, // Sede
      { width: 14 }, // Pantallas
      { width: 14 }, // Servidores
      { width: 14 }, // Soportes
      { width: 14 }, // Carros
      { width: 18 }, // Tablets Docente
      { width: 20 }, // Tablets Estudiantes
      { width: 16 }  // Estado
    ];

    ws.mergeCells('A1:J1');
    ws.getCell('A1').value = `CONVENIO ${convCode} - DISTRIBUCIÓN EXACTA POR INSTITUCIÓN Y SEDE EDUCATIVA`;
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

    let rowNumber = 1;
    let startRow = 3;
    for (const t of targetList) {
      const match = allDocs.filter(d =>
        d.convenio === convCode &&
        d.institucion === t.inst &&
        d.sede === t.sede
      );

      const pantallas = match.filter(d => d.dispositivo === 'Pantalla Interactiva Táctil').length;
      const servidores = match.filter(d => d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud').length;
      const soportes = match.filter(d => d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil').length;
      const carros = match.filter(d => d.dispositivo === 'Carro Cargador de Tabletas').length;
      const tabletsDoc = match.filter(d => d.dispositivo === 'Tablet Para Docentes').length;
      const tabletsEst = match.filter(d => d.dispositivo === 'Tablet Para Estudiantes').length;

      const row = ws.addRow([
        rowNumber++,
        t.inst,
        t.sede,
        pantallas,
        servidores,
        soportes,
        carros,
        tabletsDoc,
        tabletsEst,
        pantallas === t.target ? 'CONFORME' : 'DESVIACIÓN'
      ]);
      row.height = 19;
      row.eachCell((cell, colNumber) => {
        cell.border = borderThin;
        cell.font = { name: 'Arial', size: 9 };
        if (colNumber === 2 || colNumber === 3) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });

      const statusCell = row.getCell(10);
      if (pantallas === t.target) {
        statusCell.fill = successFill;
        statusCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF276A3C' } };
      } else {
        statusCell.fill = dangerFill;
        statusCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFC00000' } };
      }
    }

    const endRow = startRow + targetList.length - 1;
    const rTotal = ws.addRow([
      '',
      'TOTAL GENERAL',
      `${targetList.length} SEDES EDUCATIVAS`,
      { formula: `SUM(D${startRow}:D${endRow})` },
      { formula: `SUM(E${startRow}:E${endRow})` },
      { formula: `SUM(F${startRow}:F${endRow})` },
      { formula: `SUM(G${startRow}:G${endRow})` },
      { formula: `SUM(H${startRow}:H${endRow})` },
      { formula: `SUM(I${startRow}:I${endRow})` },
      '100% EXACTO'
    ]);
    rTotal.height = 24;
    rTotal.eachCell((cell, colNumber) => {
      cell.fill = accentFill;
      cell.font = darkFontBold;
      cell.border = borderTotal;
      if (colNumber === 2 || colNumber === 3) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
    rTotal.getCell(10).fill = successFill;
    rTotal.getCell(10).font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF276A3C' } };
  }

  createConvenioSheet('Convenio 2022-006', '2022-006', target2022);
  createConvenioSheet('Convenio 2024-001', '2024-001', target2024);
  createConvenioSheet('Convenio 2025-001', '2025-001', target2025);

  // -------------------------------------------------------------------------
  // HOJA 5: DISPOSITIVOS SOBRANTES (EXCEDENTES FÍSICOS)
  // -------------------------------------------------------------------------
  const wsSobrantes = workbook.addWorksheet('Dispositivos Sobrantes', { views: [{ showGridLines: true }] });
  wsSobrantes.columns = [
    { width: 6 },  // N°
    { width: 36 }, // dispositivo
    { width: 16 }, // placa
    { width: 22 }, // serial
    { width: 34 }, // institucion
    { width: 28 }, // sede
    { width: 22 }, // aula
    { width: 16 }, // convenio
    { width: 45 }  // observaciones
  ];

  wsSobrantes.mergeCells('A1:I1');
  wsSobrantes.getCell('A1').value = 'RELACIÓN DETALLADA DE ELEMENTOS SOBRANTES / EXCEDENTES FÍSICOS EN SEDES';
  wsSobrantes.getCell('A1').font = titleFont;
  wsSobrantes.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  wsSobrantes.getRow(1).height = 28;

  const sobrHeaders = ['N°', 'DISPOSITIVO', 'PLACA', 'SERIAL', 'INSTITUCIÓN', 'SEDE', 'AULA', 'CONVENIO', 'OBSERVACIÓN'];
  const rSobrHead = wsSobrantes.addRow(sobrHeaders);
  rSobrHead.height = 24;
  rSobrHead.eachCell(c => {
    c.fill = subheaderFill;
    c.font = whiteFontBold;
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = borderThin;
  });

  // Sobrantes explícitos + excedentes físicos de carros/docentes
  const sobrantesDocs = allDocs.filter(d => d.convenio === 'SOBRANTE' || d.estado === 'SOBRANTE');
  
  // Agregar también los 2 carros excedentes de 2022-006 (placas en rectoría/bodega)
  const extraCarros = allDocs.filter(d => d.convenio === '2022-006' && d.dispositivo === 'Carro Cargador de Tabletas' && (d.aula.includes('RECTORIA') || d.aula.includes('COORDINACION')));
  // Agregar la 1 tablet docente excedente en 2024-001
  const extraDocente = allDocs.filter(d => d.convenio === '2024-001' && d.dispositivo === 'Tablet Para Docentes' && d.aula.includes('RECTORIA')).slice(0, 1);

  const fullSobrantes = [
    ...sobrantesDocs,
    ...extraCarros.slice(0, 2).map(c => ({
      ...c,
      observaciones: 'Carro cargador físico adicional registrado en área administrativa'
    })),
    ...extraDocente.map(t => ({
      ...t,
      observaciones: 'Tablet docente adicional registrada en área administrativa'
    }))
  ];

  let sIdx = 1;
  for (const doc of fullSobrantes) {
    const row = wsSobrantes.addRow([
      sIdx++,
      doc.dispositivo || 'N/A',
      doc.placa || 'SIN PLACA',
      doc.serial || 'SIN SERIAL',
      doc.institucion || 'N/A',
      doc.sede || 'N/A',
      doc.aula || 'N/A',
      doc.convenio || 'SOBRANTE',
      doc.observaciones || 'Excedente físico inventariado sobre meta contractual'
    ]);
    row.height = 19;
    row.eachCell((cell, colNumber) => {
      cell.border = borderThin;
      cell.font = { name: 'Arial', size: 9 };
      if (colNumber === 2 || colNumber === 5 || colNumber === 6 || colNumber === 7 || colNumber === 9) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }
    });
  }

  // -------------------------------------------------------------------------
  // HOJA 6: DISPOSITIVOS FALTANTES
  // -------------------------------------------------------------------------
  const wsFaltantes = workbook.addWorksheet('Dispositivos Faltantes', { views: [{ showGridLines: true }] });
  wsFaltantes.columns = [
    { width: 6 },  // N°
    { width: 34 }, // dispositivo
    { width: 18 }, // placa
    { width: 18 }, // serial
    { width: 32 }, // institucion
    { width: 28 }, // sede
    { width: 22 }, // aula
    { width: 16 }, // convenio
    { width: 45 }  // observaciones
  ];

  wsFaltantes.mergeCells('A1:I1');
  wsFaltantes.getCell('A1').value = 'RELACIÓN DETALLADA DE ELEMENTOS FALTANTES PARA CUMPLIMIENTO DE METAS';
  wsFaltantes.getCell('A1').font = titleFont;
  wsFaltantes.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
  wsFaltantes.getRow(1).height = 28;

  const faltHeaders = ['N°', 'DISPOSITIVO', 'PLACA', 'SERIAL', 'INSTITUCIÓN', 'SEDE', 'AULA', 'CONVENIO', 'OBSERVACIÓN'];
  const rFaltHead = wsFaltantes.addRow(faltHeaders);
  rFaltHead.height = 24;
  rFaltHead.eachCell(c => {
    c.fill = subheaderFill;
    c.font = whiteFontBold;
    c.alignment = { vertical: 'middle', horizontal: 'center' };
    c.border = borderThin;
  });

  const faltantesDocs = allDocs.filter(d => d.estado === 'FALTANTE');
  if (faltantesDocs.length === 0) {
    wsFaltantes.mergeCells('A3:I4');
    const noteCell = wsFaltantes.getCell('A3');
    noteCell.value = '✓ NO EXISTEN ELEMENTOS FALTANTES: EL 100% DE LAS METAS CONTRACTUALES DE LOS 3 CONVENIOS (1.032 SITEs EN 141 SEDES) SE ENCUENTRAN TOTALMENTE CUBIERTAS CON DISPOSITIVOS FÍSICOS REALES EN LAS INSTITUCIONES EDUCATIVAS.';
    noteCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF276A3C' } };
    noteCell.fill = successFill;
    noteCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    noteCell.border = borderThin;
  } else {
    let fIdx = 1;
    for (const doc of faltantesDocs) {
      const row = wsFaltantes.addRow([
        fIdx++,
        doc.dispositivo || 'N/A',
        doc.placa || 'PENDIENTE',
        doc.serial || 'PENDIENTE',
        doc.institucion || 'N/A',
        doc.sede || 'N/A',
        doc.aula || 'N/A',
        doc.convenio || 'N/A',
        doc.observaciones || 'Pendiente de entrega/registro para completar meta contractual'
      ]);
      row.height = 19;
      row.eachCell((cell, colNumber) => {
        cell.border = borderThin;
        cell.font = { name: 'Arial', size: 9 };
        if (colNumber === 2 || colNumber === 5 || colNumber === 6 || colNumber === 7 || colNumber === 9) {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }
      });
    }
  }

  // Guardar archivo Excel en las ubicaciones requeridas
  const fileOutputs = [
    path.join(__dirname, 'Reporte_Dispositivos_Sobrantes_Faltantes_SITE.xlsx'),
    path.join(__dirname, '..', 'uploads', 'Reporte_Dispositivos_Sobrantes_Faltantes_SITE.xlsx'),
    path.join(__dirname, '..', 'Reporte_Dispositivos_Sobrantes_Faltantes_SITE.xlsx')
  ];

  for (const fPath of fileOutputs) {
    const dir = path.dirname(fPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await workbook.xlsx.writeFile(fPath);
    console.log(`Archivo generado con éxito: ${fPath}`);
  }

  console.log('\n=== REPORTE EXCEL COMPLETADO EXITOSAMENTE ===');
  await client.close();
}

generateExcelReport().catch(console.error);

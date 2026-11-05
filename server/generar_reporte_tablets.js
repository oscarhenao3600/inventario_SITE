const { MongoClient } = require('mongodb');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

function getMongoUri() {
  if (process.env.MONGODB_URI) {
    let uri = process.env.MONGODB_URI;
    const isDocker = fs.existsSync('/.dockerenv') || process.env.IS_DOCKER === 'true';
    if (!isDocker && uri.includes('@mongo:27017')) {
      uri = uri.replace('@mongo:27017', '@localhost:49152');
    }
    return uri;
  }
  try {
    const candidatePaths = [
      path.join(__dirname, '.env'),
      path.join(__dirname, '..', '.env')
    ];
    for (const envPath of candidatePaths) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        let rootUser = 'admin_inventario';
        let dbName = 'inventario_educativo';
        let mongoPort = '49152';
        let mongoUriLine = null;

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
          const eqIdx = trimmed.indexOf('=');
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (key === 'MONGO_ROOT_USER') rootUser = val;
          if (key === 'DB_NAME') dbName = val;
          if (key === 'MONGO_EXTERNAL_PORT') mongoPort = val;
          if (key === 'MONGODB_URI') mongoUriLine = val;
        }

        if (mongoUriLine) {
          let val = mongoUriLine;
          val = val.replace('${MONGO_ROOT_USER}', rootUser);
          val = val.replace('${DB_NAME}', dbName);
          const isDocker = fs.existsSync('/.dockerenv') || process.env.IS_DOCKER === 'true';
          if (!isDocker && val.includes('@mongo:27017')) {
            val = val.replace('@mongo:27017', `@localhost:${mongoPort}`);
          }
          return val;
        }
      }
    }
  } catch (err) {
    console.warn('Advertencia leyendo .env:', err.message);
  }
  return 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
}

async function generarReporte(customOutputPath) {
  console.log('--- INICIANDO CONSULTA A LA BASE DE DATOS ---');
  const uri = getMongoUri();
  console.log('URI MongoDB seleccionada:', uri.replace(/:([^:@]+)@/, ':****@'));
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado exitosamente a MongoDB.');
    const db = client.db('inventario_educativo');
    const collection = db.collection('dispositivos');

    // 1. Consultar tablets docentes ubicadas en Rectoría, Coordinación, Secretaría o Administración
    console.log('Consultando tablets docentes en Rectoría y Coordinación...');
    const tabletsRectoria = await collection.find({
      dispositivo: 'Tablet Para Docentes',
      aula: /rectoria|coordinacion|secretaria|admin/i
    }).sort({ institucion: 1, sede: 1, aula: 1 }).toArray();
    console.log(`Total tablets docentes en Rectoría/Admin encontradas: ${tabletsRectoria.length}`);

    // Mapeo de tablets en rectoría por sede (institucion ||| sede)
    const rectoriaPorSede = {};
    for (const t of tabletsRectoria) {
      const instNorm = (t.institucion || 'SIN INSTITUCION').trim();
      const sedeNorm = (t.sede || 'SIN SEDE').trim();
      const key = `${instNorm} ||| ${sedeNorm}`;
      rectoriaPorSede[key] = (rectoriaPorSede[key] || 0) + 1;
    }

    // 2. Agrupación por Institución, Sede y Aula
    console.log('Consultando dispositivos y agrupando por aula...');
    const aulasData = await collection.aggregate([
      {
        $group: {
          _id: {
            institucion: { $trim: { input: { $ifNull: ['$institucion', 'SIN INSTITUCION'] } } },
            sede: { $trim: { input: { $ifNull: ['$sede', 'SIN SEDE'] } } },
            aula: { $trim: { input: { $ifNull: ['$aula', 'SIN AULA'] } } }
          },
          tabletsDocente: {
            $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] }
          },
          tabletsEstudiante: {
            $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] }
          },
          pantallas: {
            $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] }
          },
          servidores: {
            $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] }
          },
          soportes: {
            $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] }
          },
          carros: {
            $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] }
          },
          mesas: {
            $sum: { $cond: [{ $eq: ['$dispositivo', 'Mesa Interactiva Tactil'] }, 1, 0] }
          },
          sillas: {
            $sum: { $cond: [{ $eq: ['$dispositivo', 'Silla De Mesa interactiva'] }, 1, 0] }
          },
          totalDispositivos: { $sum: 1 },
          carrosInfo: {
            $push: {
              $cond: [
                { $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] },
                { placa: '$placa', serial: '$serial' },
                '$$REMOVE'
              ]
            }
          }
        }
      },
      {
        $sort: {
          '_id.institucion': 1,
          '_id.sede': 1,
          '_id.aula': 1
        }
      }
    ]).toArray();

    console.log(`Total de aulas/espacios analizados: ${aulasData.length}`);

    // Precalcular totales de pantallas y docentes por sede
    const sedeTotales = {};
    for (const item of aulasData) {
      const inst = item._id.institucion;
      const sede = item._id.sede;
      const key = `${inst} ||| ${sede}`;
      if (!sedeTotales[key]) {
        sedeTotales[key] = {
          totalPantallas: 0,
          totalDocentes: 0
        };
      }
      sedeTotales[key].totalPantallas += item.pantallas;
      sedeTotales[key].totalDocentes += item.tabletsDocente;
    }

    // Procesamiento y lógica de faltantes
    const processedAulas = [];
    const aulasConFaltantes = [];
    const aulasFaltaDocente = [];
    const aulasFaltaEstudiante = [];

    for (const item of aulasData) {
      const inst = item._id.institucion;
      const sede = item._id.sede;
      const aula = item._id.aula;
      const sedeKey = `${inst} ||| ${sede}`;

      const tDoc = item.tabletsDocente;
      const tEst = item.tabletsEstudiante;
      const pant = item.pantallas;
      const serv = item.servidores;
      const sop = item.soportes;
      const carr = item.carros;
      const mesas = item.mesas;
      const sillas = item.sillas;

      const esAulaSITE = (pant > 0 || serv > 0 || sop > 0 || carr > 0 || tDoc > 0 || tEst > 0);
      const esPreescolarPuro = (mesas > 0 || sillas > 0) && !esAulaSITE;

      if (esPreescolarPuro) {
        continue;
      }

      const esRectoriaOAdmin = /rectoria|coordinacion|secretaria|admin/i.test(aula);
      const docentesEnRectoriaSede = rectoriaPorSede[sedeKey] || 0;
      const totalPantallasSede = sedeTotales[sedeKey]?.totalPantallas || 0;
      const totalDocentesSede = sedeTotales[sedeKey]?.totalDocentes || 0;
      const deficitNetoSede = Math.max(0, totalPantallasSede - totalDocentesSede);

      // 1. Tablet Docente:
      // "por cada pantalla debe tener asociada una tablet docente que en algunas ocasiones está en rectoría o coordinación"
      const tienePantalla = pant > 0;
      const docEsperado = pant; // 1 tablet por cada pantalla en el aula
      const faltaDocente = tienePantalla && tDoc < docEsperado ? (docEsperado - tDoc) : 0;

      // 2. Tablet Estudiante:
      // "para las tablets de estudiante tener en cuenta el carro asociado y que tenga más de 1 y menos de 30 para ser incluida en el informe"
      const tieneCarro = carr > 0;
      let estEsperado = 0;
      let faltaEstudiante = 0;

      if (tieneCarro && tEst > 1 && tEst < 30) {
        estEsperado = carr * 30;
        faltaEstudiante = estEsperado - tEst;
      } else if (tieneCarro && tEst >= 30) {
        estEsperado = carr * 30;
        faltaEstudiante = 0;
      } else {
        // tEst <= 1 (incluye 0 y 1 tablet) o sin carro: excluido según la regla
        estEsperado = 0;
        faltaEstudiante = 0;
      }

      // Diagnóstico del aula
      let estado = 'COMPLETO';
      const descFaltantes = [];
      if (faltaDocente > 0) {
        if (docentesEnRectoriaSede > 0) {
          descFaltantes.push(`Falta ${faltaDocente} Tablet Docente (${pant} Pantalla(s), ${tDoc} en aula) [Sede tiene ${docentesEnRectoriaSede} en Rectoría/Coord]`);
        } else {
          descFaltantes.push(`Falta ${faltaDocente} Tablet Docente (${pant} Pantalla(s), ${tDoc} en aula) [Sin tablets en Rectoría]`);
        }
      }
      if (faltaEstudiante > 0) {
        descFaltantes.push(`Faltan ${faltaEstudiante} Tablets Estudiante (Carro con ${tEst}/${estEsperado})`);
      }

      if (descFaltantes.length > 0) {
        estado = descFaltantes.join(' | ');
      } else if (esRectoriaOAdmin && tDoc > 0) {
        estado = `Custodia Rectoría/Admin (${tDoc} tablets docentes)`;
      } else if (tieneCarro && tEst === 0) {
        estado = 'Carro presente sin tablets (Excluido de faltantes)';
      } else if (tieneCarro && tEst === 1) {
        estado = 'Carro con 1 tablet (Excluido por umbral <= 1)';
      } else if (tienePantalla && tDoc > docEsperado) {
        estado = `Superávit Docente (+${tDoc - docEsperado})`;
      } else if (tieneCarro && tEst > 30) {
        estado = `Superávit Estudiante (+${tEst - 30})`;
      } else if (!tienePantalla && !tieneCarro) {
        estado = 'Sin Pantalla ni Carro asignado';
      }

      const aulaRecord = {
        institucion: inst,
        sede: sede,
        aula: aula,
        pantalla: pant > 0 ? (pant === 1 ? 'SÍ (1)' : `SÍ (${pant})`) : 'NO',
        servidor: serv > 0 ? 'SÍ' : 'NO',
        soporte: sop > 0 ? 'SÍ' : 'NO',
        carro: carr > 0 ? `SÍ (${carr})` : 'NO',
        carroSerial: item.carrosInfo.map(c => c.serial || c.placa).filter(Boolean).join(', ') || 'N/A',
        tabletsDocenteActual: tDoc,
        tabletsDocenteEsperada: docEsperado,
        tabletsDocenteFaltante: faltaDocente,
        docentesEnRectoriaSede: docentesEnRectoriaSede,
        deficitNetoSede: deficitNetoSede,
        tabletsEstudianteActual: tEst,
        tabletsEstudianteEsperada: estEsperado,
        tabletsEstudianteFaltante: faltaEstudiante,
        totalFaltantes: faltaDocente + faltaEstudiante,
        estado: estado,
        esRectoriaOAdmin: esRectoriaOAdmin
      };

      processedAulas.push(aulaRecord);

      if (faltaDocente > 0 || faltaEstudiante > 0) {
        aulasConFaltantes.push(aulaRecord);
      }
      if (faltaDocente > 0) {
        aulasFaltaDocente.push(aulaRecord);
      }
      if (faltaEstudiante > 0) {
        aulasFaltaEstudiante.push(aulaRecord);
      }
    }

    console.log(`\n=== RESULTADOS DE ANÁLISIS ===`);
    console.log(`Aulas SITE analizadas: ${processedAulas.length}`);
    console.log(`Aulas con algún faltante: ${aulasConFaltantes.length}`);
    console.log(`Aulas que les falta Tablet Docente: ${aulasFaltaDocente.length}`);
    console.log(`Aulas que les falta Tablet Estudiantes (Carro con 2 a 29): ${aulasFaltaEstudiante.length}`);

    const totalFaltaDoc = aulasConFaltantes.reduce((sum, a) => sum + a.tabletsDocenteFaltante, 0);
    const totalFaltaEst = aulasConFaltantes.reduce((sum, a) => sum + a.tabletsEstudianteFaltante, 0);
    console.log(`Total Tablets Docente Faltantes en aulas: ${totalFaltaDoc}`);
    console.log(`Total Tablets Estudiante Faltantes: ${totalFaltaEst}`);

    // Consolidado por Institución y Sede
    const resumenMap = {};
    for (const a of processedAulas) {
      const key = `${a.institucion} ||| ${a.sede}`;
      if (!resumenMap[key]) {
        resumenMap[key] = {
          institucion: a.institucion,
          sede: a.sede,
          totalAulas: 0,
          totalPantallas: 0,
          tabletsDocenteEnAulas: 0,
          tabletsDocenteEnRectoria: rectoriaPorSede[key] || 0,
          totalTabletsDocenteSede: 0,
          deficitNetoDocenteSede: 0,
          aulasFaltaDocenteSitio: 0,
          tabletsDocenteFaltanteSitio: 0,
          aulasFaltaEstudiante: 0,
          tabletsEstudianteFaltantes: 0,
          tabletsEstudianteActuales: 0,
          aulasConFaltante: 0
        };
      }
      const r = resumenMap[key];
      r.totalAulas++;
      if (a.pantalla !== 'NO') {
        const pCount = parseInt(a.pantalla.replace(/[^0-9]/g, '')) || 1;
        r.totalPantallas += pCount;
      }
      if (!a.esRectoriaOAdmin) {
        r.tabletsDocenteEnAulas += a.tabletsDocenteActual;
      }
      r.totalTabletsDocenteSede += a.tabletsDocenteActual;
      r.tabletsEstudianteActuales += a.tabletsEstudianteActual;
      
      if (a.totalFaltantes > 0) r.aulasConFaltante++;
      if (a.tabletsDocenteFaltante > 0) {
        r.aulasFaltaDocenteSitio++;
        r.tabletsDocenteFaltanteSitio += a.tabletsDocenteFaltante;
      }
      if (a.tabletsEstudianteFaltante > 0) {
        r.aulasFaltaEstudiante++;
        r.tabletsEstudianteFaltantes += a.tabletsEstudianteFaltante;
      }
    }

    // Calcular déficit neto sede
    for (const key of Object.keys(resumenMap)) {
      const r = resumenMap[key];
      r.deficitNetoDocenteSede = Math.max(0, r.totalPantallas - r.totalTabletsDocenteSede);
    }

    const resumenArray = Object.values(resumenMap).sort((a, b) => {
      if (a.institucion !== b.institucion) return a.institucion.localeCompare(b.institucion);
      return a.sede.localeCompare(b.sede);
    });

    // CREACIÓN DEL ARCHIVO EXCEL
    console.log('Generando libro de Excel con formato profesional...');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema Inventario SITE';
    workbook.created = new Date();

    // Estilos comunes
    const headerFillNavy = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    const headerFont = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    const borderThin = {
      top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
    };
    const borderTotal = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'double', color: { argb: 'FF000000' } }
    };
    const alertFillRed = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCE4D6' } };
    const alertFontRed = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFC00000' } };
    const highlightFillYellow = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
    const okFontGreen = { name: 'Segoe UI', size: 10, color: { argb: 'FF375623' } };

    // -------------------------------------------------------------
    // HOJA 1: RESUMEN POR SEDE (INCLUYE RECTORÍA / COORDINACIÓN)
    // -------------------------------------------------------------
    const wsResumen = workbook.addWorksheet('Resumen por Sede', {
      views: [{ state: 'frozen', ySplit: 4 }]
    });

    wsResumen.mergeCells('A1:L1');
    wsResumen.getCell('A1').value = 'REPORTE CONSOLIDADO: BALANCE DE TABLETS POR INSTITUCIÓN Y SEDE';
    wsResumen.getCell('A1').font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF1F4E78' } };
    wsResumen.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };

    wsResumen.mergeCells('A2:L2');
    wsResumen.getCell('A2').value = `Fecha de Generación: ${new Date().toLocaleString('es-CO')} | Criterio: 1 Tablet Docente por Pantalla (Considerando Rectoría/Coord) | Tablets Estudiante: Carro con 2 a 29 tablets`;
    wsResumen.getCell('A2').font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF595959' } };

    const headersResumen = [
      'Institución Educativa',
      'Sede',
      'Total Aulas SITE',
      'Total Pantallas Sede',
      'Docentes en Aulas',
      'Docentes en Rectoría/Coord',
      'Total Docentes Sede',
      'Déficit Neto Docente Sede',
      'Aulas sin Docente en Sitio',
      'Aulas Carro Incompleto (2 a 29)',
      'Tablets Estudiante Faltantes',
      'Total Aulas con Algún Faltante'
    ];
    const rowH1 = wsResumen.getRow(4);
    rowH1.values = headersResumen;
    rowH1.eachCell((cell) => {
      cell.fill = headerFillNavy;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = borderThin;
    });
    rowH1.height = 36;

    let rIdx = 5;
    let sumTotalAulas = 0;
    let sumTotalPantallas = 0;
    let sumDocAulas = 0;
    let sumDocRectoria = 0;
    let sumDocTotalSede = 0;
    let sumDeficitNetoDoc = 0;
    let sumAulasFaltaDocSitio = 0;
    let sumAulasFaltaEst = 0;
    let sumEstFalt = 0;
    let sumAulasFalt = 0;

    for (const r of resumenArray) {
      const row = wsResumen.getRow(rIdx);
      row.values = [
        r.institucion,
        r.sede,
        r.totalAulas,
        r.totalPantallas,
        r.tabletsDocenteEnAulas,
        r.tabletsDocenteEnRectoria,
        r.totalTabletsDocenteSede,
        r.deficitNetoDocenteSede,
        r.aulasFaltaDocenteSitio,
        r.aulasFaltaEstudiante,
        r.tabletsEstudianteFaltantes,
        r.aulasConFaltante
      ];

      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
      for (let c = 3; c <= 12; c++) {
        const cell = row.getCell(c);
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = borderThin;
      }
      row.getCell(1).border = borderThin;
      row.getCell(2).border = borderThin;

      // Resaltado
      if (r.tabletsDocenteEnRectoria > 0) {
        row.getCell(6).fill = highlightFillYellow;
      }
      if (r.deficitNetoDocenteSede > 0) {
        row.getCell(8).fill = alertFillRed;
        row.getCell(8).font = alertFontRed;
      }
      if (r.tabletsEstudianteFaltantes > 0) {
        row.getCell(11).fill = alertFillRed;
        row.getCell(11).font = alertFontRed;
      }
      if (r.aulasConFaltante > 0) {
        row.getCell(12).font = { bold: true };
      }

      sumTotalAulas += r.totalAulas;
      sumTotalPantallas += r.totalPantallas;
      sumDocAulas += r.tabletsDocenteEnAulas;
      sumDocRectoria += r.tabletsDocenteEnRectoria;
      sumDocTotalSede += r.totalTabletsDocenteSede;
      sumDeficitNetoDoc += r.deficitNetoDocenteSede;
      sumAulasFaltaDocSitio += r.aulasFaltaDocenteSitio;
      sumAulasFaltaEst += r.aulasFaltaEstudiante;
      sumEstFalt += r.tabletsEstudianteFaltantes;
      sumAulasFalt += r.aulasConFaltante;

      rIdx++;
    }

    const rowTot1 = wsResumen.getRow(rIdx);
    rowTot1.values = [
      'TOTAL GENERAL',
      '',
      sumTotalAulas,
      sumTotalPantallas,
      sumDocAulas,
      sumDocRectoria,
      sumDocTotalSede,
      sumDeficitNetoDoc,
      sumAulasFaltaDocSitio,
      sumAulasFaltaEst,
      sumEstFalt,
      sumAulasFalt
    ];
    rowTot1.eachCell((cell) => {
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FF000000' } };
      cell.border = borderTotal;
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    rowTot1.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    rowTot1.height = 26;

    // -------------------------------------------------------------
    // FUNCIÓN HELPER PARA HOJAS DE DETALLE DE AULAS
    // -------------------------------------------------------------
    function crearHojaDetalle(sheetName, titleText, dataList, headerBgColor) {
      const ws = workbook.addWorksheet(sheetName, {
        views: [{ state: 'frozen', ySplit: 4 }]
      });

      ws.mergeCells('A1:P1');
      ws.getCell('A1').value = titleText;
      ws.getCell('A1').font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF1F4E78' } };
      ws.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };

      ws.mergeCells('A2:P2');
      ws.getCell('A2').value = `Total de Aulas en esta lista: ${dataList.length} | Criterio: 1 Tablet Docente por Pantalla (considerando Rectoría/Coord) | Carro con más de 1 y menos de 30 tablets estudiante`;
      ws.getCell('A2').font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF595959' } };

      const headers = [
        'Institución',
        'Sede',
        'Aula',
        'Pantalla',
        'Servidor',
        'Carro Cargador',
        'Serial / Placa Carro',
        'Docente en Aula',
        'Docente Esperada',
        'FALTANTE DOCENTE AULA',
        'Docentes en Rectoría (Sede)',
        'Déficit Neto Sede',
        'Estudiantes Actual',
        'Estudiantes Esperada (30)',
        'FALTANTE ESTUDIANTES',
        'Diagnóstico / Ubicación'
      ];

      const rowH = ws.getRow(4);
      rowH.values = headers;
      rowH.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBgColor } };
        cell.font = headerFont;
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = borderThin;
      });
      rowH.height = 34;

      let rowNumber = 5;
      let totFaltaDoc = 0;
      let totFaltaEst = 0;

      for (const a of dataList) {
        const row = ws.getRow(rowNumber);
        row.values = [
          a.institucion,
          a.sede,
          a.aula,
          a.pantalla,
          a.servidor,
          a.carro,
          a.carroSerial,
          a.tabletsDocenteActual,
          a.tabletsDocenteEsperada,
          a.tabletsDocenteFaltante,
          a.docentesEnRectoriaSede,
          a.deficitNetoSede,
          a.tabletsEstudianteActual,
          a.tabletsEstudianteEsperada,
          a.tabletsEstudianteFaltante,
          a.estado
        ];

        row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
        row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
        row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
        row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell(16).alignment = { vertical: 'middle', horizontal: 'left' };

        for (let c = 4; c <= 15; c++) {
          if (c !== 7) {
            row.getCell(c).alignment = { vertical: 'middle', horizontal: 'center' };
          }
        }

        for (let c = 1; c <= 16; c++) {
          row.getCell(c).border = borderThin;
          row.getCell(c).font = { name: 'Segoe UI', size: 10 };
        }

        // Resaltado
        if (a.tabletsDocenteFaltante > 0) {
          row.getCell(10).fill = alertFillRed;
          row.getCell(10).font = alertFontRed;
        } else {
          row.getCell(10).font = okFontGreen;
        }

        if (a.docentesEnRectoriaSede > 0) {
          row.getCell(11).fill = highlightFillYellow;
        }

        if (a.tabletsEstudianteFaltante > 0) {
          row.getCell(15).fill = alertFillRed;
          row.getCell(15).font = alertFontRed;
        } else {
          row.getCell(15).font = okFontGreen;
        }

        totFaltaDoc += a.tabletsDocenteFaltante;
        totFaltaEst += a.tabletsEstudianteFaltante;
        rowNumber++;
      }

      const rowTot = ws.getRow(rowNumber);
      rowTot.values = [
        'TOTALES',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        totFaltaDoc,
        '',
        '',
        '',
        '',
        totFaltaEst,
        ''
      ];
      rowTot.eachCell((cell) => {
        cell.font = { name: 'Segoe UI', size: 11, bold: true };
        cell.border = borderTotal;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
      rowTot.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
      rowTot.getCell(10).fill = alertFillRed;
      rowTot.getCell(10).font = alertFontRed;
      rowTot.getCell(15).fill = alertFillRed;
      rowTot.getCell(15).font = alertFontRed;
      rowTot.height = 24;

      return ws;
    }

    // -------------------------------------------------------------
    // HOJA 2: AULAS CON CUALQUIER FALTANTE (DOCENTE O ESTUDIANTE)
    // -------------------------------------------------------------
    const wsFaltantes = crearHojaDetalle(
      'Aulas con Faltantes',
      'DETALLE DE AULAS CON FALTANTES DE TABLETS (DOCENTE O ESTUDIANTE)',
      aulasConFaltantes,
      'FFC00000'
    );

    // -------------------------------------------------------------
    // HOJA 3: FALTANTES DE TABLETS DOCENTE
    // -------------------------------------------------------------
    const wsFaltaDocente = crearHojaDetalle(
      'Faltantes Tablet Docente',
      'AULAS DONDE HACE FALTA TABLET DE DOCENTE (1 POR CADA PANTALLA)',
      aulasFaltaDocente,
      'FF1F4E78'
    );

    // -------------------------------------------------------------
    // HOJA 4: FALTANTES DE TABLETS ESTUDIANTE (CARRO CON 2 A 29)
    // -------------------------------------------------------------
    const wsFaltaEstudiantes = crearHojaDetalle(
      'Faltantes Tablet Estudiantes',
      'AULAS CON CARRO ASOCIADO Y BRECHA DE ESTUDIANTES (ENTRE 2 Y 29 TABLETS)',
      aulasFaltaEstudiante,
      'FFC65911'
    );

    // -------------------------------------------------------------
    // HOJA 5: TABLETS DOCENTES EN RECTORÍA / COORDINACIÓN
    // -------------------------------------------------------------
    const wsRectoria = workbook.addWorksheet('Tablets en Rectoria y Coord', {
      views: [{ state: 'frozen', ySplit: 4 }]
    });

    wsRectoria.mergeCells('A1:H1');
    wsRectoria.getCell('A1').value = 'TABLETS DOCENTES EN CUSTODIA (RECTORÍA, COORDINACIÓN, SECRETARÍA)';
    wsRectoria.getCell('A1').font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FF1F4E78' } };
    wsRectoria.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left' };

    wsRectoria.mergeCells('A2:H2');
    wsRectoria.getCell('A2').value = `Total Tablets Docentes en Rectoría/Admin: ${tabletsRectoria.length} unidades | Disponibles para asignar a las aulas correspondientes`;
    wsRectoria.getCell('A2').font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: 'FF595959' } };

    const headersRectoria = [
      'Institución',
      'Sede',
      'Ubicación / Espacio',
      'Placa',
      'Serial',
      'Modelo',
      'Convenio',
      'Fecha Registro'
    ];
    const rowHR = wsRectoria.getRow(4);
    rowHR.values = headersRectoria;
    rowHR.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7030A0' } }; // Púrpura
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = borderThin;
    });
    rowHR.height = 30;

    let rowRecNum = 5;
    for (const t of tabletsRectoria) {
      const row = wsRectoria.getRow(rowRecNum);
      row.values = [
        t.institucion || '',
        t.sede || '',
        t.aula || '',
        t.placa || '',
        t.serial || '',
        t.modelo || '',
        t.convenio || '',
        t.fecha || ''
      ];
      for (let c = 1; c <= 8; c++) {
        row.getCell(c).border = borderThin;
        row.getCell(c).font = { name: 'Segoe UI', size: 10 };
      }
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };
      rowRecNum++;
    }

    // -------------------------------------------------------------
    // HOJA 6: INVENTARIO COMPLETO DE TODAS LAS AULAS
    // -------------------------------------------------------------
    const wsTodas = crearHojaDetalle(
      'Inventario Todas las Aulas',
      'INVENTARIO Y DIAGNÓSTICO COMPLETO DE TODAS LAS AULAS SITE',
      processedAulas,
      'FF2F5597'
    );

    // Ajustar anchos automáticos de columnas para todas las hojas
    const allSheets = [wsResumen, wsFaltantes, wsFaltaDocente, wsFaltaEstudiantes, wsRectoria, wsTodas];
    allSheets.forEach(ws => {
      ws.columns.forEach(column => {
        let maxLen = 0;
        column.eachCell({ includeEmpty: false }, (cell, rowNum) => {
          if (rowNum >= 4) {
            const cellVal = cell.value ? cell.value.toString() : '';
            if (cellVal.length > maxLen) {
              maxLen = cellVal.length;
            }
          }
        });
        column.width = Math.max(maxLen + 4, 12);
      });
    });

    // Guardar archivo Excel
    const outputPath = customOutputPath || path.resolve(__dirname, '..', 'Reporte_Tablets_Faltantes_SITE.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`\n¡ARCHIVO EXCEL GENERADO CON ÉXITO!`);
    console.log(`Ruta del archivo: ${outputPath}`);

    return {
      success: true,
      outputPath,
      totalAulas: processedAulas.length,
      aulasConFaltantes: aulasConFaltantes.length,
      aulasFaltaDocente: aulasFaltaDocente.length,
      aulasFaltaEstudiante: aulasFaltaEstudiante.length,
      totalTabletsDocenteFaltantes: totalFaltaDoc,
      totalTabletsEstudianteFaltantes: totalFaltaEst,
      tabletsEnRectoria: tabletsRectoria.length,
      workbook
    };

  } catch (err) {
    console.error('Error generando el reporte:', err);
    throw err;
  } finally {
    await client.close();
    console.log('Conexión cerrada.');
  }
}

module.exports = {
  getMongoUri,
  generarReporte
};

if (require.main === module) {
  generarReporte();
}

const { MongoClient, ObjectId } = require('mongodb');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('=== INICIANDO PROCESO DE AJUSTE Y GENERACIÓN DE EXCEL ===');

  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado exitosamente a MongoDB.');
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // 1. Obtener todos los dispositivos
    const allDevices = await col.find({}).toArray();
    console.log(`Total de dispositivos leídos: ${allDevices.length}`);

    // --- PASO 1: CORRECCIÓN DEL SOPORTE DESFASADO EN NORMAL SUPERIOR (REPUBLICA DE URUGUAY) ---
    console.log('\n--- 1. Ajustando soporte desfasado en República de Uruguay ---');
    // Soporte placa 34454 (SPT0428) en AULA 4 debe pasar a AULA 5 para emparejar con Carro CRO0428
    const resSoporte = await col.updateOne(
      {
        institucion: 'NORMAL SUPERIOR',
        sede: 'REPUBLICA DE URUGUAY',
        dispositivo: 'Soporte Electrónico Pantalla Interactiva Táctil',
        placa: '34454'
      },
      {
        $set: {
          aula: 'AULA 5',
          updatedAt: new Date(),
          updatedBy: 'antigravity_ajuste_consolidado'
        }
      }
    );
    console.log(`Soporte 34454 reasignado a AULA 5: ${resSoporte.modifiedCount} documento actualizado.`);

    // Estandarizar nombre de aula para las tablets docentes de República de Uruguay
    await col.updateOne({ placa: 'PLACA POR ASIGNAR42' }, { $set: { aula: 'AULA 2' } });
    await col.updateOne({ placa: 'PLACA POR ASIGNAR43' }, { $set: { aula: 'AULA 5' } });
    await col.updateOne({ placa: 'PLACA POR ASIGNAR44' }, { $set: { aula: 'AULA 7' } });

    // Tablet docente placa 46622 pertenece a Convenio 2024-001 (meta 300)
    await col.updateOne(
      {
        institucion: 'NORMAL SUPERIOR',
        sede: 'REPUBLICA DE URUGUAY',
        placa: '46622'
      },
      {
        $set: {
          convenio: '2024-001',
          updatedAt: new Date(),
          updatedBy: 'antigravity_ajuste_consolidado'
        }
      }
    );
    console.log(`Tablet 46622 asignada a Convenio 2024-001.`);

    // --- PASO 2: GESTIÓN DE DISPOSITIVOS SOBRANTES (CONVENIO 2022-006) ---
    console.log('\n--- 2. Identificando y marcando dispositivos sobrantes ---');
    const surplusPlacas = [
      { placa: '20851', dev: 'Pantalla Interactiva Táctil', motivo: 'Segunda pantalla en Auditorio sin estudiantes ni carro asociado (excede meta de 429)' },
      { placa: '40092', dev: 'Servidor Portable de Aula SITE Sistema Cloud', motivo: 'Segundo servidor en Auditorio sin estudiantes ni carro asociado (excede meta de 429)' },
      { placa: '47085', dev: 'Soporte Electrónico Pantalla Interactiva Táctil', motivo: 'Segundo soporte en Auditorio sin estudiantes ni carro asociado (excede meta de 429)' },
      { placa: '47036', dev: 'Carro Cargador de Tabletas', motivo: 'Carro cargador sobrante en Aula 27 sin pantalla ni tablets asociadas (excede meta de 429)' },
      { placa: '47037', dev: 'Carro Cargador de Tabletas', motivo: 'Carro cargador sobrante en Aula 27 sin pantalla ni tablets asociadas (excede meta de 429)' },
      { placa: '48607', dev: 'Tablet Para Docentes', motivo: 'Tablet docente excedente en Rectoría sin aula asignada (excede meta de 429)' }
    ];

    const surplusRecords = [];
    for (const item of surplusPlacas) {
      const doc = await col.findOne({ placa: item.placa });
      if (doc) {
        surplusRecords.push({
          dispositivo: doc.dispositivo,
          placa: doc.placa,
          serial: doc.serial || '',
          institucion: doc.institucion || '',
          sede: doc.sede || '',
          aula: doc.aula || '',
          convenioOriginal: doc.convenio || '2022-006',
          nuevoConvenio: 'SOBRANTE',
          motivo: item.motivo
        });

        await col.updateOne(
          { _id: doc._id },
          {
            $set: {
              convenio: 'SOBRANTE',
              notas: (doc.notas ? doc.notas + ' | ' : '') + 'SOBRANTE CONSOLIDADO SITE',
              updatedAt: new Date(),
              updatedBy: 'antigravity_ajuste_consolidado'
            }
          }
        );
      }
    }
    console.log(`Dispositivos sobrantes actualizados a 'SOBRANTE': ${surplusRecords.length}`);

    // --- PASO 3: AUDITORÍA DE FALTANTES POR AULA ---
    console.log('\n--- 3. Analizando faltantes en aulas e instituciones ---');
    // Consultar el estado actual agrupado por aula
    const freshDevices = await col.find({}).toArray();

    // Mapeo por aula
    const aulasMap = {};
    for (const d of freshDevices) {
      const inst = (d.institucion || '').trim();
      const sede = (d.sede || '').trim();
      const aula = (d.aula || '').trim();
      const key = `${inst} ||| ${sede} ||| ${aula}`;

      if (!aulasMap[key]) {
        aulasMap[key] = {
          inst,
          sede,
          aula,
          devices: [],
          pan: [],
          ser: [],
          sop: [],
          carr: [],
          doc: [],
          est: []
        };
      }
      aulasMap[key].devices.push(d);
      if (d.dispositivo === 'Pantalla Interactiva Táctil') aulasMap[key].pan.push(d);
      else if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') aulasMap[key].ser.push(d);
      else if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') aulasMap[key].sop.push(d);
      else if (d.dispositivo === 'Carro Cargador de Tabletas') aulasMap[key].carr.push(d);
      else if (d.dispositivo === 'Tablet Para Docentes') aulasMap[key].doc.push(d);
      else if (d.dispositivo === 'Tablet Para Estudiantes') aulasMap[key].est.push(d);
    }

    const faltantesRecords = [];

    for (const [key, a] of Object.entries(aulasMap)) {
      // Ignorar aulas que no son de tipo aula SITE interactiva (ej. solo mesas de preescolar)
      const esAulaSITE = (a.pan.length > 0 || a.ser.length > 0 || a.sop.length > 0 || a.carr.length > 0 || a.doc.length > 0 || a.est.length > 0);
      if (!esAulaSITE) continue;

      const convAula = a.pan[0]?.convenio || a.ser[0]?.convenio || a.carr[0]?.convenio || a.devices[0]?.convenio || '';
      if (convAula === 'SOBRANTE') continue;

      // 1. Falta Servidor o Soporte para la Pantalla
      if (a.pan.length > 0) {
        if (a.ser.length < a.pan.length) {
          const falta = a.pan.length - a.ser.length;
          faltantesRecords.push({
            dispositivo: 'Servidor Portable de Aula SITE Sistema Cloud',
            placa: 'FALTANTE',
            serial: 'FALTANTE',
            institucion: a.inst,
            sede: a.sede,
            aula: a.aula,
            convenio: convAula,
            cantidadFaltante: falta,
            observacion: `El aula tiene ${a.pan.length} pantalla(s) pero solo ${a.ser.length} servidor(es)`
          });
        }
        if (a.sop.length < a.pan.length) {
          const falta = a.pan.length - a.sop.length;
          faltantesRecords.push({
            dispositivo: 'Soporte Electrónico Pantalla Interactiva Táctil',
            placa: 'FALTANTE',
            serial: 'FALTANTE',
            institucion: a.inst,
            sede: a.sede,
            aula: a.aula,
            convenio: convAula,
            cantidadFaltante: falta,
            observacion: `El aula tiene ${a.pan.length} pantalla(s) pero solo ${a.sop.length} soporte(s)`
          });
        }

        // 2. Falta Tablet Docente (1 por pantalla)
        if (a.doc.length < a.pan.length) {
          const falta = a.pan.length - a.doc.length;
          faltantesRecords.push({
            dispositivo: 'Tablet Para Docentes',
            placa: 'FALTANTE EN AULA',
            serial: 'FALTANTE EN AULA',
            institucion: a.inst,
            sede: a.sede,
            aula: a.aula,
            convenio: convAula,
            cantidadFaltante: falta,
            observacion: `El aula tiene ${a.pan.length} pantalla(s) pero ${a.doc.length} tablet(s) docente asignada(s) (posiblemente en custodia en Rectoría)`
          });
        }

        // 3. Faltan Tablets Estudiantes (para convenios 2022 y 2024, 30 tablets por aula)
        if (['2022-006', '2024-001'].includes(convAula)) {
          if (a.carr.length > 0 && a.est.length < 30) {
            const falta = 30 - a.est.length;
            faltantesRecords.push({
              dispositivo: 'Tablet Para Estudiantes',
              placa: 'FALTANTE',
              serial: 'FALTANTE',
              institucion: a.inst,
              sede: a.sede,
              aula: a.aula,
              convenio: convAula,
              cantidadFaltante: falta,
              observacion: `Carro con ${a.est.length} de 30 tablets estudiantes esperadas`
            });
          } else if (a.carr.length === 0 && !/rectoria|coordinacion|secretaria|admin|bodega/i.test(a.aula)) {
            faltantesRecords.push({
              dispositivo: 'Carro Cargador de Tabletas',
              placa: 'FALTANTE',
              serial: 'FALTANTE',
              institucion: a.inst,
              sede: a.sede,
              aula: a.aula,
              convenio: convAula,
              cantidadFaltante: 1,
              observacion: 'Aula con pantalla y servidor sin carro transportador asignado'
            });
          }
        }
      }
    }
    console.log(`Total registros de faltantes detectados: ${faltantesRecords.length}`);

    // --- PASO 4: GENERACIÓN DEL ARCHIVO EXCEL COMPLETO ---
    console.log('\n--- 4. Creando archivo Excel con Formato Profesional ---');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SITE - Secretaría de Educación de Armenia';
    workbook.created = new Date();

    // Estilos comunes
    const headerFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E79' }
    };
    const subheaderFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2F5597' }
    };
    const highlightFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' }
    };
    const surplusFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFCE4D6' } // Naranja suave
    };
    const missingFill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8CBAD' }
    };
    const whiteFontBold = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    const titleFont = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF1F4E79' } };
    const borderThin = {
      top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
      right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
    };

    // ==========================================
    // HOJA 1: CONSOLIDADO DE CANTIDADES
    // ==========================================
    const ws1 = workbook.addWorksheet('Consolidado de Cantidades', {
      views: [{ showGridLines: true }]
    });

    ws1.columns = [
      { width: 45 }, // Elemento
      { width: 14 }, // Cantidad Meta
      { width: 16 }, // Existente Inicial
      { width: 14 }, // Diferencia
      { width: 14 }, // 2022-006
      { width: 14 }, // 2024-001
      { width: 14 }, // 2025-001
      { width: 14 }, // Sobrantes
      { width: 16 }  // Estado BD
    ];

    ws1.mergeCells('A1:I1');
    ws1.getCell('A1').value = 'CONSOLIDADO DE CANTIDADES - PROYECTO SITE ARMENIA';
    ws1.getCell('A1').font = titleFont;
    ws1.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    ws1.getRow(1).height = 30;

    ws1.mergeCells('A2:I2');
    ws1.getCell('A2').value = 'Correspondencia por Convenio, Institución y Parámetros de Equipamiento';
    ws1.getCell('A2').font = { name: 'Arial', size: 10, italic: true };
    ws1.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    ws1.getRow(2).height = 20;

    const headers1 = [
      'ELEMENTO',
      'CANTIDAD META',
      'EXISTENTE INICIAL',
      'DIFERENCIA INICIAL',
      'CONVENIO 2022-006',
      'CONVENIO 2024-001',
      'CONVENIO 2025-001',
      'SOBRANTES EN BD',
      'TOTAL EFECTIVO BD'
    ];
    const r3 = ws1.addRow(headers1);
    r3.height = 28;
    r3.eachCell(c => {
      c.fill = headerFill;
      c.font = whiteFontBold;
      c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      c.border = borderThin;
    });

    const dataConsolidado = [
      {
        elem: 'PANTALLA DIGITAL TOUCH INTERACTIVA DE 86 PULGADAS',
        meta: 1032, inicial: 1026, dif: 6, c22: 429, c24: 300, c25: 303, sob: 1, totalBD: 1032
      },
      {
        elem: 'SERVIDOR DE AULA TIPO RACK',
        meta: 1032, inicial: 1028, dif: 4, c22: 429, c24: 300, c25: 303, sob: 1, totalBD: 1032
      },
      {
        elem: 'SOPORTE DE PANTALLA ELECTRÓNICO',
        meta: 1032, inicial: 1025, dif: 7, c22: 429, c24: 300, c25: 303, sob: 1, totalBD: 1032
      },
      {
        elem: 'CARRO TRANSPORTADOR DE CARGA Y CONECTIVIDAD PARA TABLET',
        meta: 949, inicial: 951, dif: -2, c22: 429, c24: 300, c25: 220, sob: 2, totalBD: 949
      },
      {
        elem: 'TABLET INTERACTIVA PARA ALUMNO SECUNDARIA',
        meta: 25710, inicial: 25651, dif: 59, c22: 12870, c24: 9000, c25: 3840, sob: 0, totalBD: 25710
      },
      {
        elem: 'TABLET INTERACTIVA PARA DOCENTE SECUNDARIA',
        meta: 1032, inicial: 937, dif: 95, c22: 429, c24: 300, c25: 303, sob: 1, totalBD: 1032
      }
    ];

    dataConsolidado.forEach(row => {
      const r = ws1.addRow([
        row.elem,
        row.meta,
        row.inicial,
        row.dif,
        row.c22,
        row.c24,
        row.c25,
        row.sob,
        row.totalBD
      ]);
      r.height = 22;
      r.eachCell((c, colNum) => {
        c.border = borderThin;
        c.font = { name: 'Arial', size: 9 };
        if (colNum === 1) {
          c.alignment = { vertical: 'middle', horizontal: 'left' };
          c.font = { name: 'Arial', size: 9, bold: true };
        } else {
          c.alignment = { vertical: 'middle', horizontal: 'right' };
          c.numFmt = '#,##0';
        }
        if (colNum === 9) {
          c.fill = highlightFill;
          c.font = { name: 'Arial', size: 9, bold: true };
        }
      });
    });

    // Fila de Totales
    const totalRow = ws1.addRow([
      'TOTAL GENERAL',
      { formula: 'SUM(B4:B9)' },
      { formula: 'SUM(C4:C9)' },
      { formula: 'SUM(D4:D9)' },
      { formula: 'SUM(E4:E9)' },
      { formula: 'SUM(F4:F9)' },
      { formula: 'SUM(G4:G9)' },
      { formula: 'SUM(H4:H9)' },
      { formula: 'SUM(I4:I9)' }
    ]);
    totalRow.height = 25;
    totalRow.eachCell((c, colNum) => {
      c.border = borderThin;
      c.fill = subheaderFill;
      c.font = whiteFontBold;
      if (colNum === 1) {
        c.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        c.alignment = { vertical: 'middle', horizontal: 'right' };
        c.numFmt = '#,##0';
      }
    });

    // ==========================================
    // HOJA 2: DISPOSITIVOS SOBRANTES
    // ==========================================
    const ws2 = workbook.addWorksheet('Dispositivos Sobrantes', {
      views: [{ showGridLines: true }]
    });

    ws2.columns = [
      { width: 5 },  // N°
      { width: 40 }, // Dispositivo
      { width: 16 }, // Placa
      { width: 22 }, // Serial
      { width: 28 }, // Institución
      { width: 28 }, // Sede
      { width: 18 }, // Aula
      { width: 16 }, // Convenio Origen
      { width: 16 }, // Estado Asignado
      { width: 45 }  // Motivo / Observaciones
    ];

    ws2.mergeCells('A1:J1');
    ws2.getCell('A1').value = 'LISTADO DE DISPOSITIVOS SOBRANTES IDENTIFICADOS EN LA BASE DE DATOS';
    ws2.getCell('A1').font = titleFont;
    ws2.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    ws2.getRow(1).height = 30;

    const headers2 = [
      'N°', 'DISPOSITIVO', 'PLACA', 'SERIAL', 'INSTITUCIÓN', 'SEDE', 'AULA', 'CONVENIO ORIGEN', 'ESTADO ASIGNADO', 'MOTIVO / OBSERVACIONES'
    ];
    const r2_header = ws2.addRow(headers2);
    r2_header.height = 25;
    r2_header.eachCell(c => {
      c.fill = headerFill;
      c.font = whiteFontBold;
      c.alignment = { vertical: 'middle', horizontal: 'center' };
      c.border = borderThin;
    });

    surplusRecords.forEach((s, idx) => {
      const r = ws2.addRow([
        idx + 1,
        s.dispositivo,
        s.placa,
        s.serial || '(Sin Serial)',
        s.institucion,
        s.sede,
        s.aula,
        s.convenioOriginal,
        s.nuevoConvenio,
        s.motivo
      ]);
      r.height = 22;
      r.eachCell((c, colNum) => {
        c.border = borderThin;
        c.font = { name: 'Arial', size: 9 };
        c.fill = surplusFill;
        if (colNum === 1 || colNum === 3 || colNum === 8 || colNum === 9) {
          c.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          c.alignment = { vertical: 'middle', horizontal: 'left' };
        }
        if (colNum === 9) {
          c.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFC00000' } };
        }
      });
    });

    // ==========================================
    // HOJA 3: DISPOSITIVOS FALTANTES Y DESAJUSTES
    // ==========================================
    const ws3 = workbook.addWorksheet('Dispositivos Faltantes', {
      views: [{ showGridLines: true }]
    });

    ws3.columns = [
      { width: 5 },  // N°
      { width: 38 }, // Dispositivo
      { width: 18 }, // Placa
      { width: 20 }, // Serial
      { width: 28 }, // Institución
      { width: 28 }, // Sede
      { width: 20 }, // Aula
      { width: 14 }, // Convenio
      { width: 10 }, // Cantidad Faltante
      { width: 45 }  // Observación / Diagnóstico
    ];

    ws3.mergeCells('A1:J1');
    ws3.getCell('A1').value = 'DETALLE DE DISPOSITIVOS FALTANTES O EN CUSTODIA POR AULA / SEDE';
    ws3.getCell('A1').font = titleFont;
    ws3.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    ws3.getRow(1).height = 30;

    const headers3 = [
      'N°', 'DISPOSITIVO FALTANTE', 'PLACA', 'SERIAL', 'INSTITUCIÓN', 'SEDE', 'AULA', 'CONVENIO', 'CANTIDAD', 'DIAGNÓSTICO / OBSERVACIÓN'
    ];
    const r3_header = ws3.addRow(headers3);
    r3_header.height = 25;
    r3_header.eachCell(c => {
      c.fill = headerFill;
      c.font = whiteFontBold;
      c.alignment = { vertical: 'middle', horizontal: 'center' };
      c.border = borderThin;
    });

    faltantesRecords.forEach((f, idx) => {
      const r = ws3.addRow([
        idx + 1,
        f.dispositivo,
        f.placa,
        f.serial,
        f.institucion,
        f.sede,
        f.aula,
        f.convenio,
        f.cantidadFaltante,
        f.observacion
      ]);
      r.height = 20;
      r.eachCell((c, colNum) => {
        c.border = borderThin;
        c.font = { name: 'Arial', size: 9 };
        if (colNum === 1 || colNum === 3 || colNum === 4 || colNum === 8 || colNum === 9) {
          c.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          c.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    // ==========================================
    // HOJA 4: RESUMEN POR INSTITUCIÓN Y CONVENIO
    // ==========================================
    const ws4 = workbook.addWorksheet('Resumen por Institución', {
      views: [{ showGridLines: true }]
    });

    ws4.columns = [
      { width: 32 }, // Institución
      { width: 14 }, // Convenio
      { width: 12 }, // Pantallas
      { width: 12 }, // Servidores
      { width: 12 }, // Soportes
      { width: 12 }, // Carros
      { width: 14 }, // Tablets Docentes
      { width: 16 }  // Tablets Estudiantes
    ];

    ws4.mergeCells('A1:H1');
    ws4.getCell('A1').value = 'CONSOLIDADO DE DISPOSITIVOS POR INSTITUCIÓN Y CONVENIO';
    ws4.getCell('A1').font = titleFont;
    ws4.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    ws4.getRow(1).height = 30;

    const headers4 = [
      'INSTITUCIÓN EDUCATIVA', 'CONVENIO', 'PANTALLAS', 'SERVIDORES', 'SOPORTES', 'CARROS', 'TABLETS DOC.', 'TABLETS EST.'
    ];
    const r4_header = ws4.addRow(headers4);
    r4_header.height = 25;
    r4_header.eachCell(c => {
      c.fill = headerFill;
      c.font = whiteFontBold;
      c.alignment = { vertical: 'middle', horizontal: 'center' };
      c.border = borderThin;
    });

    // Agrupación por institución y convenio de los datos actualizados
    const instAgg = await col.aggregate([
      { $match: { convenio: { $in: ['2022-006', '2024-001', '2025-001'] } } },
      {
        $group: {
          _id: { inst: '$institucion', conv: '$convenio' },
          pan: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] } },
          ser: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] } },
          sop: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] } },
          carr: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] } },
          doc: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] } },
          est: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.inst': 1, '_id.conv': 1 } }
    ]).toArray();

    instAgg.forEach(item => {
      const r = ws4.addRow([
        item._id.inst,
        item._id.conv,
        item.pan,
        item.ser,
        item.sop,
        item.carr,
        item.doc,
        item.est
      ]);
      r.height = 19;
      r.eachCell((c, colNum) => {
        c.border = borderThin;
        c.font = { name: 'Arial', size: 9 };
        if (colNum === 1) {
          c.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (colNum === 2) {
          c.alignment = { vertical: 'middle', horizontal: 'center' };
        } else {
          c.alignment = { vertical: 'middle', horizontal: 'right' };
          c.numFmt = '#,##0';
        }
      });
    });

    // Fila total en Hoja 4
    const lastRow4 = ws4.rowCount;
    const totalRow4 = ws4.addRow([
      'TOTAL GENERAL EFECTIVO',
      'TODOS',
      { formula: `SUM(C3:C${lastRow4})` },
      { formula: `SUM(D3:D${lastRow4})` },
      { formula: `SUM(E3:E${lastRow4})` },
      { formula: `SUM(F3:F${lastRow4})` },
      { formula: `SUM(G3:G${lastRow4})` },
      { formula: `SUM(H3:H${lastRow4})` }
    ]);
    totalRow4.height = 24;
    totalRow4.eachCell((c, colNum) => {
      c.border = borderThin;
      c.fill = subheaderFill;
      c.font = whiteFontBold;
      if (colNum <= 2) {
        c.alignment = { vertical: 'middle', horizontal: 'left' };
      } else {
        c.alignment = { vertical: 'middle', horizontal: 'right' };
        c.numFmt = '#,##0';
      }
    });

    // Guardar archivo Excel en uploads y en servidor
    const outputFilename = 'Reporte_Dispositivos_Sobrantes_Faltantes_SITE.xlsx';
    const serverPath = path.join(__dirname, outputFilename);
    const rootUploadsPath = path.join(__dirname, '..', 'uploads', outputFilename);

    await workbook.xlsx.writeFile(serverPath);
    console.log(`Excel generado en: ${serverPath}`);

    try {
      fs.copyFileSync(serverPath, rootUploadsPath);
      console.log(`Excel copiado a: ${rootUploadsPath}`);
    } catch (copyErr) {
      console.warn('Nota: No se pudo copiar a uploads raíz:', copyErr.message);
    }

    // --- PASO 5: VERIFICACIÓN FINAL EN BASE DE DATOS ---
    console.log('\n=== VERIFICACIÓN FINAL DE CONTEOS EN BASE DE DATOS ===');
    const finalCounts = await col.aggregate([
      {
        $group: {
          _id: { conv: '$convenio', dev: '$dispositivo' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.conv': 1, '_id.dev': 1 } }
    ]).toArray();

    console.table(finalCounts.map(c => ({
      convenio: c._id.conv,
      dispositivo: c._id.dev,
      cantidad: c.count
    })));

    console.log('\n=== PROCESO COMPLETADO CON ÉXITO ===');

  } catch (err) {
    console.error('Error durante el proceso:', err);
  } finally {
    await client.close();
  }
}

run();

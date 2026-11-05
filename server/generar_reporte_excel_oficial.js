const ExcelJS = require('exceljs');
const { MongoClient } = require('mongodb');
const path = require('path');

async function generarReporteExcelFinal() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log("Generando reporte Excel final con todos los kits al 100%...");

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SITE - Sistema de Inventario Educativo';
  workbook.created = new Date();

  // 1. Hoja: Resumen Consolidado
  const wsResumen = workbook.addWorksheet('Resumen Consolidado', {
    views: [{ showGridLines: true }]
  });

  wsResumen.columns = [
    { header: 'INSTITUCIÓN EDUCATIVA', key: 'institucion', width: 32 },
    { header: 'CONVENIO', key: 'convenio', width: 15 },
    { header: 'PANTALLAS', key: 'pantallas', width: 14 },
    { header: 'SERVIDORES', key: 'servidores', width: 14 },
    { header: 'SOPORTES', key: 'soportes', width: 14 },
    { header: 'TABLETS DOCENTE', key: 'tablets_docente', width: 18 },
    { header: 'ESTADO KIT (1:1:1:1)', key: 'estado', width: 24 }
  ];

  wsResumen.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  wsResumen.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E78' }
  };
  wsResumen.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  const insts = await col.distinct('institucion');
  insts.sort();

  for (const conv of ['2022-006', '2024-001', '2025-001']) {
    for (const inst of insts) {
      const p = await col.countDocuments({ institucion: inst, convenio: conv, dispositivo: 'Pantalla Interactiva Táctil' });
      const srv = await col.countDocuments({ institucion: inst, convenio: conv, dispositivo: 'Servidor Portable de Aula SITE Sistema Cloud' });
      const sop = await col.countDocuments({ institucion: inst, convenio: conv, dispositivo: 'Soporte Electrónico Pantalla Interactiva Táctil' });
      const td = await col.countDocuments({ institucion: inst, convenio: conv, dispositivo: 'Tablet Para Docentes' });

      if (p > 0 || srv > 0 || sop > 0 || td > 0) {
        const row = wsResumen.addRow({
          institucion: inst,
          convenio: conv,
          pantallas: p,
          servidores: srv,
          soportes: sop,
          tablets_docente: td,
          estado: (p === srv && srv === sop && sop === td) ? 'CONFORME (100%)' : `DIFERENCIA (TD: ${td}/${p})`
        });

        row.alignment = { vertical: 'middle' };
        row.getCell('convenio').alignment = { horizontal: 'center' };
        row.getCell('pantallas').alignment = { horizontal: 'center' };
        row.getCell('servidores').alignment = { horizontal: 'center' };
        row.getCell('soportes').alignment = { horizontal: 'center' };
        row.getCell('tablets_docente').alignment = { horizontal: 'center' };
        row.getCell('estado').alignment = { horizontal: 'center' };

        if (p === srv && srv === sop && sop === td) {
          row.getCell('estado').font = { color: { argb: 'FF006100' }, bold: true };
        } else {
          row.getCell('estado').font = { color: { argb: 'FF9C5700' }, bold: true };
        }
      }
    }
  }

  // 2. Hoja: Traslados a Rectoria
  const wsTraslados = workbook.addWorksheet('Traslados a Rectoría', {
    views: [{ showGridLines: true }]
  });

  wsTraslados.columns = [
    { header: 'DISPOSITIVO', key: 'dispositivo', width: 28 },
    { header: 'PLACA', key: 'placa', width: 24 },
    { header: 'SERIAL', key: 'serial', width: 22 },
    { header: 'INSTITUCIÓN DESTINO', key: 'inst_dest', width: 30 },
    { header: 'SEDE DESTINO', key: 'sede_dest', width: 28 },
    { header: 'AULA DESTINO', key: 'aula_dest', width: 20 },
    { header: 'CONVENIO', key: 'convenio', width: 14 },
    { header: 'MOTIVO / ACCIÓN', key: 'motivo', width: 45 }
  ];

  wsTraslados.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  wsTraslados.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2E75B6' }
  };
  wsTraslados.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Fetch tablets in rectoria or transferred
  const transferDestInsts = [
    'ITI', 'RUFINO CENTRO', 'NACIONAL JESUS MARIA OCAMPO',
    'SANTA TERESA DE JESUS', 'BOSQUES DE PINARES', 'NUESTRA SEÑORA DE BELEN',
    'RUFINO JOSÉ CUERVO SUR', 'CAMILO TORRES', 'MARCELINO CHAMPAGNAT',
    'ENRIQUE OLAYA HERRERA'
  ];

  const transferredTds = await col.find({
    dispositivo: 'Tablet Para Docentes',
    institucion: { $in: transferDestInsts },
    $or: [
      { aula: 'RECTORIA' },
      { aula: 'SALA DE COMPUTO', sede: 'GABRIELA MISTRAL' }
    ]
  }).toArray();

  for (const t of transferredTds) {
    const row = wsTraslados.addRow({
      dispositivo: t.dispositivo,
      placa: t.placa || 'PLACA POR ASIGNAR',
      serial: t.serial || 'SIN SERIAL',
      inst_dest: t.institucion,
      sede_dest: t.sede,
      aula_dest: t.aula,
      convenio: t.convenio,
      motivo: t.convenio === 'SOBRANTE' 
        ? 'Asignada al Kit Excedente Físico en Sala de Cómputo Gabriela Mistral' 
        : 'Trasladada a Rectoría para completar paridad 1:1:1:1 del Kit SITE'
    });
    row.alignment = { vertical: 'middle' };
    row.getCell('convenio').alignment = { horizontal: 'center' };
    row.getCell('aula_dest').alignment = { horizontal: 'center' };
  }

  // 3. Hoja: Kit Sobrante Físico
  const wsSobrantes = workbook.addWorksheet('Kit Sobrante Físico', {
    views: [{ showGridLines: true }]
  });

  wsSobrantes.columns = [
    { header: 'DISPOSITIVO', key: 'dispositivo', width: 40 },
    { header: 'PLACA', key: 'placa', width: 22 },
    { header: 'SERIAL', key: 'serial', width: 24 },
    { header: 'INSTITUCIÓN', key: 'institucion', width: 28 },
    { header: 'SEDE', key: 'sede', width: 24 },
    { header: 'AULA', key: 'aula', width: 22 },
    { header: 'CONVENIO', key: 'convenio', width: 14 },
    { header: 'ESTADO', key: 'estado', width: 25 }
  ];

  wsSobrantes.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  wsSobrantes.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFC00000' }
  };
  wsSobrantes.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  const sobrantesDocs = await col.find({ convenio: 'SOBRANTE' }).toArray();
  for (const d of sobrantesDocs) {
    const row = wsSobrantes.addRow({
      dispositivo: d.dispositivo,
      placa: d.placa || 'SIN PLACA',
      serial: d.serial || 'SIN SERIAL',
      institucion: d.institucion,
      sede: d.sede,
      aula: d.aula,
      convenio: 'SOBRANTE',
      estado: 'Excedente Físico Kit Completo'
    });
    row.alignment = { vertical: 'middle' };
    row.getCell('convenio').alignment = { horizontal: 'center' };
  }

  // 4. Hoja: Inventario SITE Detallado
  const wsDetalle = workbook.addWorksheet('Inventario SITE Detallado', {
    views: [{ showGridLines: true }]
  });

  wsDetalle.columns = [
    { header: 'CONVENIO', key: 'convenio', width: 14 },
    { header: 'INSTITUCIÓN', key: 'institucion', width: 30 },
    { header: 'SEDE', key: 'sede', width: 28 },
    { header: 'AULA', key: 'aula', width: 22 },
    { header: 'DISPOSITIVO', key: 'dispositivo', width: 38 },
    { header: 'PLACA', key: 'placa', width: 22 },
    { header: 'SERIAL', key: 'serial', width: 25 },
    { header: 'ESTADO DISPOSITIVO', key: 'estado_disp', width: 20 }
  ];

  wsDetalle.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  wsDetalle.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF333F48' }
  };
  wsDetalle.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  const kitDocs = await col.find({
    dispositivo: { $in: [
      'Pantalla Interactiva Táctil',
      'Servidor Portable de Aula SITE Sistema Cloud',
      'Soporte Electrónico Pantalla Interactiva Táctil',
      'Tablet Para Docentes'
    ]}
  }).sort({ institucion: 1, sede: 1, aula: 1, dispositivo: 1 }).toArray();

  for (const d of kitDocs) {
    const row = wsDetalle.addRow({
      convenio: d.convenio,
      institucion: d.institucion,
      sede: d.sede,
      aula: d.aula,
      dispositivo: d.dispositivo,
      placa: d.placa || 'SIN PLACA',
      serial: d.serial || 'SIN SERIAL',
      estado_disp: d.estado || 'BUENO'
    });
    row.alignment = { vertical: 'middle' };
    row.getCell('convenio').alignment = { horizontal: 'center' };
  }

  const outPaths = [
    path.join(__dirname, '..', 'Reporte_Dispositivos_Sobrantes_Faltantes_SITE.xlsx'),
    path.join(__dirname, 'Reporte_Dispositivos_Sobrantes_Faltantes_SITE.xlsx'),
    path.join(__dirname, '..', 'uploads', 'Reporte_Dispositivos_Sobrantes_Faltantes_SITE.xlsx')
  ];

  for (const p of outPaths) {
    await workbook.xlsx.writeFile(p);
    console.log(`Reporte guardado exitosamente en: ${p}`);
  }

  await client.close();
  console.log("¡Reporte Excel final generado al 100%!");
}

generarReporteExcelFinal().catch(console.error);

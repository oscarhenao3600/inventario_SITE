const { MongoClient } = require('mongodb');

async function aplicarTrasladoTablets() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log("Iniciando traslado de tablets docentes excedentes a instituciones con faltantes a RECTORIA...");

  const surplusInsts = {
    'CIUDADELA DE OCCIDENTE': 7,
    'CIUDADELA CUYABRA': 6,
    'TERESITA MONTES': 5,
    'CAMARA JUNIOR': 3,
    'EUDORO GRANADA': 2,
    'GUSTAVO MATAMOROS D´COSTA': 2,
    'LAS COLINAS': 2,
    'REPUBLICA DE FRANCIA': 2,
    'NORMAL SUPERIOR': 2,
    'CIUDAD DORADA': 1
  };

  const destinations = [
    { inst: 'ITI', sede: 'ITI', aula: 'RECTORIA', count: 7, conv: '2022-006' },
    { inst: 'RUFINO CENTRO', sede: 'RUFINO CENTRO', aula: 'RECTORIA', count: 6, conv: '2022-006' },
    { inst: 'NACIONAL JESUS MARIA OCAMPO', sede: 'NACIONAL JESUS MARIA OCAMPO', aula: 'RECTORIA', count: 5, conv: '2022-006' },
    { inst: 'SANTA TERESA DE JESUS', sede: 'SANTA TERESA DE JESUS', aula: 'RECTORIA', count: 4, conv: '2022-006' },
    { inst: 'BOSQUES DE PINARES', sede: 'BOSQUES DE PINARES', aula: 'RECTORIA', count: 2, conv: '2022-006' },
    { inst: 'NUESTRA SEÑORA DE BELEN', sede: 'NUESTRA SEÑORA DE BELEN', aula: 'RECTORIA', count: 2, conv: '2022-006' },
    { inst: 'RUFINO JOSÉ CUERVO SUR', sede: 'RUFINO JOSÉ CUERVO SUR', aula: 'RECTORIA', count: 2, conv: '2022-006' },
    { inst: 'CAMILO TORRES', sede: 'CAMILO TORRES', aula: 'RECTORIA', count: 1, conv: '2022-006' },
    { inst: 'MARCELINO CHAMPAGNAT', sede: 'MARCELINO CHAMPAGNAT', aula: 'RECTORIA', count: 1, conv: '2022-006' },
    { inst: 'ENRIQUE OLAYA HERRERA', sede: 'ENRIQUE OLAYA HERRERA', aula: 'RECTORIA', count: 1, conv: '2022-006' },
    { inst: 'ENRIQUE OLAYA HERRERA', sede: 'GABRIELA MISTRAL', aula: 'SALA DE COMPUTO', count: 1, conv: 'SOBRANTE' }
  ];

  const tabletsToTransfer = [];

  for (const [inst, count] of Object.entries(surplusInsts)) {
    // Only from 2022-006 where excess exists
    const instTds = await col.find({
      institucion: inst,
      convenio: '2022-006',
      dispositivo: 'Tablet Para Docentes'
    }).toArray();

    // Prioritize 'PLACA POR ASIGNAR', then 'RECTORIA'
    instTds.sort((a, b) => {
      const aPorAsignar = !a.placa || a.placa.toLowerCase().includes('asignar');
      const bPorAsignar = !b.placa || b.placa.toLowerCase().includes('asignar');
      if (aPorAsignar && !bPorAsignar) return -1;
      if (!aPorAsignar && bPorAsignar) return 1;

      const aRectoria = a.aula && a.aula.toUpperCase().includes('RECTOR');
      const bRectoria = b.aula && b.aula.toUpperCase().includes('RECTOR');
      if (aRectoria && !bRectoria) return -1;
      if (!aRectoria && bRectoria) return 1;

      return 0;
    });

    const chosen = instTds.slice(0, count);
    for (const t of chosen) {
      tabletsToTransfer.push(t);
    }
  }

  console.log(`Total tablets seleccionadas para trasladar: ${tabletsToTransfer.length}`);

  let updateOps = [];
  let idx = 0;
  const transferLog = [];

  for (const dest of destinations) {
    for (let c = 0; c < dest.count; c++) {
      const tablet = tabletsToTransfer[idx++];
      updateOps.push({
        updateOne: {
          filter: { _id: tablet._id },
          update: {
            $set: {
              institucion: dest.inst,
              sede: dest.sede,
              aula: dest.aula,
              convenio: dest.conv
            }
          }
        }
      });
      transferLog.push({
        placa: tablet.placa,
        serial: tablet.serial,
        origen_inst: tablet.institucion,
        origen_sede: tablet.sede,
        origen_aula: tablet.aula,
        destino_inst: dest.inst,
        destino_sede: dest.sede,
        destino_aula: dest.aula,
        convenio: dest.conv
      });
    }
  }

  console.log(`Ejecutando bulkWrite de ${updateOps.length} traslados en MongoDB...`);
  const res = await col.bulkWrite(updateOps);
  console.log(`BulkWrite completado con éxito: ${res.modifiedCount} tablets actualizadas.`);

  // Auditoria directa en MongoDB
  console.log("\n==================== VERIFICACIÓN DIRECTA TRAS TRASLADO ====================");
  for (const conv of ['2022-006', '2024-001', '2025-001', 'SOBRANTE']) {
    const p = await col.countDocuments({ convenio: conv, dispositivo: 'Pantalla Interactiva Táctil' });
    const srv = await col.countDocuments({ convenio: conv, dispositivo: 'Servidor Portable de Aula SITE Sistema Cloud' });
    const sop = await col.countDocuments({ convenio: conv, dispositivo: 'Soporte Electrónico Pantalla Interactiva Táctil' });
    const td = await col.countDocuments({ convenio: conv, dispositivo: 'Tablet Para Docentes' });
    console.log(`Convenio ${conv.padEnd(10)}: P=${p}, Srv=${srv}, Sop=${sop}, TD=${td} | ${p === srv && srv === sop && sop === td ? '100% EXACTO' : 'DIFERENCIA'}`);
  }

  const insts = await col.distinct('institucion');
  insts.sort();
  let errors = 0;
  for (const inst of insts) {
    const p = await col.countDocuments({ institucion: inst, dispositivo: 'Pantalla Interactiva Táctil' });
    const srv = await col.countDocuments({ institucion: inst, dispositivo: 'Servidor Portable de Aula SITE Sistema Cloud' });
    const sop = await col.countDocuments({ institucion: inst, dispositivo: 'Soporte Electrónico Pantalla Interactiva Táctil' });
    const td = await col.countDocuments({ institucion: inst, dispositivo: 'Tablet Para Docentes' });
    if (p !== srv || srv !== sop || sop !== td) {
      console.error(`Diferencia en ${inst}: P=${p}, Srv=${srv}, Sop=${sop}, TD=${td}`);
      errors++;
    }
  }

  if (errors === 0) {
    console.log("\n>>> ¡CONFIRMADO! TODAS LAS 28 INSTITUCIONES TIENEN PARIDAD 100% (Pantalla = Servidor = Soporte = Tablet Docente) <<<");
  }

  await client.close();
}

aplicarTrasladoTablets().catch(console.error);

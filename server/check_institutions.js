const { MongoClient } = require('mongodb');

async function checkInstitutions() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // Aggregate by Institucion and Convenio
    const byInstConv = await col.aggregate([
      {
        $group: {
          _id: {
            institucion: { $trim: { input: { $ifNull: ['$institucion', ''] } } },
            convenio: { $trim: { input: { $ifNull: ['$convenio', ''] } } }
          },
          pantallas: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] } },
          servidores: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] } },
          soportes: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] } },
          carros: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] } },
          tabletsDoc: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] } },
          tabletsEst: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.institucion': 1, '_id.convenio': 1 } }
    ]).toArray();

    console.log('=== INSTITUCION Y CONVENIO: PANTALLAS vs SERVIDORES vs SOPORTES vs DOCENTES ===');
    const mismatches = [];
    for (const r of byInstConv) {
      const { institucion, convenio } = r._id;
      const { pantallas, servidores, soportes, carros, tabletsDoc, tabletsEst } = r;

      const siteMatch = (pantallas === servidores && pantallas === soportes);
      const docMatch = (pantallas === tabletsDoc);
      // For 2022-006 and 2024-001, tabletsEst is usually 30 * pantallas (or 30 * carros)
      // Let's check ratio tabletsEst / pantallas or tabletsEst / carros
      const estRatio = pantallas > 0 ? (tabletsEst / pantallas) : 0;

      if (!siteMatch || !docMatch || estRatio !== 30) {
        mismatches.push({
          institucion,
          convenio,
          pantallas,
          servidores,
          soportes,
          carros,
          tabletsDoc,
          tabletsEst,
          estRatio: estRatio.toFixed(1)
        });
      }
    }

    console.log(`Total institution/convenio groups: ${byInstConv.length}`);
    console.log(`Groups with any mismatch: ${mismatches.length}`);
    console.table(mismatches);

    // Also check total by institution (across all convenios)
    console.log('\n=== TOTAL POR INSTITUCION (ACROSS CONVENIOS) ===');
    const byInst = await col.aggregate([
      {
        $group: {
          _id: { $trim: { input: { $ifNull: ['$institucion', ''] } } },
          pantallas: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] } },
          servidores: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] } },
          soportes: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] } },
          carros: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] } },
          tabletsDoc: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] } },
          tabletsEst: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const instMismatches = byInst.filter(r => 
      r.pantallas !== r.servidores || 
      r.pantallas !== r.soportes || 
      r.pantallas !== r.tabletsDoc
    );
    console.log(`Institutions where Pantallas !== Servidores !== Soportes !== TabletsDoc: ${instMismatches.length}`);
    console.table(instMismatches.map(r => ({
      institucion: r._id,
      pantallas: r.pantallas,
      servidores: r.servidores,
      soportes: r.soportes,
      carros: r.carros,
      tabletsDoc: r.tabletsDoc,
      tabletsEst: r.tabletsEst
    })));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

checkInstitutions();

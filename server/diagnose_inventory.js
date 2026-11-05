const { MongoClient } = require('mongodb');

async function diagnose() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    // 1. Devices by convenio
    console.log('=== TOTALES POR CONVENIO Y DISPOSITIVO EN BD ===');
    const totals = await col.aggregate([
      {
        $group: {
          _id: { convenio: '$convenio', dispositivo: '$dispositivo' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.convenio': 1, '_id.dispositivo': 1 } }
    ]).toArray();
    console.table(totals.map(t => ({
      convenio: t._id.convenio,
      dispositivo: t._id.dispositivo,
      count: t.count
    })));

    // 2. Target comparison from User's Image:
    // 2022-006: Pantalla 429, Servidor 429, Soporte 429, Carro 429, Tablet Docente 429, Tablet Alumno 12870
    // 2024-001: Pantalla 300, Servidor 300, Soporte 300, Carro 300, Tablet Docente 300, Tablet Alumno 9000
    // 2025-001: Pantalla 303, Servidor 303, Soporte 303, Carro 220, Tablet Docente 303, Tablet Alumno 3840
    // Totales:   Pantalla 1032, Servidor 1032, Soporte 1032, Carro 949, Tablet Docente 1032, Tablet Alumno 25710

    // 3. Let's analyze Aulas:
    console.log('\n=== ANALISIS DE AULAS ===');
    const aulas = await col.aggregate([
      {
        $group: {
          _id: {
            institucion: { $trim: { input: { $ifNull: ['$institucion', ''] } } },
            sede: { $trim: { input: { $ifNull: ['$sede', ''] } } },
            aula: { $trim: { input: { $ifNull: ['$aula', ''] } } }
          },
          convenios: { $addToSet: '$convenio' },
          pantallas: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Pantalla Interactiva Táctil'] }, 1, 0] } },
          servidores: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Servidor Portable de Aula SITE Sistema Cloud'] }, 1, 0] } },
          soportes: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Soporte Electrónico Pantalla Interactiva Táctil'] }, 1, 0] } },
          carros: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Carro Cargador de Tabletas'] }, 1, 0] } },
          docentes: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Docentes'] }, 1, 0] } },
          estudiantes: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Tablet Para Estudiantes'] }, 1, 0] } },
          mesas: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Mesa Interactiva Tactil'] }, 1, 0] } },
          sillas: { $sum: { $cond: [{ $eq: ['$dispositivo', 'Silla De Mesa interactiva'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]).toArray();

    console.log(`Total de aulas en BD: ${aulas.length}`);

    // Check aulas where pantallas !== servidores or pantallas !== soportes
    const desajusteSITE = aulas.filter(a => 
      (a.pantallas > 0 || a.servidores > 0 || a.soportes > 0) &&
      (a.pantallas !== a.servidores || a.pantallas !== a.soportes)
    );
    console.log(`Aulas con desajuste entre Pantallas, Servidores y Soportes: ${desajusteSITE.length}`);
    if (desajusteSITE.length > 0) {
      console.log('Detalle de desajustes SITE:');
      console.table(desajusteSITE.map(a => ({
        inst: a._id.institucion,
        sede: a._id.sede,
        aula: a._id.aula,
        convs: a.convenios.join(','),
        pan: a.pantallas,
        ser: a.servidores,
        sop: a.soportes,
        doc: a.docentes,
        carr: a.carros,
        est: a.estudiantes
      })));
    }

    // Check aulas where pantallas !== docentes
    const desajusteDocentes = aulas.filter(a => 
      a.pantallas > 0 && a.pantallas !== a.docentes
    );
    console.log(`Aulas donde Pantallas !== Tablets Docente: ${desajusteDocentes.length}`);
    console.table(desajusteDocentes.slice(0, 15).map(a => ({
      inst: a._id.institucion,
      sede: a._id.sede,
      aula: a._id.aula,
      convs: a.convenios.join(','),
      pan: a.pantallas,
      doc: a.docentes,
      carr: a.carros,
      est: a.estudiantes
    })));

    // Check mixed convenios in the same aula
    const aulasMixtas = aulas.filter(a => a.convenios.length > 1);
    console.log(`\nAulas con más de un convenio: ${aulasMixtas.length}`);
    if (aulasMixtas.length > 0) {
      console.table(aulasMixtas.slice(0, 15).map(a => ({
        inst: a._id.institucion,
        sede: a._id.sede,
        aula: a._id.aula,
        convs: a.convenios.join(','),
        pan: a.pantallas,
        ser: a.servidores,
        sop: a.soportes,
        doc: a.docentes,
        est: a.estudiantes
      })));
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

diagnose();

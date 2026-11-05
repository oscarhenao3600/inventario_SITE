const { MongoClient } = require('mongodb');

async function simulateFullAlignment() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const all = await col.find({}).toArray();

    // 1. Identify Auditorio 2022 kit as SOBRANTE
    const sobrantes = all.filter(d => 
      (d.institucion === 'CIUDADELA DEL SUR' && d.aula === 'AUDITORIO' && d.convenio === '2022-006') ||
      (d.institucion === 'CIUDADELA DEL SUR' && d.aula === 'AULA 27' && ['47036', '47037'].includes(d.placa))
    );
    console.log(`Identified initial surplus devices in Ciudadela del Sur: ${sobrantes.length}`);
    sobrantes.forEach(s => console.log(`   - ${s.dispositivo} | Placa: ${s.placa} | Serial: ${s.serial}`));

    // 2. Classrooms with Pantallas
    // Map each aula to its Pantalla's convenio
    const aulaPantallaConv = {};
    const multiPanAulas = {};

    for (const d of all) {
      if (d.dispositivo === 'Pantalla Interactiva Táctil') {
        // Exclude the surplus Auditorio 2022 pantalla
        if (d.institucion === 'CIUDADELA DEL SUR' && d.aula === 'AUDITORIO' && d.placa === '20851') continue;

        const key = `${(d.institucion || '').trim()} ||| ${(d.sede || '').trim()} ||| ${(d.aula || '').trim()}`;
        if (!aulaPantallaConv[key]) {
          aulaPantallaConv[key] = d.convenio;
        } else {
          if (!multiPanAulas[key]) multiPanAulas[key] = [aulaPantallaConv[key]];
          multiPanAulas[key].push(d.convenio);
        }
      }
    }

    console.log(`Total Aulas with at least 1 Pantalla (excluding surplus Auditorio): ${Object.keys(aulaPantallaConv).length}`);
    console.log(`Aulas with multiple pantallas:`, multiPanAulas);

    // Count pantallas by convenio
    const panCounts = { '2022-006': 0, '2024-001': 0, '2025-001': 0 };
    for (const d of all) {
      if (d.dispositivo === 'Pantalla Interactiva Táctil') {
        if (d.institucion === 'CIUDADELA DEL SUR' && d.aula === 'AUDITORIO' && d.placa === '20851') continue;
        panCounts[d.convenio] = (panCounts[d.convenio] || 0) + 1;
      }
    }
    console.log('Pantalla counts by convenio (excluding surplus):', panCounts);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

simulateFullAlignment();

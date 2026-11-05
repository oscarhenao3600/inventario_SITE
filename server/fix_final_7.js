const { MongoClient } = require('mongodb');

async function fixFinal7() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('--- Aplicando los 7 ajustes finales ---');

  // 1. Rufino Centro: 1 aula en 2024-001 pasa a 2022-006 (meta 2022=29, 2024=0)
  await col.updateMany(
    { institucion: 'RUFINO JOSE CUERVO CENTRO', convenio: '2024-001' },
    { $set: { convenio: '2022-006' } }
  );

  // 2. ITI: 1 aula en 2024-001 pasa a 2022-006 (meta 2022=15, 2024=0)
  await col.updateMany(
    { institucion: 'INSTITUTO TECNICO INDUSTRIAL', convenio: '2024-001' },
    { $set: { convenio: '2022-006' } }
  );

  // 3. Madre Marcelina: Buscar la pantalla 10 en Rufino Sur
  const mmExtra = await col.findOne({
    institucion: /RUFINO.*SUR/i,
    convenio: { $in: ['2022-006', '2024-001'] },
    dispositivo: 'Pantalla Interactiva Táctil'
  });
  if (mmExtra) {
    console.log('Asignando aula a Madre Marcelina:', mmExtra.aula, mmExtra.placa);
    await col.updateMany(
      { aula: mmExtra.aula, institucion: mmExtra.institucion },
      { $set: { institucion: 'MADRE MARCELINA', sede: 'MADRE MARCELINA', convenio: '2022-006' } }
    );
  } else {
    // Si no está en Rufino Sur, buscar en toda la BD aula de Madre Marcelina
    const mmAny = await col.findOne({ sede: 'MADRE MARCELINA', convenio: { $ne: '2022-006' }, dispositivo: 'Pantalla Interactiva Táctil' });
    if (mmAny) {
      await col.updateMany(
        { aula: mmAny.aula, sede: 'MADRE MARCELINA' },
        { $set: { institucion: 'MADRE MARCELINA', sede: 'MADRE MARCELINA', convenio: '2022-006' } }
      );
    }
  }

  // 4. Santa Teresa de Jesús:
  // Biblioteca (34311) con serial JYD20240912030 es Convenio 2025-001 en Santa Teresa (completa 14)
  await col.updateMany(
    { placa: '34311' },
    { $set: { convenio: '2025-001', sede: 'SANTA TERESA DE JESUS' } }
  );
  // Aula 28 (41665) pasa a Santa Teresa de Jesús en 2022-006 (La Florida queda en 10, Santa Teresa en 4)
  await col.updateMany(
    { placa: '41665' },
    { $set: { sede: 'SANTA TERESA DE JESUS', convenio: '2022-006' } }
  );

  // 5. La Adiela:
  // Placa 44581 pasa a 2022-006 en La Cecilia (completa 9 en La Cecilia)
  await col.updateMany(
    { placa: '44581' },
    { $set: { sede: 'LA CECILIA', convenio: '2022-006' } }
  );
  await col.updateMany(
    { institucion: 'LA ADIELA', aula: 'AULA 2', sede: 'LA CECILIA' },
    { $set: { convenio: '2022-006' } }
  );

  // 6. Ciudadela de Occidente:
  // Aula 104 (placa 19574 sin serial) pasa a 2024-001 en sede Ciudadela de Occidente (completa 30)
  await col.updateMany(
    { placa: '19574' },
    { $set: { convenio: '2024-001', sede: 'CIUDADELA DE OCCIDENTE' } }
  );

  // 7. Ciudadela del Sur:
  // Sala de Cómputo de Gabriela Mistral (placa 47058 - comodín) o 1 de los comodines pasa a Ciudadela del Sur sede (completa 9)
  await col.updateMany(
    { placa: '47058' },
    { $set: { institucion: 'CIUDADELA DEL SUR', sede: 'CIUDADELA DEL SUR', aula: 'AULA DIGITAL CS', convenio: '2022-006' } }
  );

  console.log('Ajustes aplicados.');
  await client.close();
}

fixFinal7().catch(console.error);

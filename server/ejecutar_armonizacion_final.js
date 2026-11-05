const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  console.log('====================================================');
  console.log('--- EJECUTANDO ARMONIZACIÓN FINAL Y DEFINITIVA ---');
  console.log('====================================================\n');

  // 1. Rufino José Cuervo Centro: Aula 16 pasa de 2024-001 a 2022-006
  const r1 = await col.updateMany(
    { institucion: 'RUFINO JOSE CUERVO CENTRO', sede: 'RUFINO JOSE CUERVO CENTRO', aula: 'AULA 16', convenio: '2024-001' },
    { $set: { convenio: '2022-006' } }
  );
  console.log(`1. Rufino Centro Aula 16 actualizado: ${r1.modifiedCount} dispositivos.`);

  // 2. Instituto Técnico Industrial: Aula 21 pasa de 2024-001 a 2022-006
  const r2 = await col.updateMany(
    { institucion: 'INSTITUTO TECNICO INDUSTRIAL', sede: 'INSTITUTO TECNICO INDUSTRIAL', aula: 'AULA 21', convenio: '2024-001' },
    { $set: { convenio: '2022-006' } }
  );
  console.log(`2. ITI Aula 21 actualizado: ${r2.modifiedCount} dispositivos.`);

  // 3. Madre Marcelina y Rufino José Cuervo Sur:
  // 3a. Aula 3 en Madre Marcelina (Pantalla 40086, Servidor 40135, Soporte 40184) pasa a 2022-006 de Madre Marcelina
  const r3a = await col.updateMany(
    { placa: { $in: ['40086', '40135', '40184'] } },
    { $set: { institucion: 'MADRE MARCELINA', sede: 'MADRE MARCELINA', convenio: '2022-006' } }
  );
  console.log(`3a. Madre Marcelina Aula 3 (placas 40086, 40135, 40184) unificado a 2022-006: ${r3a.modifiedCount} dispositivos.`);

  // 3b. TECNOLOGIA 2 (placas 40066, 40114, 40168) pasa de 2024-001 a 2025-001 en Madre Marcelina
  const r3b = await col.updateMany(
    { placa: { $in: ['40066', '40114', '40168'] } },
    { $set: { institucion: 'RUFINO JOSE CUERVO SUR', sede: 'MADRE MARCELINA', convenio: '2025-001' } }
  );
  console.log(`3b. Rufino Sur Aula TECNOLOGIA 2 pasa a 2025-001 Madre Marcelina: ${r3b.modifiedCount} dispositivos.`);

  // 4. Santa Teresa de Jesús:
  // 4a. Biblioteca pasa de 2022-006 a 2025-001 (Pantalla 34311, Servidor 34448, Soporte 34473, mesas, sillas)
  const r4a = await col.updateMany(
    { institucion: 'SANTA TERESA DE JESUS', sede: 'SANTA TERESA DE JESUS', aula: 'BIBLIOTECA' },
    { $set: { convenio: '2025-001' } }
  );
  console.log(`4a. Santa Teresa Biblioteca actualizado a 2025-001: ${r4a.modifiedCount} dispositivos.`);

  // 4b. Kit 2 de Aula 28 (placas 41665, 41690, 41717) pasa de LA FLORIDA a SANTA TERESA DE JESUS (convenio 2022-006)
  const r4b = await col.updateMany(
    { placa: { $in: ['41665', '41690', '41717'] } },
    { $set: { sede: 'SANTA TERESA DE JESUS', convenio: '2022-006' } }
  );
  console.log(`4b. Santa Teresa Kit Aula 28 reasignado a sede SANTA TERESA DE JESUS: ${r4b.modifiedCount} dispositivos.`);

  // 5. La Adiela - La Cecilia: Aula 2 pasa de 2024-001 a 2022-006
  const r5 = await col.updateMany(
    { institucion: 'LA ADIELA', sede: 'LA CECILIA', aula: 'AULA 2', convenio: '2024-001' },
    { $set: { convenio: '2022-006' } }
  );
  console.log(`5. La Adiela (La Cecilia Aula 2) actualizado a 2022-006: ${r5.modifiedCount} dispositivos.`);

  // 6. Ciudadela de Occidente: Aula 104 pasa a 2024-001 sede CIUDADELA DE OCCIDENTE
  const r6 = await col.updateMany(
    { institucion: 'CIUDADELA DE OCCIDENTE', aula: '104' },
    { $set: { convenio: '2024-001', sede: 'CIUDADELA DE OCCIDENTE' } }
  );
  console.log(`6. Ciudadela de Occidente Aula 104 actualizado a 2024-001: ${r6.modifiedCount} dispositivos.`);

  // 7. Ciudadela del Sur: Auditorio placa 20851 pasa de SOBRANTE a 2022-006
  const r7 = await col.updateOne(
    { placa: '20851' },
    { $set: { convenio: '2022-006', institucion: 'CIUDADELA DEL SUR', sede: 'CIUDADELA DEL SUR' } }
  );
  console.log(`7. Ciudadela del Sur Auditorio placa 20851 asignado a 2022-006: ${r7.modifiedCount} dispositivo.`);

  console.log('\n¡Todos los ajustes fueron ejecutados exitosamente!');
  await client.close();
}

main().catch(console.error);

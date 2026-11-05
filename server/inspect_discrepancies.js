const { MongoClient } = require('mongodb');

async function inspectDiscrepancies() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  // Let's inspect Camara Junior
  console.log('=== CAMARA JUNIOR ===');
  const cj = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    institucion: /CAMARA JUNIOR/i
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1, serial: 1 }).toArray();
  console.log(cj);

  // Let's inspect Ciudadela del Sur
  console.log('=== CIUDADELA DEL SUR ===');
  const cs = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    $or: [{ institucion: /CIUDADELA DEL SUR/i }, { observaciones: /CIUDADELA DEL SUR/i }, { aula: /CIUDADELA DEL SUR/i }]
  }).project({ convenio: 1, institucion: 1, sede: 1, aula: 1, placa: 1, observaciones: 1 }).toArray();
  console.log(cs);

  // Let's inspect Bosques de Pinares
  console.log('=== BOSQUES DE PINARES ===');
  const bp = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    institucion: /BOSQUES DE PINARES/i
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.log(bp);

  // Let's inspect El Caimo
  console.log('=== EL CAIMO ===');
  const ec = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    institucion: /CAIMO/i
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.log(ec);

  // Let's inspect Enrique Olaya Herrera
  console.log('=== ENRIQUE OLAYA HERRERA ===');
  const eoh = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    institucion: /OLAYA/i
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.log(eoh);

  // Let's inspect Normal Superior
  console.log('=== NORMAL SUPERIOR ===');
  const ens = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    institucion: /NORMAL/i
  }).project({ convenio: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.log(ens);

  // Let's inspect Nacional Jesus Maria Ocampo & Belen
  console.log('=== NJMO & BELEN ===');
  const njmo = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    $or: [{ institucion: /OCAMPO/i }, { institucion: /BELEN/i }]
  }).project({ convenio: 1, institucion: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.log(njmo);

  // Let's inspect Santa Teresa & La Adiela
  console.log('=== SANTA TERESA & LA ADIELA ===');
  const st = await col.find({
    dispositivo: 'Pantalla Interactiva Táctil',
    $or: [{ institucion: /TERESA/i }, { institucion: /ADIELA/i }]
  }).project({ convenio: 1, institucion: 1, sede: 1, aula: 1, placa: 1 }).toArray();
  console.log(st);

  await client.close();
}

inspectDiscrepancies().catch(console.error);

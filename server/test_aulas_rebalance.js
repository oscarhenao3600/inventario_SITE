const { MongoClient } = require('mongodb');

async function testSimulation() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  // Let's inspect aulas in each institution that needs rebalancing
  // 1. Teresita Montes: which 2 aulas move to Luis Carlos Galan?
  const tm = await col.find({ institucion: /TERESITA/i, sede: 'TERESITA MONTES', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log('TM aulas in TERESITA MONTES sede:', tm.map(d => ({ aula: d.aula, conv: d.convenio, placa: d.placa })));

  // 2. Enrique Olaya Herrera: which aula in Olaya moves to Gabriela Mistral?
  const eoh = await col.find({ institucion: /OLAYA/i, sede: 'ENRIQUE OLAYA HERRERA', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log('\nEOH aulas in OLAYA sede:', eoh.map(d => ({ aula: d.aula, conv: d.convenio, placa: d.placa })));

  // 3. NJMO aulas with 2022-006:
  const njmo = await col.find({ institucion: /OCAMPO/i, convenio: '2022-006', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log('\nNJMO 2022 aulas:', njmo.map(d => ({ aula: d.aula, placa: d.placa, serial: d.serial })));

  // 4. Ciudadela de Occidente in 2024:
  const cdo = await col.find({ institucion: /OCCIDENTE/i, convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log('\nCDO 2024 sedes count:', cdo.length, 'sedes:', [...new Set(cdo.map(d => d.sede))]);

  await client.close();
}

testSimulation();

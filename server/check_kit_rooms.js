const { MongoClient } = require('mongodb');

async function checkKitRooms() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db('inventario_educativo').collection('dispositivos');

  const moves = [
    { inst: 'CIUDADELA CUYABRA', from: '2022-006', to: '2024-001', count: 6 },
    { inst: 'CIUDADELA DE OCCIDENTE', from: '2022-006', to: '2024-001', count: 2 },
    { inst: 'NORMAL SUPERIOR', from: '2022-006', to: '2024-001', count: 1 },
    { inst: 'CAMARA JUNIOR', from: '2022-006', to: '2024-001', count: 1 },
    { inst: 'ITI', from: '2024-001', to: '2022-006', count: 1 },
    { inst: 'LA ADIELA', from: '2024-001', to: '2022-006', count: 1 },
    { inst: 'RUFINO CENTRO', from: '2024-001', to: '2022-006', count: 1 },
    { inst: 'RUFINO JOSÉ CUERVO SUR', from: '2024-001', to: '2022-006', count: 1 },
    { inst: 'SANTA TERESA DE JESUS', from: '2024-001', to: '2022-006', count: 3 },
    { inst: 'EL CAIMO', from: '2024-001', to: '2022-006', count: 2 }
  ];

  for (const m of moves) {
    console.log(`\n======================================================`);
    console.log(`Checking ${m.inst}: need to move ${m.count} kits from ${m.from} to ${m.to}`);
    const docs = await col.find({
      institucion: m.inst,
      convenio: m.from,
      dispositivo: { $in: ['Pantalla Interactiva Táctil', 'Servidor Portable de Aula SITE Sistema Cloud', 'Soporte Electrónico Pantalla Interactiva Táctil'] }
    }).toArray();

    // Group by sede and aula
    const rooms = {};
    for (const d of docs) {
      const k = `${d.sede} __ ${d.aula}`;
      if (!rooms[k]) rooms[k] = { sede: d.sede, aula: d.aula, p: [], srv: [], sop: [] };
      if (d.dispositivo === 'Pantalla Interactiva Táctil') rooms[k].p.push(d);
      if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') rooms[k].srv.push(d);
      if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') rooms[k].sop.push(d);
    }

    const completeRooms = Object.values(rooms).filter(r => r.p.length === 1 && r.srv.length === 1 && r.sop.length === 1);
    console.log(`Aulas completas encontradas: ${completeRooms.length}`);
    for (let i = 0; i < Math.min(m.count, completeRooms.length); i++) {
      const cr = completeRooms[i];
      console.log(`  Seleccionada: Sede [${cr.sede}], Aula [${cr.aula}] -> Pantalla: ${cr.p[0].placa}, Servidor: ${cr.srv[0].placa}, Soporte: ${cr.sop[0].placa}`);
    }
  }

  await client.close();
}

checkKitRooms().catch(console.error);

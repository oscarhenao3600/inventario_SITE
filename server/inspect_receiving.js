const { MongoClient } = require('mongodb');

async function inspectReceivingSedes() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const receivingInsts = [
    'ITI', 'RUFINO CENTRO', 'NACIONAL JESUS MARIA OCAMPO',
    'SANTA TERESA DE JESUS', 'BOSQUES DE PINARES', 'NUESTRA SEÑORA DE BELEN',
    'RUFINO JOSÉ CUERVO SUR', 'CAMILO TORRES', 'MARCELINO CHAMPAGNAT',
    'ENRIQUE OLAYA HERRERA'
  ];

  for (const inst of receivingInsts) {
    const docs = await col.find({ institucion: inst }).toArray();
    const sedes = [...new Set(docs.map(d => d.sede))];
    const rectorias = docs.filter(d => d.aula && d.aula.toUpperCase().includes('RECTOR'));
    const recSedes = [...new Set(rectorias.map(d => d.sede))];
    console.log(`\n${inst}:`);
    console.log(`  Sedes disponibles: ${sedes.join(', ')}`);
    console.log(`  Sede con Rectoría actual: ${recSedes.join(', ') || 'Ninguna aún'}`);
  }

  await client.close();
}

inspectReceivingSedes().catch(console.error);

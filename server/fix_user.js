const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const result = await db.collection('usuarios').updateOne(
      { username: 'oscarhenao' },
      { $set: { role: 'admin', isChief: true } }
    );
    console.log('Update result:', result);
    const user = await db.collection('usuarios').findOne({ username: 'oscarhenao' }, { projection: { password: 0 } });
    console.log('User after update:', user);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

run();

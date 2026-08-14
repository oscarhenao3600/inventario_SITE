const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const collection = db.collection('dispositivos');

    // Test 1: Only convenio = '2022-006' (12954 items)
    console.time('Test 1: Only convenio 2022-006');
    const res1 = await collection.find({ convenio: '2022-006' }).toArray();
    console.timeEnd('Test 1: Only convenio 2022-006');
    console.log(`Matched: ${res1.length} devices`);

    // Test 2: Only convenio = '2024-001' (1381 items)
    console.time('Test 2: Only convenio 2024-001');
    const res2 = await collection.find({ convenio: '2024-001' }).toArray();
    console.timeEnd('Test 2: Only convenio 2024-001');
    console.log(`Matched: ${res2.length} devices`);

    // Test 3: convenio = '2022-006' + regex on institucion
    console.time('Test 3: convenio + regex institucion');
    const res3 = await collection.find({
      convenio: '2022-006',
      institucion: { $regex: new RegExp("^NACIONAL JESUS MARIA OCAMPO$", 'i') }
    }).toArray();
    console.timeEnd('Test 3: convenio + regex institucion');
    console.log(`Matched: ${res3.length} devices`);

    // Test 4: Only regex on institucion
    console.time('Test 4: Only regex institucion');
    const res4 = await collection.find({
      institucion: { $regex: new RegExp("^NACIONAL JESUS MARIA OCAMPO$", 'i') }
    }).toArray();
    console.timeEnd('Test 4: Only regex institucion');
    console.log(`Matched: ${res4.length} devices`);

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();

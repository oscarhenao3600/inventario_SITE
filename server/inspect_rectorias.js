const { MongoClient } = require('mongodb');

async function inspectRectorias() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const col = db.collection('dispositivos');

    const inAdmin = await col.find({
      aula: /rectoria|coordinacion|secretaria|admin|almacen|bodega/i
    }).toArray();

    console.log(`Devices in admin/storage areas: ${inAdmin.length}`);
    const summary = {};
    for (const d of inAdmin) {
      const key = `${(d.institucion || '').trim()} | ${(d.sede || '').trim()} | ${(d.aula || '').trim()} | ${d.dispositivo} | ${d.convenio}`;
      summary[key] = (summary[key] || 0) + 1;
    }
    console.table(Object.entries(summary).map(([k, count]) => {
      const [inst, sede, aula, dev, conv] = k.split(' | ');
      return { inst, sede, aula, dev, conv, count };
    }));

  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

inspectRectorias();

const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Aggregation of Pantallas (which define SITEs) by convenio, institucion, sede
  const currentSites = await col.aggregate([
    {
      $match: {
        dispositivo: 'Pantalla Interactiva Táctil',
        convenio: { $in: ['2022-006', '2024-001', '2025-001'] }
      }
    },
    {
      $group: {
        _id: {
          convenio: '$convenio',
          institucion: '$institucion',
          sede: '$sede'
        },
        pantallas: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.convenio': 1, '_id.institucion': 1, '_id.sede': 1 }
    }
  ]).toArray();

  console.log('=== PANTALLAS (SITES) ACTUALES EN BD POR CONVENIO / INSTITUCION / SEDE ===');
  console.log(`Total sedes con pantallas: ${currentSites.length}`);
  
  // List distinct institutions and sedes in DB
  const distinctInstSede = await col.aggregate([
    {
      $group: {
        _id: { institucion: '$institucion', sede: '$sede' }
      }
    },
    { $sort: { '_id.institucion': 1, '_id.sede': 1 } }
  ]).toArray();

  console.log('\n=== INSTITUCIONES Y SEDES DISTINTAS EN BD ===');
  for (const item of distinctInstSede) {
    console.log(`Inst: "${item._id.institucion}" | Sede: "${item._id.sede}"`);
  }

  await client.close();
}

main().catch(console.error);

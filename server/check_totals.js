const { MongoClient } = require('mongodb');

async function checkTotals() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const r = await col.aggregate([
    { $match: { dispositivo: 'Pantalla Interactiva Táctil' } },
    { $group: { _id: '$convenio', count: { $sum: 1 } } }
  ]).toArray();

  console.log("Totales de Pantallas por Convenio:");
  console.log(r);

  // Check all screens in 2024-001 that are NOT in target2024:
  const target2024Sedes = [
    "BOSQUES DE PINARES", "PINARES", "SIMON RODRIGUEZ", "CAMARA JUNIOR", "CIUDAD MILAGRO",
    "CAMILO TORRES", "JORGE ELIECER GAITAN", "CASD HERMOGENES MAZA", "SANTA EUFRASIA",
    "CIUDAD DORADA", "CIUDADELA CUYABRA", "LUIS BERNAL GIRALDO", "CIUDADELA DE OCCIDENTE",
    "CIUDADELA DEL SUR", "CRISTOBAL COLON", "GRANCOLOMBIA", "EL MESON", "JOSE MARIA CORDOBA",
    "LA ESPERANZA", "SANTA ANA", "ENRIQUE OLAYA HERRERA", "GABRIELA MISTRAL", "EUDORO GRANADA",
    "GUSTAVO MATAMOROS D´COSTA", "INEM JOSE CELESTINO MUTIS", "LAURA VICUÑA", "CIUDAD ARMENIA",
    "ESCUELA NORMAL SUPERIOR DEL QUINDIO", "GUSTAVO ROJAS PINILLA"
  ];

  const screens2024 = await col.find({ convenio: '2024-001', dispositivo: 'Pantalla Interactiva Táctil' }).toArray();
  console.log(`Total screens in 2024-001: ${screens2024.length} (Target: 300)`);
  const extra2024 = screens2024.filter(s => !target2024Sedes.includes(s.sede) || s.institucion === 'RUFINO JOSE CUERVO CENTRO' || s.institucion === 'INSTITUTO TECNICO INDUSTRIAL' || s.institucion === 'RUFINO JOSE CUERVO SUR' || s.institucion === 'LA ADIELA');
  console.log("Pantallas en 2024-001 fuera de target o en sedes sin target 2024:");
  extra2024.forEach(s => console.log(`  inst:${s.institucion} | sede:${s.sede} | aula:${s.aula} | placa:${s.placa} | serial:${s.serial}`));

  await client.close();
}

checkTotals().catch(console.error);

const { MongoClient } = require('mongodb');

async function analyzeRestoredPerInst() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  // Mapping from target institution name to the DB's actual institution name
  const targetToDbInst = {
    'BOSQUES DE PINARES': 'BOSQUES DE PINARES',
    'CAMARA JUNIOR': 'CAMARA JUNIOR',
    'CAMILO TORRES': 'CAMILO TORRES',
    'NUEVA GRANADA': 'CAMILO TORRES', // Wait, let's check Nueva Granada in DB!
    'CASD HERMOGENES MAZA': 'CASD',
    'CIUDAD DORADA': 'CIUDAD DORADA',
    'CIUDADELA CUYABRA': 'CIUDADELA CUYABRA',
    'CIUDADELA DE OCCIDENTE': 'CIUDADELA DE OCCIDENTE',
    'CIUDADELA DEL SUR': 'CIUDADELA DEL SUR',
    'CRISTOBAL COLON': 'CRISTOBAL COLON',
    'EL CAIMO': 'EL CAIMO',
    'ENRIQUE OLAYA HERRERA': 'ENRIQUE OLAYA HERRERA',
    'ESCUELA NORMAL SUPERIOR DEL QUINDIO': 'NORMAL SUPERIOR',
    'EUDORO GRANADA': 'EUDORO GRANADA',
    'MADRE MARCELINA': 'RUFINO JOSÉ CUERVO SUR', // Or let's check!
    'GUSTAVO MATAMOROS D´COSTA': 'GUSTAVO MATAMOROS D´COSTA',
    'INEM JOSE CELESTINO MUTIS': 'INEM',
    'LAS COLINAS': 'LAS COLINAS',
    'LAURA VICUÑA': 'LAURA VICUÑA',
    'LOS QUINDIOS': 'LOS QUINDOS',
    'RUFINO JOSE CUERVO CENTRO': 'RUFINO CENTRO',
    'INSTITUTO TECNICO INDUSTRIAL': 'ITI',
    'REPUBLICA DE FRANCIA': 'REPUBLICA DE FRANCIA',
    'SANTA TERESA DE JESUS': 'SANTA TERESA DE JESUS',
    'MARCELINO CHAMPAGNAT': 'MARCELINO CHAMPAGNAT',
    'TERESITA MONTES': 'TERESITA MONTES',
    'LA ADIELA': 'LA ADIELA',
    'NACIONAL JESUS MARIA OCAMPO': 'NACIONAL JESUS MARIA OCAMPO',
    'NUESTRA SEÑORA DE BELEN': 'NUESTRA SEÑORA DE BELEN',
    'RUFINO JOSE CUERVO SUR': 'RUFINO JOSÉ CUERVO SUR'
  };

  // Check Nueva Granada and Madre Marcelina in DB:
  const ng = await col.distinct('institucion', { sede: /NUEVA GRANADA/i });
  console.log("Institución de sede NUEVA GRANADA en BD:", ng);

  const mm = await col.distinct('institucion', { sede: /MADRE MARCELINA/i });
  console.log("Institución de sede MADRE MARCELINA en BD:", mm);

  await client.close();
}

analyzeRestoredPerInst().catch(console.error);

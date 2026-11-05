const { MongoClient } = require('mongodb');

async function planTabletMoves() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const targetsTotal = {
    'BOSQUES DE PINARES': 37,
    'CAMARA JUNIOR': 39,
    'CAMILO TORRES': 21,
    'CASD': 74,
    'CIUDAD DORADA': 23,
    'CIUDADELA CUYABRA': 29,
    'CIUDADELA DE OCCIDENTE': 42,
    'CIUDADELA DEL SUR': 59,
    'CRISTOBAL COLON': 35,
    'EL CAIMO': 31,
    'ENRIQUE OLAYA HERRERA': 18, // 18 contratadas (+ 1 sobrante en Gabriela Mistral)
    'EUDORO GRANADA': 25,
    'GUSTAVO MATAMOROS D´COSTA': 30,
    'INEM': 45,
    'ITI': 36,
    'LA ADIELA': 44,
    'LAS COLINAS': 16,
    'LAURA VICUÑA': 25,
    'LOS QUINDOS': 34,
    'MARCELINO CHAMPAGNAT': 36,
    'NACIONAL JESUS MARIA OCAMPO': 25,
    'NORMAL SUPERIOR': 85,
    'NUESTRA SEÑORA DE BELEN': 21,
    'REPUBLICA DE FRANCIA': 11,
    'RUFINO CENTRO': 77,
    'RUFINO JOSÉ CUERVO SUR': 56,
    'SANTA TERESA DE JESUS': 30,
    'TERESITA MONTES': 28
  };

  const surplusInsts = {
    'CIUDADELA DE OCCIDENTE': 7,
    'CIUDADELA CUYABRA': 6,
    'TERESITA MONTES': 5,
    'CAMARA JUNIOR': 3,
    'EUDORO GRANADA': 2,
    'GUSTAVO MATAMOROS D´COSTA': 2,
    'LAS COLINAS': 2,
    'REPUBLICA DE FRANCIA': 2,
    'NORMAL SUPERIOR': 2,
    'CIUDAD DORADA': 1
  };

  const deficitInsts = {
    'ITI': 7,
    'RUFINO CENTRO': 6,
    'NACIONAL JESUS MARIA OCAMPO': 5,
    'SANTA TERESA DE JESUS': 4,
    'BOSQUES DE PINARES': 2,
    'NUESTRA SEÑORA DE BELEN': 2,
    'RUFINO JOSÉ CUERVO SUR': 2,
    'CAMILO TORRES': 1,
    'MARCELINO CHAMPAGNAT': 1,
    'ENRIQUE OLAYA HERRERA': 1 // para completar 18 contratadas
  };

  const totalSurplus = Object.values(surplusInsts).reduce((a,b)=>a+b, 0);
  const totalDeficit = Object.values(deficitInsts).reduce((a,b)=>a+b, 0);
  console.log(`Total Excedente a mover: ${totalSurplus}`);
  console.log(`Total Faltante a recibir: ${totalDeficit}`);

  // In each surplus institution, let's find the best candidate tablets to move:
  // Priority 1: Tablets with "PLACA POR ASIGNAR" (or sin placa)
  // Priority 2: Tablets in "RECTORIA"
  // Priority 3: Tablets in general classrooms (if needed)

  const candidatesBySurplus = {};

  for (const [inst, countNeeded] of Object.entries(surplusInsts)) {
    const tds = await col.find({ institucion: inst, dispositivo: 'Tablet Para Docentes' }).toArray();
    
    // Sort by priority:
    tds.sort((a, b) => {
      const aPorAsignar = !a.placa || a.placa.toLowerCase().includes('asignar');
      const bPorAsignar = !b.placa || b.placa.toLowerCase().includes('asignar');
      if (aPorAsignar && !bPorAsignar) return -1;
      if (!aPorAsignar && bPorAsignar) return 1;

      const aRectoria = a.aula && a.aula.toUpperCase().includes('RECTOR');
      const bRectoria = b.aula && b.aula.toUpperCase().includes('RECTOR');
      if (aRectoria && !bRectoria) return -1;
      if (!aRectoria && bRectoria) return 1;

      return 0;
    });

    const chosen = tds.slice(0, countNeeded);
    candidatesBySurplus[inst] = chosen;

    console.log(`\nCandidatos de ${inst} (se moverán ${countNeeded}):`);
    chosen.forEach(t => {
      console.log(`  - Placa: '${t.placa}', Serial: '${t.serial}', Aula actual: '${t.aula}', Sede actual: '${t.sede}', Conv: '${t.convenio}'`);
    });
  }

  await client.close();
}

planTabletMoves().catch(console.error);

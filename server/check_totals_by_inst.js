const { MongoClient } = require('mongodb');

async function checkTotals() {
  const uri = 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('inventario_educativo');
  const col = db.collection('dispositivos');

  const kitTypes = [
    'Pantalla Interactiva Táctil',
    'Servidor Portable de Aula SITE Sistema Cloud',
    'Soporte Electrónico Pantalla Interactiva Táctil',
    'Tablet Para Docentes'
  ];

  const docs = await col.find({ dispositivo: { $in: kitTypes } }).toArray();

  const byInst = {};
  for (const d of docs) {
    if (!byInst[d.institucion]) {
      byInst[d.institucion] = {
        pantallas: 0,
        servidores: 0,
        soportes: 0,
        td: 0,
        byConv: {}
      };
    }
    const rec = byInst[d.institucion];
    if (d.dispositivo === 'Pantalla Interactiva Táctil') rec.pantallas++;
    if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') rec.servidores++;
    if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') rec.soportes++;
    if (d.dispositivo === 'Tablet Para Docentes') rec.td++;

    if (!rec.byConv[d.convenio]) rec.byConv[d.convenio] = { p: 0, srv: 0, sop: 0, td: 0 };
    if (d.dispositivo === 'Pantalla Interactiva Táctil') rec.byConv[d.convenio].p++;
    if (d.dispositivo === 'Servidor Portable de Aula SITE Sistema Cloud') rec.byConv[d.convenio].srv++;
    if (d.dispositivo === 'Soporte Electrónico Pantalla Interactiva Táctil') rec.byConv[d.convenio].sop++;
    if (d.dispositivo === 'Tablet Para Docentes') rec.byConv[d.convenio].td++;
  }

  console.log("TOTALES FISICOS POR INSTITUCION (SUMANDO TODOS LOS CONVENIOS):");
  console.log("-------------------------------------------------------------------------");
  console.log("INSTITUCION                  | PANTALLAS | SERVIDORES | SOPORTES | TAB_DOCENTE | DIF TD-P");
  let totP = 0, totSrv = 0, totSop = 0, totTD = 0;
  for (const inst of Object.keys(byInst).sort()) {
    const r = byInst[inst];
    totP += r.pantallas;
    totSrv += r.servidores;
    totSop += r.soportes;
    totTD += r.td;
    console.log(`${inst.padEnd(28)} | ${String(r.pantallas).padStart(9)} | ${String(r.servidores).padStart(10)} | ${String(r.soportes).padStart(8)} | ${String(r.td).padStart(11)} | ${String(r.td - r.pantallas).padStart(8)}`);
  }
  console.log("-------------------------------------------------------------------------");
  console.log(`TOTAL GLOBAL                 | ${String(totP).padStart(9)} | ${String(totSrv).padStart(10)} | ${String(totSop).padStart(8)} | ${String(totTD).padStart(11)} | ${String(totTD - totP).padStart(8)}`);

  await client.close();
}

checkTotals().catch(console.error);

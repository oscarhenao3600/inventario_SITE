const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const ExcelJS = require('exceljs');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'inventario_educativo';

async function connectDB() {
  await client.connect();
  return client.db(dbName);
}

// Buscar dispositivos (por placa o serial)
app.get('/api/dispositivos', async (req, res) => {
  const { q } = req.query;
  const db = await connectDB();
  const collection = db.collection('dispositivos');
  
  let query = {};
  if (q) {
    query = {
      $or: [
        { placa: { $regex: q, $options: 'i' } },
        { serial: { $regex: q, $options: 'i' } }
      ]
    };
  }
  
  const results = await collection.find(query).toArray();
  res.json(results);
});

// Obtener duplicados (placas o seriales repetidos)
app.get('/api/duplicados', async (req, res) => {
  const { campo, sede } = req.query; // campo: 'placa' o 'serial'
  const db = await connectDB();
  const collection = db.collection('dispositivos');
  
  const field = campo === 'serial' ? 'serial' : 'placa';
  
  const pipeline = [
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
        docs: { $push: "$$ROOT" }
      }
    },
    { $match: { count: { $gt: 1 }, _id: { $ne: null, $ne: "" } } }
  ];

  let results = await collection.aggregate(pipeline).toArray();
  
  // Filtrar por sede si se especifica
  if (sede) {
    results = results.filter(group => 
      group.docs.some(doc => doc.sede === sede)
    );
  }
  
  res.json(results);
});

// Validar unicidad antes de guardar/editar
app.post('/api/validar', async (req, res) => {
  const { placa, serial, id } = req.body;
  const db = await connectDB();
  const collection = db.collection('dispositivos');
  
  const query = {
    $or: []
  };
  
  if (placa) query.$or.push({ placa });
  if (serial) query.$or.push({ serial });
  
  if (query.$or.length === 0) return res.json({ available: true });
  
  const existing = await collection.find(query).toArray();
  
  // Filtrar el documento que estamos editando
  const duplicates = existing.filter(doc => doc._id.toString() !== id);
  
  if (duplicates.length > 0) {
    return res.json({ 
      available: false, 
      reason: duplicates[0].placa === placa ? 'placa' : 'serial',
      doc: duplicates[0]
    });
  }
  
  res.json({ available: true });
});

// Agregar nuevo dispositivo
app.post('/api/dispositivos', async (req, res) => {
  const db = await connectDB();
  const collection = db.collection('dispositivos');
  const result = await collection.insertOne(req.body);
  res.json(result);
});

// Editar dispositivo
app.put('/api/dispositivos/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connectDB();
  const collection = db.collection('dispositivos');
  const { _id, ...updateData } = req.body;
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  res.json(result);
});

// Exportar a Excel
app.post('/api/exportar', async (req, res) => {
  const { dispositivos } = req.body;
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Inventario');
  
  worksheet.columns = [
    { header: 'Dispositivo', key: 'dispositivo', width: 20 },
    { header: 'Aula', key: 'aula', width: 20 },
    { header: 'Placa', key: 'placa', width: 15 },
    { header: 'Serial', key: 'serial', width: 20 },
    { header: 'Institución', key: 'institucion', width: 30 },
    { header: 'Sede', key: 'sede', width: 20 },
    { header: 'Modelo', key: 'modelo', width: 15 },
    { header: 'Notas', key: 'notas', width: 30 }
  ];
  
  worksheet.addRows(dispositivos);
  
  // Estilo para el encabezado
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    'attachment; filename=' + 'inventario_export.xlsx'
  );

  await workbook.xlsx.write(res);
  res.end();
});

// Eliminar dispositivo
app.delete('/api/dispositivos/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connectDB();
  const collection = db.collection('dispositivos');
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  res.json(result);
});

// Estadísticas generales
app.get('/api/stats', async (req, res) => {
  const db = await connectDB();
  const collection = db.collection('dispositivos');
  
  const total = await collection.countDocuments();
  const sedes = await collection.distinct('sede');
  const instituciones = await collection.distinct('institucion');
  
  // Contar duplicados aproximados de placa
  const dupPipeline = [
    { $group: { _id: "$placa", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 }, _id: { $ne: null, $ne: "" } } },
    { $count: "total" }
  ];
  const dupResult = await collection.aggregate(dupPipeline).toArray();
  const totalDuplicadosPlaca = dupResult.length > 0 ? dupResult[0].total : 0;

  // Contar duplicados aproximados de serial
  const dupSerialPipeline = [
    { $group: { _id: "$serial", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 }, _id: { $ne: null, $ne: "" } } },
    { $count: "total" }
  ];
  const dupSerialResult = await collection.aggregate(dupSerialPipeline).toArray();
  const totalDuplicadosSerial = dupSerialResult.length > 0 ? dupSerialResult[0].total : 0;

  res.json({
    total,
    totalSedes: sedes.length,
    totalInstituciones: instituciones.length,
    totalDuplicadosPlaca,
    totalDuplicadosSerial
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const ExcelJS = require('exceljs');
const multer = require('multer');
const fs = require('fs');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'inventario_educativo';
let db;

async function connectDB() {
  if (db) return db;
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(dbName);
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Inicializar conexión al arrancar
connectDB();

// Buscar dispositivos (por placa o serial)
app.get('/api/dispositivos', async (req, res, next) => {
  try {
    const { q } = req.query;
    const db = await connectDB();
  const collection = db.collection('dispositivos');
  
  let query = {};
  if (q) {
    if (q.length > 5) {
      // Buscar por serial si tiene más de 5 caracteres
      query = { serial: { $regex: q, $options: 'i' } };
    } else {
      // Buscar por placa si tiene 5 o menos caracteres
      query = { placa: { $regex: q, $options: 'i' } };
    }
  }
  
  const results = await collection.find(query).toArray();
  res.json(results);
  } catch (err) { next(err); }
});

// Obtener duplicados (placas o seriales repetidos)
app.get('/api/duplicados', async (req, res, next) => {
  try {
    const { campo, sede, tipo } = req.query; // campo: 'placa' o 'serial'
    const db = await connectDB();
  const collection = db.collection('dispositivos');
  
  const field = campo === 'serial' ? 'serial' : 'placa';
  
  const pipeline = [];
  
  // Agregar filtro de dispositivo si se especifica
  if (tipo) {
    pipeline.push({ $match: { dispositivo: { $regex: tipo, $options: 'i' } } });
  }

  pipeline.push(
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
        docs: { $push: "$$ROOT" }
      }
    },
    { $match: { count: { $gt: 1 }, _id: { $ne: null, $ne: "" } } }
  );

  let results = await collection.aggregate(pipeline).toArray();
  
  // Filtrar por sede si se especifica
  if (sede) {
    results = results.filter(group => 
      group.docs.some(doc => doc.sede === sede)
    );
  }
  
  res.json(results);
  } catch (err) { next(err); }
});

// Validar unicidad antes de guardar/editar
app.post('/api/validar', async (req, res, next) => {
  try {
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
  } catch (err) { next(err); }
});

// Agregar nuevo dispositivo
app.post('/api/dispositivos', async (req, res, next) => {
  try {
    const db = await connectDB();
  const collection = db.collection('dispositivos');
  const result = await collection.insertOne(req.body);
  res.json(result);
  } catch (err) { next(err); }
});

// Editar dispositivo
app.put('/api/dispositivos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
  const collection = db.collection('dispositivos');
  const { _id, ...updateData } = req.body;
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updateData }
  );
  res.json(result);
  } catch (err) { next(err); }
});

// Exportar a Excel
app.post('/api/exportar', async (req, res, next) => {
  try {
    const { dispositivos } = req.body;
    
    if (!dispositivos || !Array.isArray(dispositivos)) {
      return res.status(400).json({ error: 'Lista de dispositivos no proporcionada o inválida' });
    }
  
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
  } catch (err) { next(err); }
});

// Importar desde Excel (Cargue Masivo con Upsert)
app.post('/api/importar', upload.single('archivo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

  try {
    const db = await connectDB();
    const collection = db.collection('dispositivos');
    
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const worksheet = workbook.getWorksheet(1);
    
    let updates = 0;
    let inserts = 0;
    let errors = 0;
    let rowCount = 0;

    const rows = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        rows.push(row);
      }
    });

    for (const row of rows) {
      try {
        const data = {
          dispositivo: row.getCell(1).text?.trim(),
          aula: row.getCell(2).text?.trim(),
          placa: row.getCell(3).text?.trim(),
          serial: row.getCell(4).text?.trim(),
          institucion: row.getCell(5).text?.trim(),
          sede: row.getCell(6).text?.trim(),
          modelo: row.getCell(7).text?.trim(),
          notas: row.getCell(8).text?.trim()
        };

        if (!data.placa && !data.serial) continue;

        let existing = null;
        if (data.placa) {
          existing = await collection.findOne({ placa: data.placa });
        }
        
        if (!existing && data.serial) {
          existing = await collection.findOne({ serial: data.serial });
        }

        if (existing) {
          await collection.updateOne({ _id: existing._id }, { $set: data });
          updates++;
        } else {
          await collection.insertOne(data);
          inserts++;
        }
        rowCount++;
      } catch (err) {
        console.error('Error procesando fila:', err);
        errors++;
      }
    }

    // Limpiar archivo temporal
    fs.unlinkSync(req.file.path);

    res.json({ 
      success: true, 
      updates, 
      inserts, 
      errors, 
      totalProcessed: rowCount 
    });
  } catch (err) {
    console.error("Error en importación:", err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Error procesando el archivo de Excel' });
  }
});

// Eliminar dispositivo
app.delete('/api/dispositivos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
  const collection = db.collection('dispositivos');
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  res.json(result);
  } catch (err) { next(err); }
});

// Obtener tipos de dispositivos únicos
app.get('/api/tipos', async (req, res, next) => {
  try {
    const db = await connectDB();
  const collection = db.collection('dispositivos');
  const tipos = await collection.distinct('dispositivo');
  res.json(tipos.filter(t => t && t.trim() !== ''));
  } catch (err) { next(err); }
});

// Estadísticas generales
app.get('/api/stats', async (req, res, next) => {
  try {
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
  } catch (err) { next(err); }
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'La solicitud es demasiado grande. Intenta filtrar más los resultados.' });
  }
  res.status(500).json({ error: 'Ocurrió un error en el servidor', details: err.message });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const ExcelJS = require('exceljs');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');

// --- CONFIGURACIÓN DE VARIABLES DE ENTORNO ---
// Puedes cambiar el JWT_SECRET en el archivo .env o aquí directamente
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

const app = express();

// PUERTO DE LA APLICACIÓN (BACKEND)
// Para cambiar el puerto donde escucha el servidor, modifica process.env.PORT o el valor 3001 aquí
const port = process.env.PORT || 3001;

app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false, // Deshabilitar para permitir desarrollo local más fácil si es necesario
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CONEXIÓN A MONGODB
// Para cambiar la dirección de la base de datos, modifica process.env.MONGODB_URI
// Si usas Docker Compose, el host suele ser el nombre del servicio (ej: 'mongo')
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || 'inventario_educativo';
let db; // Keep db as the global variable for the database instance

async function connectDB() {
  if (db) return db; // Use 'db' instead of 'cachedDb'
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

async function syncInstitucion(db, nombre, sede) {
  if (!nombre) return;
  const coll = db.collection('instituciones');
  const normalizedNombre = nombre.trim().toUpperCase();
  const normalizedSede = sede?.trim().toUpperCase();
  
  await coll.updateOne(
    { nombre: normalizedNombre },
    { 
      $set: { nombre: normalizedNombre },
      ...(normalizedSede ? { $addToSet: { sedes: normalizedSede } } : {})
    },
    { upsert: true }
  );
}

// Inicializar conexión al arrancar
connectDB();

// Middleware para proteger rutas
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado.' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Acceso restringido. Se requieren permisos de administrador.' });
  }
}

// --- Rutas de Autenticación ---

// Registro de usuario
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const db = await connectDB();
    const collection = db.collection('usuarios');

    // Verificar si el usuario ya existe
    const existing = await collection.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // El primer usuario registrado será el admin
    const userCount = await collection.countDocuments();
    const role = userCount === 0 ? 'admin' : 'lector';

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await collection.insertOne({
      username,
      password: hashedPassword,
      role,
      createdAt: new Date()
    });

    res.json({ success: true, message: `Usuario registrado como ${role} con éxito` });
  } catch (err) { next(err); }
});

// Login de usuario
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const db = await connectDB();
    const collection = db.collection('usuarios');

    const user = await collection.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar Token con el Rol
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, username: user.username, role: user.role });
  } catch (err) { next(err); }
});

// --- Rutas de Inventario (Protegidas) ---

// Aplicar middleware a todas las rutas de la API de inventario
app.use('/api/dispositivos', authenticateToken);
app.use('/api/duplicados', authenticateToken);
app.use('/api/validar', authenticateToken);
app.use('/api/exportar', authenticateToken);
app.use('/api/importar', authenticateToken, requireAdmin);
app.use('/api/exportar-total', authenticateToken, requireAdmin);
app.use('/api/stats', authenticateToken);
app.use('/api/tipos', authenticateToken);

// Rutas de escritura protegidas adicionalmente por rol
app.post('/api/dispositivos', requireAdmin);
app.put('/api/dispositivos/:id', requireAdmin);
app.delete('/api/dispositivos/:id', requireAdmin);

// Buscar dispositivos (por placa o serial)
app.get('/api/dispositivos', async (req, res, next) => {
  try {
    const { q, tipo } = req.query;
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

  // Agregar filtro de tipo si se especifica
  if (tipo) {
    query.dispositivo = tipo;
  }
  
  const results = await collection.find(query).toArray();
  res.json(results);
  } catch (err) { next(err); }
});

// Buscar Duplicados (Agrupación por placa o serial)
app.get('/api/duplicados', authenticateToken, async (req, res, next) => {
  try {
    const { campo, sede, tipo } = req.query; // campo: 'placa' o 'serial'
    
    if (!['placa', 'serial'].includes(campo)) {
      return res.status(400).json({ error: 'Campo de duplicados inválido' });
    }

    const db = await connectDB();
    const collection = db.collection('dispositivos');

    // Valores genéricos que NO deben considerarse duplicados (comunes cuando no hay info)
    const genericValues = [
      "", null, "0", "N/A", "SIN SERIAL", "S/N", "SIN PLACA", "NONE", "NA", ".", "-"
    ];

    const pipeline = [
      // 1. Filtrar documentos que tengan un valor válido (no vacío ni genérico)
      { 
        $match: { 
          [campo]: { 
            $exists: true, 
            $nin: genericValues 
          } 
        } 
      },
      // 2. Si hay filtro por tipo, aplicarlo
      ...(tipo ? [{ $match: { dispositivo: tipo } }] : []),
      // 3. Agrupar por el campo placa/serial
      {
        $group: {
          _id: `$${campo}`,
          docs: { $push: "$$ROOT" },
          count: { $sum: 1 }
        }
      },
      // 4. Quedarse solo con los que aparecen más de una vez
      { $match: { count: { $gt: 1 } } }
    ];

    let results = await collection.aggregate(pipeline).toArray();
    
    // Filtrar por sede si se especifica: El grupo debe contener al menos un doc en esa sede
    if (sede) {
      results = results.filter(group => 
        group.docs.some(doc => doc.sede?.toLowerCase().includes(sede.toLowerCase()))
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
    await syncInstitucion(db, req.body.institucion, req.body.sede);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

// Editar dispositivo
app.put('/api/dispositivos/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = await connectDB();
  const collection = db.collection('dispositivos');
    const { _id, ...updateData } = req.body;
    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
    await syncInstitucion(db, updateData.institucion, updateData.sede);
    res.json(result);
  } catch (err) { next(err); }
});

// Exportar todo el inventario estructurado
app.get('/api/exportar-total', authenticateToken, async (req, res, next) => {
  try {
    const db = await connectDB();
    const collection = db.collection('dispositivos');
    
    // Obtener todos los dispositivos ordenados por Institución, Sede y Aula
    const dispositivos = await collection.find({})
      .sort({ institucion: 1, sede: 1, aula: 1 })
      .toArray();
    
    if (dispositivos.length === 0) {
      return res.status(404).json({ error: 'No hay dispositivos para exportar' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario Total');
    
    worksheet.columns = [
      { header: 'Institución', key: 'institucion', width: 35 },
      { header: 'Sede', key: 'sede', width: 25 },
      { header: 'Aula', key: 'aula', width: 20 },
      { header: 'Dispositivo', key: 'dispositivo', width: 25 },
      { header: 'Placa', key: 'placa', width: 15 },
      { header: 'Serial', key: 'serial', width: 20 },
      { header: 'Modelo', key: 'modelo', width: 15 },
      { header: 'Notas', key: 'notas', width: 35 }
    ];
    
    // Estilo para el encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' } // Indigo color
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Agregar filas
    worksheet.addRows(dispositivos);

    // Auto-filtro para facilitar la lectura
    worksheet.autoFilter = 'A1:H1';

    // Formateo de celdas
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        // Bordes para facilitar la lectura de tablas
        row.eachCell((cell) => {
          cell.border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          };
        });
      }
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=inventario_total_estructurado.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { next(err); }
});

// Exportar selección a Excel
app.post('/api/exportar', authenticateToken, async (req, res, next) => {
  try {
    const { dispositivos } = req.body;
    
    if (!dispositivos || !Array.isArray(dispositivos)) {
      return res.status(400).json({ error: 'Lista de dispositivos no proporcionada o inválida' });
    }
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Inventario Seleccionado');
  
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
    'attachment; filename=inventario_seleccion.xlsx'
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
        
        await syncInstitucion(db, data.institucion, data.sede);
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
    res.json(tipos.filter(t => typeof t === 'string' && t.trim() !== ''));
  } catch (err) { next(err); }
});

// Estadísticas generales
app.get('/api/stats', async (req, res, next) => {
  try {
    const db = await connectDB();
    const collection = db.collection('dispositivos');
    const institucionesColl = db.collection('instituciones');
    
    const total = await collection.countDocuments();
    const institucionesList = await institucionesColl.find().toArray();
    
    const sedesUnicas = new Set();
    const instNames = [];
    
    institucionesList.forEach(inst => {
      instNames.push(inst.nombre);
      if (inst.sedes) {
        inst.sedes.forEach(s => sedesUnicas.add(s));
      }
    });
  
    // Contar duplicados aproximados
    const totalDuplicadosPlaca = (await collection.aggregate([
      { $group: { _id: "$placa", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 }, _id: { $ne: null, $ne: "" } } },
      { $count: "total" }
    ]).toArray())[0]?.total || 0;
  
    const totalDuplicadosSerial = (await collection.aggregate([
      { $group: { _id: "$serial", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 }, _id: { $ne: null, $ne: "" } } },
      { $count: "total" }
    ]).toArray())[0]?.total || 0;
  
    res.json({
      total,
      totalSedes: sedesUnicas.size,
      totalInstituciones: institucionesList.length,
      totalDuplicadosPlaca,
      totalDuplicadosSerial,
      sedes: Array.from(sedesUnicas).sort(),
      instituciones: instNames.sort()
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

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const ExcelJS = require('exceljs');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const noSerialTypes = [
  "Servidor Portable de Aula SITE Sistema Cloud",
  "Soporte Electrónico Pantalla Interactiva Táctil",
  "Carro Cargador de Tabletas",
  "Silla De Mesa interactiva"
];

// --- CONFIGURACIÓN DE VARIABLES DE ENTORNO ---
// Puedes cambiar el JWT_SECRET en el archivo .env o aquí directamente
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

const app = express();

// Middleware para registrar todas las peticiones (Diagnóstico)
app.use((req, res, next) => {
  console.log(`[REQUEST] ${new Date().toISOString()} - ${req.method} ${req.url}`, req.method === 'POST' || req.method === 'PUT' ? req.body : '');
  next();
});

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

// Configuración de Rate Limiting para el Login
// IMPORTANTE: el keyGenerator combina IP + username para que el bloqueo
// sea POR USUARIO y no por IP. Así un intento fallido de "userA" no
// bloquea a "userB" aunque vengan de la misma red/NAT.
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutos
  max: 5, // Máximo 5 intentos por usuario
  // Clave: IP + username en minúsculas (evita distinguir mayúsculas)
  keyGenerator: (req) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const username = (req.body?.username || '').toLowerCase().trim();
    return `${ip}::${username}`;
  },
  message: { error: 'Demasiados intentos fallidos para este usuario. Por favor, inténtalo de nuevo en una hora.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Solo contar como intento fallido cuando la respuesta es 401/403
  // (no penalizar logins exitosos)
  skipSuccessfulRequests: true,
});

// Login de usuario
app.post('/api/auth/login', loginLimiter, async (req, res, next) => {
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

    // Generar Token con el Rol y Flag de Jefe
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, isChief: user.isChief || false },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, username: user.username, role: user.role, isChief: user.isChief || false });

  } catch (err) { next(err); }
});

// Asignar roles a usuarios (Solo disponible para usuarios isChief)
app.post('/api/auth/assign-role', authenticateToken, async (req, res, next) => {
  try {
    // Seguridad: Solo usuarios con el flag isChief pueden acceder
    if (!req.user.isChief) {
      return res.status(403).json({ error: 'Acceso restringido. Solo disponible para personal directivo (isChief).' });
    }

    const { targetUsername, role, isChief } = req.body;

    if (!targetUsername) {
      return res.status(400).json({ error: 'El nombre de usuario es requerido.' });
    }

    if (role && role !== 'admin' && role !== 'lector') {
      return res.status(400).json({ error: 'Rol inválido. Debe ser admin o lector.' });
    }

    const db = await connectDB();
    const collection = db.collection('usuarios');

    // Buscar el usuario de destino
    const targetUser = await collection.findOne({ username: targetUsername.trim() });
    if (!targetUser) {
      return res.status(404).json({ error: `El usuario '${targetUsername}' no existe.` });
    }

    // No permitir modificarse a sí mismo para evitar quitarse sus propios permisos accidentalmente
    if (req.user.username === targetUsername.trim()) {
      return res.status(400).json({ error: 'No puedes modificar tus propios permisos.' });
    }

    const updateData = {};
    if (role) updateData.role = role;
    if (isChief !== undefined) updateData.isChief = !!isChief;

    await collection.updateOne(
      { username: targetUsername.trim() },
      { $set: updateData }
    );

    res.json({ success: true, message: `Permisos actualizados para '${targetUsername.trim()}' con éxito.` });
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
    const { q, tipo, institucion, sede, aula, verificacion } = req.query;
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
  if (institucion) {
    query.institucion = { $regex: new RegExp(`^${institucion.trim()}$`, 'i') };
  }
  if (sede) {
    query.sede = { $regex: new RegExp(`^${sede.trim()}$`, 'i') };
  }
  if (aula) {
    query.aula = { $regex: new RegExp(`^${aula.trim()}$`, 'i') };
  }

  // Filtro especial para auditar equipos temporales (sufijo -1, -2, etc.)
  if (verificacion) {
    query.$or = [
      { placa: { $regex: /-\d+$/ } },
      { serial: { $regex: /-\d+$/ } }
    ];

    if (verificacion === 'pendientes') {
      // Notas vacías o que no contengan palabras clave de verificación
      query.$and = [
        {
          $or: [
            { notas: { $exists: false } },
            { notas: null },
            { notas: "" },
            { notas: { $not: /verificado|revisado|ok/i } },
            { notes: { $exists: false } },
            { notes: null },
            { notes: "" },
            { notes: { $not: /verificado|revisado|ok/i } }
          ]
        }
      ];
    } else if (verificacion === 'verificados') {
      // Notas que sí contengan palabras clave de verificación
      query.$and = [
        {
          $or: [
            { notas: { $regex: /verificado|revisado|ok/i } },
            { notes: { $regex: /verificado|revisado|ok/i } }
          ]
        }
      ];
    }
  }
  
  let cursor = collection.find(query);
  
  // Limitar resultados a 200 cuando no hay ningún filtro de búsqueda específico activo
  // Esto previene la congelación en Chrome al cargar miles de registros a la vez
  const hasFilters = q || tipo || institucion || sede || aula || verificacion;
  if (!hasFilters) {
    cursor = cursor.limit(200);
  }
  
  const results = await cursor.toArray();
  res.json(results);
  } catch (err) { next(err); }
});

// Buscar Duplicados (Agrupación por placa o serial)
app.get('/api/duplicados', authenticateToken, async (req, res, next) => {
  try {
    const { campo, sede, tipo, aula } = req.query; // campo: 'placa' o 'serial'
    
    if (!['placa', 'serial'].includes(campo)) {
      return res.status(400).json({ error: 'Campo de duplicados inválido' });
    }

    const db = await connectDB();
    const collection = db.collection('dispositivos');

    // Valores genéricos que NO deben considerarse duplicados (comunes cuando no hay info)
    const genericValues = [
      "", null, "0", "N/A", "SIN SERIAL", "S/N", "SIN PLACA", "NONE", "NA", ".", "-", "PENDIENTE", "PENDIENTES"
    ];

    const pipeline = [
      // 1. Filtrado inicial
      {
        $match: {
          $and: [
            // Siempre necesitamos que el campo exista
            { [campo]: { $exists: true } },
            // Si includeGeneric es false, quitamos todos los genéricos
            ...(req.query.includeGeneric !== 'true' 
              ? [{ [campo]: { $nin: genericValues } }] 
              : []
            ),
            // EXCLUSIÓN CRÍTICA: Si es búsqueda por serial, quitar Soportes/Carros que tengan serial genérico
            // (Ya que es normal que no tengan serial, no deben ensuciar los resultados)
            ...(campo === 'serial' 
              ? [{
                  $nor: [
                    { 
                      dispositivo: { $regex: /^(Carro Cargador de Tabletas|Soporte Electrónico Pantalla Interactiva Táctil|Servidor Portable de Aula SITE Sistema Cloud|Silla De Mesa interactiva)$/i },
                      $or: [
                        { [campo]: { $in: genericValues } },
                        { [campo]: { $exists: false } }
                      ]
                    }
                  ]
                }]
              : []
            )
          ]
        }
      },
      // 2. Si hay filtro por tipo, aplicarlo
      ...(tipo ? [{ $match: { dispositivo: tipo } }] : []),
      // 3. Normalizar el campo para la agrupación (manejar null/empty)
      {
        $project: {
          dispositivo: 1, aula: 1, placa: 1, serial: 1, institucion: 1, sede: 1, modelo: 1, notas: 1,
          normCampo: { $ifNull: [ { $cond: [ { $eq: [`$${campo}`, ""] }, null, `$${campo}` ] }, "SIN DATO" ] }
        }
      },
      // 4. Agrupar por el valor normalizado
      {
        $group: {
          _id: "$normCampo",
          docs: { $push: "$$ROOT" },
          count: { $sum: 1 }
        }
      }
    ];

    let results = await collection.aggregate(pipeline).toArray();
    
    // 5. Filtrado manual de grupos para determinar qué es un "conflicto"
    results = results.filter(group => {
      const groupVal = group._id?.toString().toUpperCase().trim();
      const isValGeneric = group._id === "SIN DATO" || genericValues.includes(groupVal);
      
      if (!isValGeneric) {
        // Duplicado real: conflicto si hay más de uno
        return group.count > 1;
      } else {
        // Valor genérico/faltante: solo si se solicitó incluirlos
        // El pipeline ya filtró los equipos que NO requieren serial (Soportes/Carros)
        return req.query.includeGeneric === 'true';
      }
    });
    
    // Filtrar por sede si se especifica
    if (sede) {
      results = results.filter(group => 
        group.docs.some(doc => doc.sede?.toLowerCase().includes(sede.toLowerCase()))
      );
    }

    // Filtrar por aula si se especifica
    if (aula) {
      results = results.filter(group => 
        group.docs.some(doc => doc.aula?.toLowerCase().includes(aula.toLowerCase()))
      );
    }

    res.json(results);
  } catch (err) { next(err); }
});

// Obtener aulas únicas, opcionalmente filtradas por sede
app.get('/api/aulas', authenticateToken, async (req, res, next) => {
  try {
    const { sede } = req.query;
    const db = await connectDB();
    const collection = db.collection('dispositivos');
    const query = sede ? { sede: { $regex: new RegExp(`^${sede}$`, 'i') } } : {};
    const aulas = await collection.distinct('aula', query);
    res.json(aulas.filter(a => typeof a === 'string' && a.trim() !== '').sort());
  } catch (err) { next(err); }
});

// Validar unicidad antes de guardar/editar
app.post('/api/validar', async (req, res, next) => {
  try {
    const { placa, serial, id } = req.body;
    const db = await connectDB();
  const collection = db.collection('dispositivos');
  
  const isGeneric = (val) => {
    if (!val) return true;
    const genericValues = ["0", "N/A", "SIN SERIAL", "S/N", "SIN PLACA", "NONE", "NA", ".", "-", "PENDIENTE", "PENDIENTES"];
    return genericValues.includes(val.toString().toUpperCase().trim());
  };

  const query = {
    $or: []
  };
  
  if (placa && !isGeneric(placa)) query.$or.push({ placa });
  if (serial && !isGeneric(serial)) query.$or.push({ serial });
  
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
    const data = {
      ...req.body,
      createdBy: req.user.username,
      updatedBy: req.user.username,
      updatedAt: new Date()
    };
    const result = await collection.insertOne(data);
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
    updateData.updatedBy = req.user.username;
    updateData.updatedAt = new Date();
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
      { header: 'Notas', key: 'notas', width: 35 },
      { header: 'Actualizado Por', key: 'updatedBy', width: 20 }
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
          data.updatedBy = req.user.username;
          data.updatedAt = new Date();
          await collection.updateOne({ _id: existing._id }, { $set: data });
          updates++;
        } else {
          data.createdBy = req.user.username;
          data.updatedBy = req.user.username;
          data.updatedAt = new Date();
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

// --- Endpoint Comparativo Exclusivo para isChief ---
app.get('/api/comparativo', authenticateToken, async (req, res, next) => {
  try {
    // Seguridad: Solo usuarios con el flag isChief pueden acceder
    if (!req.user.isChief) {
      return res.status(403).json({ error: 'Acceso restringido. Solo disponible para personal directivo.' });
    }

    const { sede } = req.query;
    if (!sede) {
      return res.status(400).json({ error: 'Debe especificar una sede.' });
    }

    const db = await connectDB();
    const collection = db.collection('dispositivos');

    // 1. Obtener datos del Excel (Búsqueda robusta para Linux/Docker)
    const fs = require('fs');
    const path = require('path');
    const files = fs.readdirSync(__dirname);
    const fileName = files.find(f => f.toLowerCase() === 'bd aulas site jefe.xlsx');
    
    if (!fileName) {
      return res.status(500).json({ error: `No se encontró el archivo 'BD AULAS SITE JEFE.xlsx' en el servidor. (Archivos presentes: ${files.filter(f => f.endsWith('.xlsx')).join(', ') || 'ninguno'})` });
    }

    const excelPath = path.join(__dirname, fileName);
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.readFile(excelPath);
    const sheet = workbook.getWorksheet('TABLA DINAMICA');
    
    if (!sheet) {
      return res.status(500).json({ error: 'No se encontró la hoja TABLA DINAMICA en el archivo Excel.' });
    }

    // Mapeo de abreviaturas comunes (BD -> Excel)
    const mappingSedes = {
      'ITI': 'INSTITUTO TECNICO INDUSTRIAL',
      'CASD': 'IE CASD',
      'INEM': 'IE INEM',
      'NORMAL': 'ESCUELA NORMAL SUPERIOR',
      'RUFINO SUR': 'IE RUFINO JOSÉ CUERVO SUR',
      'RUFINO CENTRO': 'IE RUFINO CENTRO',
      'NACIONAL': 'IE NACIONAL JESUS MARIA OCAMPO'
    };

    let excelData = null;
    let excelSedeName = '';
    const headers = [];
    const normalizedTarget = sede.trim().toUpperCase();
    const mappedTarget = (mappingSedes[normalizedTarget] || normalizedTarget).toUpperCase();
    
    // Primero, capturar las cabeceras
    const row4 = sheet.getRow(4);
    row4.values.forEach((val, idx) => {
      const headerText = val && typeof val === 'object' && val.result !== undefined ? val.result : val;
      if (headerText) headers[idx] = headerText.toString().trim();
    });

    // Luego, buscar la mejor fila para la sede
    let bestMatch = null;
    let matchType = 0; // 0: none, 1: partial, 2: mapped/exact

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 4) return;
      
      const rowValues = row.values.map(v => (v && typeof v === 'object' && v.result !== undefined ? v.result : v));
      const currentName = rowValues[1] ? rowValues[1].toString().trim().toUpperCase() : '';
      
      if (!currentName) return;

      if (currentName === mappedTarget || currentName === normalizedTarget) {
        bestMatch = rowValues;
        excelSedeName = rowValues[1].toString().trim();
        matchType = 2;
      } else if (matchType < 2 && (currentName.includes(normalizedTarget) || normalizedTarget.includes(currentName))) {
        // Evitar que coincida con "Total General"
        if (currentName !== 'TOTAL GENERAL') {
          bestMatch = rowValues;
          excelSedeName = rowValues[1].toString().trim();
          matchType = 1;
        }
      }
    });

    if (!bestMatch) {
      return res.status(404).json({ error: `Sede '${sede}' no encontrada en el Excel.` });
    }

    excelData = {};
    headers.forEach((header, idx) => {
      if (header && header !== 'Etiquetas de fila' && header !== 'Total general') {
        excelData[header] = parseInt(bestMatch[idx]) || 0;
      }
    });

    // 2. Obtener datos de la DB (Búsqueda inclusiva: Sede o Institución)
    const dbResults = await collection.aggregate([
      { 
        $match: { 
          $or: [
            { sede: { $regex: new RegExp(`^${sede.trim()}$`, 'i') } },
            { institucion: { $regex: new RegExp(`^${sede.trim()}$`, 'i') } }
          ]
        } 
      },
      { $group: { _id: "$dispositivo", count: { $sum: 1 } } }
    ]).toArray();

    const dbData = {};
    dbResults.forEach(item => {
      if (item._id) dbData[item._id] = item.count;
    });

    // 3. Mapeo de nombres de dispositivos (Excel -> DB)
    const mapping = {
      'Carro Cargador de Tabletas': 'Carro Cargador de Tabletas',
      'Pantalla Interactiva Táctil': 'Pantalla Interactiva Táctil',
      'Servidor Portable de Aula SITE Sistema Cloud': 'Servidor Portable de Aula SITE Sistema Cloud',
      'Soporte Electrónico Pantalla Interactiva Táctil': 'Soporte Electrónico Pantalla Interactiva Táctil',
      'Tablet para Docentes': 'Tablet Para Docentes',
      'Tablet para Estudiantes': 'Tablet Para Estudiantes',
      'Mesa interactiva tactil': 'Mesa Interactiva Tactil'
    };

    // 4. Construir respuesta comparativa
    const comparativo = Object.keys(mapping).map(excelName => {
      const dbName = mapping[excelName];
      const excelCount = excelData[excelName] || 0;
      const dbCount = dbData[dbName] || 0;
      return {
        tipo: excelName,
        excel: excelCount,
        db: dbCount,
        diferencia: dbCount - excelCount
      };
    });

    // 5. Fila calculada de Sillas: 4 sillas por cada Mesa Interactiva Tactil de la BD
    const mesasEnDB = dbData['Mesa Interactiva Tactil'] || 0;
    const sillaEsperadas = mesasEnDB * 4;
    const sillaEnDB = dbData['Silla De Mesa interactiva'] || 0;
    comparativo.push({
      tipo: 'Silla De Mesa interactiva',
      excel: sillaEsperadas,
      db: sillaEnDB,
      diferencia: sillaEnDB - sillaEsperadas,
      esCalculado: true
    });

    res.json({ comparativo, excelSede: excelSedeName });
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

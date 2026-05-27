const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || 'inventario_educativo';

async function setup() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('usuarios');
    
    // Crear índice único para el username
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    console.log('Unique index on username created.');
    
    // Crear índices en dispositivos para mejorar el rendimiento de las consultas
    const dispositivosCollection = db.collection('dispositivos');
    await dispositivosCollection.createIndex({ placa: 1 });
    await dispositivosCollection.createIndex({ serial: 1 });
    await dispositivosCollection.createIndex({ sede: 1 });
    await dispositivosCollection.createIndex({ aula: 1 });
    
    console.log('Database setup completed successfully with all indexes.');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.close();
  }
}

setup();

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'inventario_educativo';

async function setup() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('usuarios');
    
    // Crear índice único para el username
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    console.log('Unique index on username created.');
    
    // Opcional: Crear índice para la placa en dispositivos si no existe
    const dispositivosCollection = db.collection('dispositivos');
    await dispositivosCollection.createIndex({ placa: 1 });
    
    console.log('Database setup completed successfully.');
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.close();
  }
}

setup();

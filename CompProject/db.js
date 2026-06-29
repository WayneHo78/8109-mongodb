//db.js
const { MongoClient, ServerApiVersion } = require('mongodb');

let client = null;
let db = null;

async function connect(uri, dbname) {
  // If we already have an active database instance, return it immediately
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    db = client.db(dbname);
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB connection pool:', error);
    throw error; // Rethrow so main app knows the connection failed
  }
}

// Optional: Add a function to gracefully close the connection when the server stops
async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = { connect, close };

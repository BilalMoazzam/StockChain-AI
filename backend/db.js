// backend/db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

let db;

async function connectToDatabase() {
  if (!db) {
    await client.connect();
    db = client.db('clothing_store');
    console.log('✅ MongoDB (native driver) connected');
  }
  return db;
}

module.exports = { connectToDatabase, client };

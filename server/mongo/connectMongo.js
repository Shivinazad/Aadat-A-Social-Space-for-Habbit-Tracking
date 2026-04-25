const mongoose = require('mongoose');

// Reuse connection in serverless and local hot-reload contexts.
const globalMongo = global;
if (!globalMongo.__aadatMongo) {
  globalMongo.__aadatMongo = { conn: null, promise: null };
}

async function connectMongo() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  if (globalMongo.__aadatMongo.conn) {
    return globalMongo.__aadatMongo.conn;
  }

  if (!globalMongo.__aadatMongo.promise) {
    globalMongo.__aadatMongo.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }).then((mongooseInstance) => mongooseInstance);
  }

  globalMongo.__aadatMongo.conn = await globalMongo.__aadatMongo.promise;
  return globalMongo.__aadatMongo.conn;
}

module.exports = connectMongo;

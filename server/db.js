const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    const uri = process.env.MONGODB_URI || (
      process.env.NODE_ENV === 'production'
        ? null
        : 'mongodb://127.0.0.1:27017/thermotwin'
    );

    if (!uri) {
      throw new Error('MONGODB_URI must be configured in production.');
    }

    connectionPromise = mongoose.connect(uri)
      .then((conn) => {
        console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
        return conn.connection;
      })
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = connectDB;

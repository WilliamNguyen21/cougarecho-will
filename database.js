import sql from "mssql";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // For Azure SQL; change based on your needs
    trustServerCertificate: true, // For local development
  },
  //port: parseInt(process.env.DB_PORT, 10),
};

// Global connection pool
let poolPromise = null;

export function getConnectionPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig)
      .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
      })
      .catch(err => {
        console.error('Database connection failed', err);
        poolPromise = null; // Reset the pool if connection fails
        throw err;
      });
  }
  return poolPromise;
}
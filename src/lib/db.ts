import mysql from 'mysql2/promise';

const port = Number(process.env.DB_PORT) || 3306;
const useSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';
const sslCa = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_akademik',
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  ...(useSsl
    ? {
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized,
          ...(sslCa ? { ca: sslCa } : {}),
        },
      }
    : {}),
});

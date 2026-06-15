import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

export default async (): Promise<void> => {
  // Load the test env variables manually to avoid external dependency issues
  const envPath = path.resolve(__dirname, '../.env.test');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    for (const line of envConfig.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Remove surrounding quotes if any
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    }
  }

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5433,
    user: process.env.DB_USER || 'mrn',
    password: process.env.DB_PASSWORD || 'Ping2012',
    database: 'postgres',
  });

  try {
    await client.connect();

    const dbName = process.env.DB_DATABASE || 'bookshare_test_db';
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      console.log(`\nCreating E2E test database: ${dbName}...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    }
  } catch (error) {
    console.error('Failed to ensure test database exists:', error);
  } finally {
    await client.end();
  }
};

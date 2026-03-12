import pkg from "pg";
const { Pool } = pkg;

// ✅ Pool separado para tests
export const testPool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    "postgresql://postgres:postgres@localhost:5432/workers_test"
});

// Limpia y recrea las tablas antes de cada suite de tests
export const setupTestDB = async () => {
  await testPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(150) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_verified BOOLEAN DEFAULT false,
      nickname TEXT UNIQUE,
      role_id INT,
      is_active BOOLEAN DEFAULT true,
      force_password_change BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      level INT NOT NULL
    );

    INSERT INTO roles (name, level) VALUES
    ('super_admin', 100), ('worker', 10)
    ON CONFLICT (name) DO NOTHING;

    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token TEXT NOT NULL,
      ip TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP NOT NULL,
      last_used_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      user_id INT,
      action TEXT NOT NULL,
      resource TEXT,
      resource_id INT,
      ip TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
};

export const cleanTestDB = async () => {
  await testPool.query(`
    TRUNCATE activity_logs, sessions, users RESTART IDENTITY CASCADE
  `);
};

export const closeTestDB = async () => {
  await testPool.end();
};
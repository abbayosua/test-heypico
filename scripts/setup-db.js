// Setup database schema based on environment
// This script runs before prisma generate to switch between SQLite and PostgreSQL

const fs = require('fs');
const path = require('path');

const isVercel = process.env.VERCEL || process.env.CI;
const isPostgres = process.env.DATABASE_URL?.includes('postgres');
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const postgresSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.postgres.prisma');

if (isVercel || isPostgres) {
  console.log('🔧 Detected PostgreSQL environment (Vercel/Neon)');
  console.log('📦 Switching to PostgreSQL schema...');
  
  if (fs.existsSync(postgresSchemaPath)) {
    fs.copyFileSync(postgresSchemaPath, schemaPath);
    console.log('✅ PostgreSQL schema copied successfully');
  } else {
    console.error('❌ PostgreSQL schema not found at:', postgresSchemaPath);
    process.exit(1);
  }
} else {
  console.log('🔧 Detected SQLite environment (local development)');
  console.log('✅ Using SQLite schema');
}

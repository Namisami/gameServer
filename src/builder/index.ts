import { Client } from "pg";
const path = require('path');
const logger = require('pino')();
const fs = require('fs');
const db = require('../../framework/database');

const BASE_DIR = path.join(__dirname, '../');
const MIGRATIONS_DIR = path.join(BASE_DIR, '/migrations');
const MODEL_DIR = path.join(BASE_DIR, '/models');

interface Constraints {
  readonly type?: string
  readonly length?: number
  readonly primary?: boolean
  readonly unique?: boolean
  readonly null?: boolean
}

interface Model {
  [key: string]: Constraints
}

function generateSqlColumn(modelFields: Model, field: string): string {
  const isLast = Object.keys(modelFields).pop() === field ? '' : ',';

  if (typeof modelFields[field] === 'object') {
    const { type } = modelFields[field];
    const len = modelFields[field].length;

    const isPrimary = modelFields[field].primary ? 'PRIMARY KEY' : '';
    const isNull = modelFields[field].null ? '' : 'NOT NULL';
    const isUnique = modelFields[field].unique ? 'UNIQUE' : '';
    const CONSTRAINTS = [isPrimary, isNull, isUnique].filter((constraint) => constraint !== '').join(' ');

    return `\t${field} ${type}${len ? `(${len})` : ''} ${CONSTRAINTS}${isLast}\n`;
  }
  return `\t${field} ${modelFields[field]}${isLast}\n`;
}

async function makeMigration(fileName: string, conn: typeof Client): Promise<void> {
  const migrationName = path.join(MIGRATIONS_DIR, fileName.replace('.json', '.sql'));
  const fileContent = fs.readFileSync(path.join(MODEL_DIR, fileName), { encoding: 'utf8' });
  const modelFields = JSON.parse(fileContent);
  const modelFieldNames = Object.keys(modelFields);

  fs.writeFileSync(migrationName, `CREATE TABLE IF NOT EXISTS ${fileName.replace('.json', '')} (\n`);
  modelFieldNames.forEach((field) => {
    fs.appendFileSync(migrationName, generateSqlColumn(modelFields, field));
  });
  fs.appendFileSync(migrationName, ');');

  await conn.query(fs.readFileSync(path.join(MIGRATIONS_DIR, '/migration1.sql'), { encoding: 'utf8' }));
}

async function makeMigrations(conn: typeof Client): Promise<void> {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  const modelFileNames = fs.readdirSync(MODEL_DIR);
  modelFileNames.forEach(async (fileName: string) => {
    await makeMigration(fileName, conn);
  });
}

async function applyMigrations() {
  try {
    const conn = await db.connect();
    await makeMigrations(conn);
    return logger.info('Migrated successfully!');
  } catch (err) {
    return logger.error(`Migration error: ${err}`);
  }
}

applyMigrations()
  .then(() => process.exit());

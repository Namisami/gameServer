const path = require('path');
const logger = require('pino')();
const fs = require('fs');
const db = require('../../framework/database');

const BASE_DIR = path.join(__dirname, '../');
const MIGRATIONS_DIR = path.join(BASE_DIR, '/migrations');
const MODEL_DIR = path.join(BASE_DIR, '/models');

function generateSqlColumn(modelFields, field) {
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

async function makeMigration(fileName, conn) {
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

async function makeMigrations(conn) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  const modelFileNames = fs.readdirSync(MODEL_DIR);

  return modelFileNames.forEach(async (fileName) => {
    await makeMigration(fileName, conn);
  });
}

async function applyMigrations() {
  try {
    const conn = await db.connect();
    await makeMigrations(conn);
    return logger.info('Migrated successfully!');
  } catch (err) {
    return logger.error(`Migrated with error: ${err}`);
  }
}

applyMigrations()
  .then(() => process.exit());

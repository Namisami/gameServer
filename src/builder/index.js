const path = require('path');
const fs = require('fs');
const db = require('../../framework/database');

const BASE_DIR = path.join(__dirname, '../');
const MIGRATIONS_DIR = path.join(BASE_DIR, '/migrations');

function generateSqlColumn(columns, column) {
  const isLast = Object.keys(columns).pop() === column ? '' : ',';

  if (typeof columns[column] === 'object') {
    const { type } = columns[column];
    const len = columns[column].length;

    const isPrimary = columns[column].primary ? 'PRIMARY KEY' : '';
    const isNull = columns[column].null ? '' : 'NOT NULL';
    const isUnique = columns[column].unique ? 'UNIQUE' : '';
    const CONSTRAINTS = [isPrimary, isNull, isUnique].filter((constraint) => constraint !== '').join(' ');

    return `\t${column} ${type}${len ? `(${len})` : ''} ${CONSTRAINTS}${isLast}\n`;
  }
  return `\t${column} ${columns[column]}${isLast}\n`;
}

function makeMigrations(fileContent) {
  const migrationName = path.join(MIGRATIONS_DIR, '/migration1.sql');
  const parsedFile = JSON.parse(fileContent);
  const modelNames = Object.keys(parsedFile);
  try {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    modelNames.forEach((model) => {
      const columns = parsedFile[model];
      fs.writeFileSync(migrationName, `CREATE TABLE IF NOT EXISTS ${model} (\n`);
      // eslint-disable-next-line no-restricted-syntax
      for (const column in columns) {
        if (column in columns) {
          fs.appendFileSync(migrationName, generateSqlColumn(columns, column));
        }
      }
      fs.appendFileSync(migrationName, ');');
    });
  } catch (err) {
    console.error(err);
  }
}

async function applyMigrations() {
  try {
    const conn = await db.connect();
    makeMigrations(fs.readFileSync(path.join(BASE_DIR, '/models/index.json'), { encoding: 'utf8' }));
    conn.query(await fs.readFileSync(path.join(MIGRATIONS_DIR, '/migration1.sql'), { encoding: 'utf8' }));
    return console.log('Directory created successfully!');
  } catch (err) {
    return console.error(err);
  }
}

applyMigrations();

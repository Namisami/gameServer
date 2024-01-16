const { Client } = require('pg');
require('dotenv').config();

async function connect() {
  const connection = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  await connection.connect()
    .then(() => {
      console.log('Connected to PostgreSQL database!');
    })
    .catch((err) => console.error('Error connecting to the database:', err));

  return connection;
}

module.exports = {
  connect() { return connect(); },
};

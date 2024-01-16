const createApp = require('../framework');
require('./models');

// eslint-disable-next-line max-len
// try { await client.connect(); console.log('Connected to PostgreSQL database!'); } catch (err) { console.error('Error connecting to the database:', err); }

const app = createApp();
app.createRoute('/books', 'GET', JSON.stringify({ message: 'books' }, null, 4));
app.createRoute('/authors', 'GET', JSON.stringify({ message: 'authors' }, null, 4));
app.run();

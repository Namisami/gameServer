const createApp = require('../framework');
require('./models');

const app = createApp();
app.createRoute('/books', 'GET', JSON.stringify({ message: 'books' }, null, 4));
app.createRoute('/authors', 'GET', JSON.stringify({ message: 'authors' }, null, 4));
app.run();

const createApp = require('../framework');
const logger = require('pino')();
import playersController from "./controllers/playersController";
// require('./models');

const app = createApp();
app.createRoute('/players', playersController());
// app.createRoute('/books', 'GET', JSON.stringify({ message: 'books' }, null, 4));
// app.createRoute('/authors', 'GET', JSON.stringify({ message: 'authors' }, null, 4));
app.run();

const http = require('http');
const logger = require('pino')();
// const db = require('./database');
require('dotenv').config();

function App() {
  this.routes = [];
  this.createRoute = (url, method, callback) => {
    this.routes.push({ url, method, callback });
  };
  this.run = async (port = process.env.SERVER_PORT || 8000, host = process.env.SERVER_HOST || 'localhost') => {
    // const conn = db.connect();

    const requestListener = (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      const route = this.routes.find((routesItem) => req.url === routesItem.url);
      if (route) {
        res.writeHead(200);
        res.end(route.callback);
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Page not found' }, null, 4));
      }
    };

    const server = http.createServer(requestListener);
    server.listen(port, host, () => {
      logger.info(`Server is running on http://${host}:${port}`);
    });
  };
  return this;
}

function createApp() {
  return App();
}

module.exports = createApp;

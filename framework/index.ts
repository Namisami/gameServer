import { IncomingMessage, ServerResponse } from "http";

import http from 'http';
const logger = require('pino')();
const db = require('./database');
require('dotenv').config();

interface Route {
  url: string
  method: string
  callback: () => void
}

interface AppI {
  routes: Route[]
  createRoute: (url: string, method: string, callback: () => void) => void
  run: () => void
}

function App(): AppI {
  const routes: Route[] = [];
  const createRoute = (url: string, method: string, callback: () => void) => {
    routes.push({ url, method, callback });
  };
  const run = async (port = process.env.SERVER_PORT || 8000, host = process.env.SERVER_HOST || 'localhost') => {
    const conn = db.connect();
    if (typeof port !== 'number') {
      port = parseInt(port);
    }

    const requestListener = (req: IncomingMessage, res: ServerResponse) => {
      res.setHeader('Content-Type', 'application/json');

      const route = routes.find((routesItem: Route) => req.url === routesItem.url);
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
  return {
    routes,
    createRoute,
    run
  };
}

module.exports = App;

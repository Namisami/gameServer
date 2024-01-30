import { IncomingMessage, ServerResponse } from "http";
import http from 'http';
const logger = require('pino')();
const db = require('./database');
require('dotenv').config();

import RouteI from "./types/route";
import AppI from "./types/app";
import ControllerI from "./types/controller";


function App(): AppI {
  const routes: RouteI[] = [];
  const createRoute = (url: string, controller: Required<ControllerI>) => {
    if (!controller) {
      return logger.error('BAD CONTROLLER')
    }
    let method = '';
    let callback = () => {};

    for (let route in controller) {
      switch(route) {
        case 'get':
          method = 'GET';
          callback = () => controller.get();
          break;
        case 'post':
          method = 'POST';
          callback = () => controller.post();
          break;
        default:
          logger.warn('WRONG ROUTE')
          throw new Error('Wrong route')
      }
    }
    routes.push({ url, method, callback });
  };
  // const createRoute = (url: string, method: string, callback: () => void) => {
  //   routes.push({ url, method, callback });
  // };
  const run = async (port = process.env.SERVER_PORT || 8000, host = process.env.SERVER_HOST || 'localhost') => {
    const conn = db.connect();
    if (typeof port !== 'number') {
      port = parseInt(port);
    }
    const requestListener = (req: IncomingMessage, res: ServerResponse) => {
      // let body = "";
      // req.on("data", data => {
      //   body += data;
      // });
      // req.on("end", () => {
      //   body = JSON.parse(body);
      //   console.log(body);
      // });

      const chunks: any[] = [];

      req.on('readable', () => {
        let chunk: any;
        while (null !== (chunk = req.read())) {
          chunks.push(chunk);
        }
      });

      req.on('end', () => {
        const content = chunks.join('');
        console.log(content);
      }); 

      res.setHeader('Content-Type', 'application/json');
      const route = routes.find((routesItem: RouteI) => req.url === routesItem.url);
      if (route) {
        res.writeHead(200);
        res.end(route.callback());
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

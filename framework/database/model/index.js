const logger = require('pino')();

function createModel(obj) {
  logger.info(obj);
}

module.exports = createModel;

const fs = require('fs');
const path = require('path');

const db = {};

  fs.readdirSync(__dirname).forEach((moduleName) => {
    if (fs.lstatSync(path.join(__dirname, moduleName)).isDirectory()) {
      if (fs.existsSync(path.join(__dirname, moduleName, 'index.js'))) {
        logger.info(`Loading module ${moduleName}`);
        const module = require(path.join(__dirname, moduleName, 'index.js'));
        
        db[module.name] = module;
      }
    }
  });

module.exports = db;
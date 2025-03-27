const fs = require('fs');
const path = require('path');

const regex = /^(\d+)\.([A-Za-z0-9]+)$/;
const logger = global.logger;
  fs.readdirSync(__dirname).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  .forEach((moduleName) => {
    if (fs.lstatSync(path.join(__dirname, moduleName)).isDirectory()) {
      if (fs.existsSync(path.join(__dirname, moduleName, 'index.js'))) {
        const match = moduleName.match(regex);
        if (match) {
          const num = match[1];
          const alpha = match[2];
          logger.info(`Loading module ${alpha}`);
          const module = require(path.join(__dirname, moduleName, 'index.js'));
          modules.set(module.name, {module: module, basePath: path.join(__dirname, moduleName)});
        } else {
          logger.error(`Module ${moduleName} does not match the expected format. Skipping.`);
        }
      }
    }
  });

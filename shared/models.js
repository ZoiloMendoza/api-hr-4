'use strict';

const fs = require('fs');
const path = require('path');
const { sequelize } = helpers;
const db = {};

function readModels(dir) {
    fs.readdirSync(dir).filter(file => {
        return (
          file.indexOf('.') !== 0 &&
          file.slice(-3) === '.js' &&
          file.indexOf('.test.js') === -1
        );
      })
      .forEach(file => {
        logger.info(`Loading model: ${file}`);
        const model = require(path.join(dir, file))(sequelize.sequelize, sequelize.Sequelize.DataTypes);
        logger.info(path.join(dir, file));
        db[model.name] = model; 
      });
      fs.readdirSync(dir).filter(file => {
        return fs.lstatSync(path.join(dir, file)).isDirectory();
      })
      .forEach(file => {
        readModels(path.join(dir, file));
      });
}

// Load models from module directories
Object.keys(modules).forEach(moduleName => {
    const modelsDir = path.join(__dirname, '..', 'modules', moduleName, 'models');

    if (fs.existsSync(modelsDir)) {
        logger.info(`Loading models for module ${moduleName}`);
        readModels(modelsDir);
    }
});

// Load server models
if (fs.existsSync(path.join(__dirname, '..', 'server', 'models'))) {
    logger.info('Loading project models');
    readModels(path.join(__dirname, '..', 'server', 'models'));
}

// Set up model associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
});

// Allow modules to register virtual models
Object.keys(modules).forEach(moduleName => {
    const module = modules[moduleName];
    if (typeof module.exportModels === 'function') {
        logger.info(`Exporting virtual models for module ${moduleName}`);
        module.exportModels(db);
    }
});

db.sequelize = sequelize.sequelize;
db.Sequelize = sequelize.Sequelize;
  
module.exports = db;

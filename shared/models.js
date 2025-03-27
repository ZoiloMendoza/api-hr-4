'use strict';

const fs = require('fs');
const path = require('path');
const { sequelize } = helpers;

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
        logger.trace(path.join(dir, file));
        models[model.name.toLowerCase() ] = model; 
      });
      fs.readdirSync(dir).filter(file => {
        return fs.lstatSync(path.join(dir, file)).isDirectory();
      })
      .forEach(file => {
        readModels(path.join(dir, file));
      });
}

if (!models) {
    logger.info('Initializing models'); 
    global.models = {};
}

// Load models from module directories
for (const [moduleName, mod] of modules) {  
    const modelsDir = path.join(mod.basePath, 'models');
    if (fs.existsSync(modelsDir)) {
        logger.info(`Loading models for module ${moduleName}`);
        readModels(modelsDir);
    }
};

// Load server models
if (fs.existsSync(path.join(__dirname, '..', 'server', 'models'))) {
    logger.info('Loading project models');
    readModels(path.join(__dirname, '..', 'server', 'models'));
}

// Set up model associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
});


models.sequelize = sequelize.sequelize;
models.Sequelize = sequelize.Sequelize;
  

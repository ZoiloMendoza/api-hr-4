const fs = require("fs");
const path = require("path");

const db = {};


scandDir = (dir) => {
    if (!fs.existsSync(dir)) {
        return;
    }
    fs
    .readdirSync(dir)
    .forEach(file => {
        if (fs.lstatSync(path.join(dir  , file)).isDirectory()) {
            scandDir(path.join(dir, file));
        } else {
            if (
                file.slice(-3) === '.js' &&
                file.indexOf('.test.js') === -1
                ) {                
                    //const vName = file.substring(0, file.lastIndexOf('.'));   
                    const validator = require(path.join(dir, file));
                    if (validator && validator.name) {
                        if (db[validator.name]) {
                            throw new Error(`Validator ${validator.name} already loaded`);
                        }
                        logger.info(`Loading validator: ${validator.name}`);
                    
                        db[validator.name] = validator;
                        logger.info(`Validator ${validator.name} loaded`);
                    }
                }
            }
    });
}

Object.keys(modules).forEach(moduleName => {
    const module = modules[moduleName];
    logger.info(`Loading validators for module ${moduleName}`);
    scandDir(path.join(__dirname, '..', 'modules', moduleName, 'validators'));
});

if (fs.existsSync(path.join(__dirname, '..', 'server', 'validators'))) {
    logger.info('Loading project validators');
    scandDir(path.join(__dirname, '..', 'server', 'validators'));
}

module.exports = db;
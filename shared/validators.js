const fs = require("fs");
const path = require("path");

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
                        if (validators[validator.name]) {
                            throw new Error(`Validator ${validator.name} already loaded`);
                        }
                        logger.info(`Loading validator: ${validator.name}`);
                    
                        validators[validator.name] = validator;
                        logger.info(`Validator ${validator.name} loaded`);
                    }
                }
            }
    });
}

for (const [moduleName, mod] of modules) {
    logger.info(`Loading validators for module ${moduleName}`);
    scandDir(path.join(mod.basePath, 'validators'));
};

if (fs.existsSync(path.join(__dirname, '..', 'server', 'validators'))) {
    logger.info('Loading project validators');
    scandDir(path.join(__dirname, '..', 'server', 'validators'));
}

const fs = require("fs");
const path = require("path");

const db = {};

// Function to scan directories for service files
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
                file.indexOf('.') !== 0 &&
                file.slice(-3) === '.js' &&
                file.indexOf('.test.js') === -1
                ) {                
                    logger.info(`Loading service file: ${file}`);
                    const service = require(path.join(dir, file));
                    if (service && service.name) {
                        if (db[service.name + "Service"]) {
                            throw new Error(`Service ${service.name} already loaded`);
                        }                    
                        db[service.name + "Service"] = service;
                        logger.info(`Service ${service.name}Service loaded`);
                    }
                }
            }
    });
}

// Load services using file scan
Object.keys(modules).forEach(moduleName => {
    const module = modules[moduleName];
    logger.info(`Loading services for module ${moduleName}`);
    scandDir(path.join(__dirname, '..', 'modules', moduleName, 'services'));
});

if (fs.existsSync(path.join(__dirname, '..', 'server', 'services'))) {
    logger.info('Loading project services');
    scandDir(path.join(__dirname, '..', 'server', 'services'));
}

// Allow modules to explicitly export services (for virtual/computed services)
Object.keys(modules).forEach(moduleName => {
    const module = modules[moduleName];
    if (typeof module.exportServices === 'function') {
        logger.info(`Exporting services for module ${moduleName}`);
        module.exportServices(db);
    }
});

module.exports = db;
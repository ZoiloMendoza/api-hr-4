const fs = require("fs");
const path = require("path");

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
                    //console.log(service)
                    if (service && service.name) {
                        if (services[service.name + "Service"]) {
                            throw new Error(`Service ${service.name} already loaded`);
                        }                    
                        services[service.name + "Service"] = service;
                        logger.info(`Service ${service.name}Service loaded`);
                    }
                }
            }
    });
}
if (!services) {
    logger.info('Initializing services');
    global.services = {};
}

// Load services using file scan
for (const [moduleName, mod] of modules) {
    logger.info(`Loading services for module ${moduleName}`);
    scandDir(path.join(mod.basePath, 'services'));
};

if (fs.existsSync(path.join(__dirname, '..', 'server', 'services'))) {
    logger.info('Loading project services');
    scandDir(path.join(__dirname, '..', 'server', 'services'));
}

const fs = require('fs');
const path = require('path');
const BaseController = require('./base-controller');

class BaseModule {

    loadControllers(cPath) {
            if (fs.existsSync(cPath)) {
                logger.info("Loading controllers from: " + cPath);
                fs.readdirSync( cPath).forEach(file => {
                    if (fs.lstatSync(path.join(cPath, file)).isDirectory()) {
                        this.loadControllers(path.join(cPath, file));
                    } else {
                        if (file.endsWith('.js')) { 
                            const controller = require(path.join(cPath, file));
                            logger.info("Including controller file: " + path.join(cPath, file));
                            if (controller instanceof BaseController) {
                                this.controllers.push(controller.getApp());
                            } else {
                                this.controllers.push(controller);
                            }
                        }   
                    }    
                });
            }
    }

    constructor(name) {
        this.name = name;
        this.controllers = [];
        this.services = {};
    }
        
}
module.exports = BaseModule;
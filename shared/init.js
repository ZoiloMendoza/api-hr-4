require("dotenv").config();
global.logger = require("./helpers/logger");
global.i18n = require("./middleware/i18n");


const DEBUG=true;
const SILENTLOGS=true;

if (!DEBUG) {
    if (SILENTLOGS) {
        console.log = function() {};
    } else {
        console.log = function(...args) {
            logger.error("console.log should be replaced with logger methods");
            logger.info("args were: " +  args.join(" "));
        };
    }
}


module.exports = async () => { 
    global.helpers = require("./helpers/");
    global.modules = new Map();
    global.models = {};
    global.services = {};
    global.validators = {};

    require("../modules/");
    require("./models");
    require("./services");
    require("./validators");
};
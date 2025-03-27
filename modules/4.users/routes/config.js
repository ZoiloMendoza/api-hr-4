const { BaseController } = helpers;
const { user } = models;
const validator = require('../validators/firstconfig');
const {  companyService, userService } = services;

class ConfigController extends BaseController{
    constructor(){
        super("firstconfig");
        this.neededROLE = false;

         user.count(). then((numUsers) => {
            if (numUsers === 0){
                validator.setValidation(true);
                logger.info("First configuration needed");
                this.addRoute("post", "/firstconfig", this.firstconfig);
            } else {
                validator.setValidation(false);
                logger.info("First configuration not needed");
                this.addRoute("post", "/firstconfig", this.notfirstconfig);
            }
        });
        this.setValidator(validator);
    }

    firstconfig = async (req, res) => {
        logger.info("First configuration");
        let company = null;
        let u = null;
        try {
            company = await companyService.createFirstCompany(req.input.company );
            u = await userService.createFirstUser(company.id, req.input.username);
        } catch (error) {
            return res.status(500).json([req.__('generic error', error.toString())]);
        }
        return res.status(200).json(u);
    }

    notfirstconfig = async (req, res) => {
        return res.status(401).json([req.__("serever already configured")]);
    }
}

module.exports = new ConfigController();
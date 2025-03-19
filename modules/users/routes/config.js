const { BaseController } = helpers;
const { User } = models;
const validator = require('../validators/firstconfig');
const {  companiesService, usersService } = services;

class ConfigController extends BaseController{
    constructor(){
        super("firstconfig");
        this.neededROLE = false;

         User.count(). then((numUsers) => {
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
        let user = null;
        try {
            company = await companiesService.createFirstCompany(req.input.company );
            user = await usersService.createFirstUser(company.id, req.input.username);
        } catch (error) {
            return res.status(500).json([req.__('generic error', error.toString())]);
        }
        return res.status(200).json(user);
    }

    notfirstconfig = async (req, res) => {
        return res.status(401).json([req.__("serever already configured")]);
    }
}

module.exports = new ConfigController();
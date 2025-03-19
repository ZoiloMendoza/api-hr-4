const { BaseController, entityErrors } = helpers;
const JWT = require('jsonwebtoken');

const {usersService} = services;

const validator = require('../validators/login');


class LoginController extends BaseController{

	login = async (req, res) => {
		let body = req.input;
		try {
			const user = await usersService.getUserByUsernameAndPassword(body.username, body.password, false);
			if (!user) {
					return res.status(401).json([req.__("entity not found", "Usuario")]);
			}
			let toSign = { user };
	
			let token = JWT.sign(toSign, process.env.JWT_SEED, { expiresIn: process.env.JWT_LIFESPAN });
			res.json({
					user,
					token
			});	
		} catch (error) {
			if (error instanceof entityErrors.EntityNotFoundError) {
				return res.status(401).json([error.message]);
			}
			return res.status(500).json([req.__('generic error', error.toString())]);
		}
	}

	requestPasswordReset = async (req, res) => {
        const { email } = req.input;
        try {
            const sendEmail = await usersService.requestPasswordReset(email);
            res.json(sendEmail);
        } catch (error) {
            if (error instanceof entityErrors.EntityNotFoundError) {
                return res.status(401).json([error.message]);
            }
            return res
                .status(500)
                .json([res.__('generic error', error.toString())]);
        }
    };

	constructor(){
		super();
		this.neededROLE = false;
		this.setValidator(validator);
		this.addRoute("post", "/login", this.login);
		this.addRoute(
            'post',
            '/request-password-reset',
            this.requestPasswordReset,
        );
	}
}

module.exports = new LoginController();

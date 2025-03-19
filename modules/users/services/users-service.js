'use strict';
const { User, Role,  Company } = models;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { CRUDService, entityErrors } = helpers;
const JWT = require('jsonwebtoken');
const { Op } = require('sequelize');


class UserService extends CRUDService {
    constructor() {
        super(User);
    }

    generatePassword(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}<>?';
        let password = '';
    
        for (let i = 0; i < length; i++) {
            const randomIndex = crypto.randomInt(0, chars.length);
            password += chars[randomIndex];
        }
       // logger.info(`Generated password: ${password}`);
        return password;
    }    

    toJson(user) {
        const json = super.toJson(user);
        delete json.password;
        return json;
    }

    async createFirstUser(companyId, username) {
        logger.info(`Creating first user for company ${companyId} `);
        const ucount = await User.count({ where: { companyId: companyId } });
        if (ucount > 0) {
            throw new error(i18n.__('entity already exists', 'Usuario'));
        }
        const password = this.generatePassword();
        const user = {
            username: username,
            password: bcrypt.hashSync(password, 10),
            companyId: companyId,
            fullname: username,
            active: true,
        };
        const u = await User.create(user);
        const roles = await Role.findAll    ({
            where: { name: { 
                [Op.in]: [process.env.COMPANYADMIN_ROLE, process.env.SYSADMIN_ROLE] 
            }},
        });
        logger.info(`Roles: ${roles}`);
        await u.addRoles(roles);    
        return {user: this.toJson(u), password: password};
    }

    async createUser(user) {
        user.password = bcrypt.hashSync(user.password, 10);
        return this.toJson(super.create(user));
    }

    async requestPasswordReset(email) {
        const user = await this.getUserByUsername(email);
        
        if (!user) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Usuario'));
        }
        let toSign = { user: this.toJson(user) };
        const resetToken = JWT.sign(toSign, process.env.JWT_SEED, {
            expiresIn: '1h',
        });

        const resetLink = `https://gvdoral.bitfarm.mx/web/reset-password/${resetToken}`;
        /*
        const mailBody = emailTemplate(resetLink);

        const response = await sendMail(
            'zmendoza@bitfarm.com.mx',
            null,
            'Reset Password',
            mailBody,
        );

        if (response?.rejected.length > 0) {
            throw new EntityNotFoundError(i18n.__('email not sent'));
        }
        */
        return email;
    }

 
    async getUserByUsername(username, auth=true) {
        
        const   where = { username: username, active: true };
        
        if (auth) {
            const loggedUser = await this.getLoggedUser();
            where.companyId = loggedUser.company.id;
        }

        return  User.findOne({
                where,
                include: [{
                    model: Role,
                    through: { attributes: [] },
                    attributes: ['name'],
                    as: 'roles'
                },
                {
                    model: Company,
                    attributes: ['id', 'name'],
                    as: 'company',
                }
            ]
            })
    }

    async getUserByUsernameAndPassword(username, password, auth=true) {
        const u = await this.getUserByUsername(username, auth);
        if (!u) {
            return null;
        }
        if (!bcrypt.compareSync(password, u.password)) {
            throw new entityErrors.EntityNotFoundError(i18n.__('invalid password'));
        }
        return this.toJson(u);
    }

    async changePassword(userId, newPassword) {
        const loggedUser = this.getLoggedUser();
        const user = await User.findOne({userId, companyId: loggedUser.company.id});
        if (!user) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Usuario'),
            );
        }
        user.password = bcrypt.hashSync(newPassword, 10);
        await user.save();
        return this.toJson(user);
    }
}

module.exports = new UserService();

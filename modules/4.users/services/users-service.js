'use strict';
const { user, role, company } = models;
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { CRUDService, entityErrors } = helpers;
const JWT = require('jsonwebtoken');
const { Op } = require('sequelize');


class UserService extends CRUDService {
    constructor() {
        super(user);
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

    toJson(u) {
        const json = super.toJson(u);
        delete json.password;
        return json;
    }

    async createFirstUser(companyId, username) {
        logger.info(`Creating first user for company ${companyId} `);
        const ucount = await user.count({ where: { companyId: companyId } });
        if (ucount > 0) {
            throw new error(i18n.__('entity already exists', 'Usuario'));
        }
        const password = this.generatePassword();
        const u = {
            username: username,
            password: bcrypt.hashSync(password, 10),
            companyId: companyId,
            fullname: username,
            active: true,
        };
        const uDb = await user.create(u);
        const roles = await role.findAll({
            where: {
                name: {
                    [Op.in]: [process.env.COMPANYADMIN_ROLE, process.env.SYSADMIN_ROLE]
                }
            },
        });
        logger.info(`Roles: ${roles}`);
        await uDb.addRoles(roles);
        return { user: this.toJson(uDb), password: password };
    }

    async createUser(u) {
        u.password = bcrypt.hashSync(u.password, 10);
        return this.toJson(super.create(u));
    }

    async requestPasswordReset(email) {
        const u = await this.getUserByUsername(email);

        if (!u) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Usuario'));
        }
        let toSign = { u: this.toJson(user) };
        const resetToken = JWT.sign(toSign, process.env.JWT_SEED, {
            expiresIn: '1h',
        });

        const resetLink = `https://gvdoral.bitfarm.mx/web/reset-password/${resetToken}`;
        return email;
    }


    async getUserByUsername(username, auth = true) {

        const where = { username: username, active: true };

        if (auth) {
            const loggedUser = await this.getLoggedUser();
            where.companyId = loggedUser.company.id;
        }

        return user.findOne({
            where,
            include: [{
                model: role,
                through: { attributes: [] },
                attributes: ['name'],
                as: 'roles'
            },
            {
                model: company,
                attributes: ['id', 'name'],
                as: 'company',
            }
            ]
        })
    }

    async getUserByUsernameAndPassword(username, password, auth = true) {
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
        const u = await user.findOne({ userId, companyId: loggedUser.company.id });
        if (!u) {
            throw new entityErrors.EntityNotFoundError(
                i18n.__('entity not found', 'Usuario'),
            );
        }
        u.password = bcrypt.hashSync(newPassword, 10);
        await u.save();
        return this.toJson(u);
    }
}

module.exports = new UserService();

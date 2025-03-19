const context = require('./context');
const { EntityNotFoundError } = require('./entity-errors');

class BaseService {
    getLoggedUser() {
        const currentUser = context.get('user');
        if (!currentUser) {
            throw new EntityNotFoundError(i18n.__('entity not found', 'Usuario'));
        }
        return currentUser;
    }

    constructor(name) {
        this.name = name;
    }
}

module.exports = BaseService;
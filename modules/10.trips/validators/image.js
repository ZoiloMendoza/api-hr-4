const { BaseValidator } = helpers;

class ImageValidator extends BaseValidator {
    constructor() {
        super('image');
        this.routes.get['/img/:id'] = false
    }
}

module.exports = new ImageValidator();
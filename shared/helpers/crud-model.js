const { Model } = require("sequelize");

class CRUDModel extends Model {
    static privateFields = {"active": true, "updatedAt": true, "createdAt": true};
    static excludeField(fieldName) {
        //copy the object, to reflect in subclass only
        this.privateFields = { ...this.privateFields };
        this.privateFields[fieldName] = true;
    }
    static isExcluded(fieldName) {
        return this.privateFields[fieldName];
    }
}

module.exports = CRUDModel;

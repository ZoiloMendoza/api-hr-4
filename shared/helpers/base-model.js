const { Model } = require("sequelize");

class BaseModel extends Model {
    static getValidator() {
        return validators[this.name.toLowerCase()];
    }    
}

module.exports = BaseModel;

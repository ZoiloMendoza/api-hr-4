const { DataTypes } = require('sequelize');
const { logger } = require('sequelize/lib/utils/logger');

class CrudJsonType extends DataTypes.JSON {
  constructor(model, isArray = false) {
    super();
    this.model = model;
    this.isArray = isArray;
    this.key = this.constructor.key + "_CRUD";    
  }
  
  validate(value, options) {
    return super.validate(value, options);
  }
  
  stringify(value) {
    if (value === null) return null;
    return JSON.stringify(value);
  }
  
  parse(value) {    
    return JSON.parse(value);
  }
}

module.exports = CrudJsonType;
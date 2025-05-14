const Joi = require('joi');
const BaseValidator = require('./base-validator');
const { mapSequelizeTypeToJoi } = require('./joyutils');
const { Utils } = require('sequelize');

const noValidate = ['id', 'active', 'companyId', 'createdAt', 'updatedAt'];

class CRUDValidator extends BaseValidator {
    modelName = null;

    constructor(model) {
        super(model.name.toLowerCase());
        this.omitRequired = {};
        this.forceRequired = {};
        this.model = model;
        this.schema = this.generateSchema();
        this.modelName = model.name.toLowerCase();

        this.routes.post[`/${this.modelName}`] = this.genValidator();
        this.routes.put[`/${this.modelName}/:id`] = this.genPutValidator();
        this.routes.get[`/${this.modelName}/:id`] = false;
        this.routes.get[`/${Utils.pluralize(this.modelName)}`] = false;
        this.routes.delete[`/${this.modelName}/:id`] = false;
    }

    addFieldValidation(field, validation) {
        const schemaDescription = this.schema.describe();

        // Check if field exists in the schema
        const hasField = schemaDescription.keys && field in schemaDescription.keys;
        // Extract the existing schema for the field
        this.schema = hasField
            ? this.schema.keys({
                  [field]: this.schema.extract(field).concat(validation),
              })
            : this.schema.keys({
                  [field]: validation,
              });
    }

    generateSchema() {
        const joiSchema = {};
        logger.info('Generating Joi schema for Sequelize model ' + this.model.name.toLowerCase());
        // Iterate over each field in the Sequelize model
        for (const [field, definition] of Object.entries(this.model.rawAttributes)) {
            if (!noValidate.includes(field)) {
                let joiFieldSchema = mapSequelizeTypeToJoi(field, definition);

                // Add the field schema to the final Joi schema
                joiSchema[field] = joiFieldSchema;
            }
        }

        // Return the final Joi schema
        return Joi.object(joiSchema).options({ stripUnknown: true });
    }
}

module.exports = CRUDValidator;

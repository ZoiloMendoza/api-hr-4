const BaseValidator = require('./base-validator');
const { mapSequelizeTypeToJoi } = require('./joyutils');
const Joi = require('joi');

class SequelizeValidator extends BaseValidator {
    joiSchema = null;

    constructor(model, fields, isList = false) {
      super(`${model.name.toLowerCase()}-${fields.join('-')}`);
        const joiFields = {};

        for (let field of fields) {
            if (!model.rawAttributes[field]) {
                throw new Error(`Field ${field} not found in model ${model.name.toLowerCase()}`);
            }
            const definition = model.rawAttributes[field];
            
            let joiFieldSchema = mapSequelizeTypeToJoi(
                    field,
                    definition,
            );

                // Add the field schema to the final Joi schema
            joiFields[field] = joiFieldSchema;
        }

        // Return the final Joi schema
        if (isList) {
          this.joiSchema = Joi.array().items(Joi.object(joiFields)).options({ stripUnknown: true });
        } else {
          this.joiSchema = Joi.object(joiFields).options({ stripUnknown: true });
        }
    }

    genValidator() {
        return async (req, res, next) => {
          const { error, value } = this.joiSchema.validate(req.body, {
            abortEarly: false,
          });
    
          if (error) {
            return res
              .status(400)
              .json(error.details.map((detail) => detail.message));
          }
    
          // Attach the validated and sanitized data to req.validatedData
          req.input = value;
          return next(); // Proceed to the next middleware or route handler
        };
      }
    

}

module.exports = SequelizeValidator;
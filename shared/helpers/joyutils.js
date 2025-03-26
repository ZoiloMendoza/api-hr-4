const { DataTypes } = require('sequelize');
const Joi = require('joi');

function joiToPeg(joiSchema) {
    // Base case: depending on the type of Joi schema, convert it to PEG.js rules
    if (joiSchema.isJoi) {
      const type = joiSchema.type;
  
      switch (type) {
        case 'object':
          return generateObjectRule(joiSchema);
        case 'array':
          return generateArrayRule(joiSchema);
        case 'string':
          return generateStringRule(joiSchema);
        case 'number':
          return generateNumberRule(joiSchema);
        case 'boolean':
          return 'Boolean = "true" / "false"';
        default:
          return `/* Unsupported Joi type: ${type} */`;
      }
    }
    return '';
  }

  // Convert Joi object schema to PEG.js rule
function generateObjectRule(joiSchema) {
    logger.info('Generating object rule');
    const keys = joiSchema._inner.children;
    let pegRule = 'Object = "{ " ';
    const keyRules = [];
  
    keys.forEach((keyObj) => {
      const keyName = keyObj.key;
      const keySchema = keyObj.schema;
      const keyPegRule = `${keyName} ":" ${joiToPeg(keySchema)}`;
      keyRules.push(keyPegRule);
    });
  
    pegRule += keyRules.join(' ", " ') + ' " }"';
    return pegRule;
  }
  
  // Convert Joi array schema to PEG.js rule
  function generateArrayRule(joiSchema) {
    logger.info('Generating array rule');
    const items = joiSchema._inner.items.map((item) => joiToPeg(item)).join(' / ');
    return `Array = "[ " ${items} (", " ${items})* " ]"`;
  }
  
  // Convert Joi string schema to PEG.js rule
  function generateStringRule(joiSchema) {
    logger.info('Generating string rule');
    const rules = [];
  
    // Handle valid values, if any
    const valids = joiSchema._valids ? joiSchema._valids._set : [];
    if (valids.size > 0) {
      rules.push([...valids].map((val) => `"${val}"`).join(' / '));
    } else {
      rules.push('String = "\"" [a-zA-Z0-9 ]* "\""');
    }
  
    return rules.join(' ');
  }
  
  // Convert Joi number schema to PEG.js rule
  function generateNumberRule(joiSchema) {
    logger.info('Generating number rule');
    const min = joiSchema._flags.min ? joiSchema._flags.min : '';
    const max = joiSchema._flags.max ? joiSchema._flags.max : '';
  
    let rule = 'Number = [0-9]+';
    if (min || max) {
      rule = `Number = [0-9]+ { return parseInt(text(), 10); }`;
      if (min) rule += ` { if (parseInt(text(), 10) < ${min}) throw new Error("Number too small"); }`;
      if (max) rule += ` { if (parseInt(text(), 10) > ${max}) throw new Error("Number too large"); }`;
    }
  
    return rule;
  }
  

  function mapSequelizeTypeToJoi(field, definition) {
          const sequelizeType = definition.type;
          let joiSchema;
  
          switch (sequelizeType.key) {
              case DataTypes.STRING.key:
                  joiSchema = Joi.string().messages({
                      'string.base': i18n.__('error.validation.string', field),
                  });
                  break;
              case DataTypes.INTEGER.key:
                  joiSchema = Joi.number()
                      .integer()
                      .messages({
                          'number.integer': i18n.__(
                              'error.validation.string',
                              field,
                          ),
                      });
                      break;
              case DataTypes.FLOAT.key:
                  joiSchema = Joi.number().messages({
                      'number.base': i18n.__('error.validation.string', field),
                  });
                  break;
              case DataTypes.BOOLEAN.key:
                  joiSchema = Joi.boolean().messages({
                      'boolean.base': i18n.__('error.validation.string', field),
                  });
                  break;
              case DataTypes.DATE.key:
                  joiSchema = Joi.date().messages({
                      'date.base': i18n.__('error.validation.string', field),
                  });
                  break;
              // Add other type mappings as necessary
              case DataTypes.ENUM.key:
                  joiSchema = Joi.string()
                      .valid(...sequelizeType.values)
                      .messages({
                          'string.base': i18n.__(
                              'error.validation.string',
                              field,
                          ),
                          'any.only': i18n.__(
                              'error.validation.only',
                              field,
                              sequelizeType.values.join(', '),
                          ),
                      });
                  break;
              case DataTypes.DECIMAL.key:
                  joiSchema = Joi.number().messages({
                      'number.base': i18n.__('error.validation.string', field),
                  });
                  break;
              case "JSON_CRUD":
                  //chanhe me
                  joiSchema = Joi.string().messages({
                      'string.base': i18n.__('error.validation.string', field),
                  });
                  break;
              case DataTypes.VIRTUAL.key:
                  // Virtual fields should not be sent!
                  joiSchema = Joi.forbidden();
                  break;
              default:
                  throw new Error(
                      `Unsupported Sequelize type: ${sequelizeType.key}`,
                  );
          }

        // Add additional Sequelize validations to Joi schema
        if (definition.allowNull === false) {
          joiSchema = joiSchema.required().messages({
              ...joiSchema.describe().flags?.messages,
              'any.required': i18n.__(
                  'error.validation.required',
                  field,
              ),
          });
        }

      if (definition.validate) {
        if (definition.validate.len) {
          joiSchema = joiSchema
                .min(definition.validate.len[0])
                .max(definition.validate.len[1]);
            logger.error('Missing validors for len');
        }

        if (definition.validate.isEmail) {
          joiSchema = joiSchema.email().messages({
                ...joiSchema.describe().flags?.messages,
                'string.email': i18n.__(
                    'error.validation.email',
                    field,
                ),
            });
        }
      }

          return joiSchema;
      }
  
  
  module.exports = { joiToPeg, mapSequelizeTypeToJoi };
class BaseValidator {
  schema = null;
  routes = {
    get: {},
    post: {},
    put: {},
    delete: {},
  };

  schemas = {
    get: {},
    post: {},
    put: {},
    delete: {},
  };
  name = null;

  validate(method, path, item) {
    if (!this.schemas[method][path]) {
      return item;
    }
    const { error, value } = this.schemas[method][path].validate(item, {
      abortEarly: false,
    });

    if (error) {
      return null;
    }
    return value;
  }

  addSchema(method, path, schema) {
    this.schemas[method][path] = schema;
    this.routes[method][path] = this.genValidator(schema);
  }

    genValidator(schema = this.schema) {
    return async (req, res, next) => {
      const { error, value } = schema.validate(req.body, {
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

  constructor(name) {
    if (!name) {
      throw new Error("Name is required for BaseValidator");
    }
    this.name = name;
    
  }
}

module.exports = BaseValidator;

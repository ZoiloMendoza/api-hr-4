const express = require("express");
const { EntityNotFoundError, DeleteRestrictionError, DuplicateEntityError } = require("./entity-errors");
const { accessVerify } = require("../middleware/security-middleware");
const routeMatcher = require("./route-matcher");

class BaseController {
  app = null;
  validator = null;
  neededROLE = null;

  constructor() {
    this.app = express();
  }

  setNeededRole(role) {
    this.neededROLE = role;
  }

  getApp() {
    return this.app;
  }

  setValidator(validator) {
    this.validator = validator;
  }

  throwError(error, req, res, errorType = 500) {
    if (error instanceof EntityNotFoundError) {
      return res.status(404).json([req.__(error.message)]);
    }
    if (error instanceof DeleteRestrictionError) {
      return res.status(409).json([req.__(error.message)]);
    }
    if (error instanceof DuplicateEntityError) {
      return res.status(409).json([req.__(error.message)]);
    }
    if (error.errors && (error.errors.length > 0) && error.errors[0].message) {
      return res
        .status(errorType)
        .json(error.errors.map((err) => err.message).map(req.__));
    }
    return res.status(errorType).json([req.__(error.message)]);
  }

  validateRoute(op, route, val) {
    if (!this.validator.routes) {
      this.validator.routes = {};
    }
    if (!this.validator.routes[op]) {
      this.validator.routes[op] = {};
    }
    this.validator.routes[op][route] = val;
  }

  getMiddlewares(operation, route) {
    const mwares = [];
    const op = operation.toLowerCase();
    if (!this.validator || !this.validator.routes || !this.validator.routes[op]) {
      logger.warn(`No validation found for ${operation} ${route}`);
    } else {
      if (!this.validator.routes[op][route]) {
        if (this.validator.routes[op][route] !== false) {
          logger.warn(`No validation found for ${operation} ${route}`);
        }
      } else {
        mwares.push(this.validator.routes[operation.toLowerCase()][route]);
      }
    }
    if (this.neededROLE) {
      mwares.push(accessVerify(this.neededROLE));
    } else {
      if (this.neededROLE !== false) {
        logger.warn("No role needed for this route");
      }
    }
    return mwares;
  }

  deleteRoute(method, route) {
    logger.info(`Deleting ${method} route for ${route}`);
    this.app._router.stack = this.app._router.stack.filter(layer => {
      return !(layer.route &&
        layer.route.path === route &&
        layer.route.methods[method]);
    });
  }

  replaceRoute(methrod, route, handler) {
    logger.info(`Replacing ${methrod} route for ${route}`);
    this.deleteRoute(methrod, route);
    this.addRoute(methrod, route, handler);
  }

  addRoute(method, route, handler) {
    logger.info(`Adding ${method} route for ${route}`);
    const mwares = this.getMiddlewares(method, route);
    routeMatcher.addPath(method + "/" + route, { middlewares: mwares, handler });
    this.app[method](route, mwares, handler);
  }

}

module.exports = BaseController;

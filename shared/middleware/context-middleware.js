const { context } = require('../helpers/');

function storeUserMiddleware(req, res, next) {
  context.runWithContext(() => {
    context.set('user', req.user);
    next();
  });
}

module.exports = storeUserMiddleware;

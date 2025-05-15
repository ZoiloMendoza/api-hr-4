const { CRUDValidator } = helpers;
const { productorder } = models;

class ProductorderValidator extends CRUDValidator {}

module.exports = new ProductorderValidator(productorder);

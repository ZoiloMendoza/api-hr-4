const { CRUDValidator } = helpers;
const { paymenttype } = models;

class PaymenttypeValidator extends CRUDValidator {}

module.exports = new PaymenttypeValidator(paymenttype);

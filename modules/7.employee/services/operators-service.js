const { operator } = models;
const { CRUDService } = helpers;

class OperatorsService extends CRUDService {
    constructor() {
        super(operator);
    }

    //METODO PARA ACTUALIZAR STATUS DE OPERADOR
    //ANTES DE CAMBIAR STATUS, DEBEMOS REVISAR QUE NO ESTE ASIGNADO A UN VEHICULO
}
module.exports = new OperatorsService();

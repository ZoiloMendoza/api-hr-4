'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Elimina la columna "type" de la tabla "Employees"
        await queryInterface.removeColumn('Employees', 'type');
    },

    async down(queryInterface, Sequelize) {
        // Vuelve a agregar la columna "type" en caso de rollback
        await queryInterface.addColumn('Employees', 'type', {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                isIn: {
                    args: [['operator', 'operations']],
                    msg: 'Type must be either "operator" or "operations"',
                },
            },
        });
    },
};

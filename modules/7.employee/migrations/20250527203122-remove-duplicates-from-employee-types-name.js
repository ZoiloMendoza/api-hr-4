'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Eliminar todos los registros de la tabla 'employees' que dependen de 'EmployeeTypes'
        await queryInterface.sequelize.query(`
            DELETE FROM Employees
            WHERE employeeTypeId IS NOT NULL;
        `);

        // Eliminar todos los registros de la tabla 'EmployeeTypes'
        await queryInterface.sequelize.query(`
            DELETE FROM EmployeeTypes;
        `);
    },

    async down(queryInterface, Sequelize) {
        // No se puede revertir la eliminación de todos los registros
    },
};

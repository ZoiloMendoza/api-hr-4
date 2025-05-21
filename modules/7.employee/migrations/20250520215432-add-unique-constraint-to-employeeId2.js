'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Eliminar la columna employeeId
        await queryInterface.removeColumn('Operators', 'employeeId');

        // Volver a crear la columna employeeId con la restricción de unicidad
        await queryInterface.addColumn('Operators', 'employeeId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true, // Agregar restricción de unicidad
            references: {
                model: 'Employees',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Eliminar la columna employeeId
        await queryInterface.removeColumn('Operators', 'employeeId');

        // Volver a crear la columna employeeId sin la restricción de unicidad
        await queryInterface.addColumn('Operators', 'employeeId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: false, // Sin restricción de unicidad
            references: {
                model: 'Employees',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    },
};

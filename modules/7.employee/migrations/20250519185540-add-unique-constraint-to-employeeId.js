'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Operators', 'employeeId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: true,
            references: {
                model: 'Employees',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn('Operators', 'employeeId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            unique: false,
            references: {
                model: 'Employees',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    },
};

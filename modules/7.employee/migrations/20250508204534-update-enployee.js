'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('Employees', 'employeeTypeId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'EmployeeTypes',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        });

        await queryInterface.addColumn('Employees', 'paymentTypeId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'PaymentTypes',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        });

        await queryInterface.addColumn('Employees', 'salary', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.0,
        });

        await queryInterface.addColumn('Employees', 'commission', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0.0,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('Employees', 'employeeTypeId');

        await queryInterface.removeColumn('Employees', 'paymentTypeId');

        await queryInterface.removeColumn('Employees', 'salary');

        await queryInterface.removeColumn('Employees', 'commission');
    },
};

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Agregar el campo `username`
        await queryInterface.addColumn('AuditLogs', 'username', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        // Agregar el campo `companyId`
        await queryInterface.addColumn('AuditLogs', 'companyId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Companies',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    },

    async down(queryInterface, Sequelize) {
        // Eliminar el campo `username`
        await queryInterface.removeColumn('AuditLogs', 'username');

        // Eliminar el campo `companyId`
        await queryInterface.removeColumn('AuditLogs', 'companyId');
    },
};

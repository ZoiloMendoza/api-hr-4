'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('AuditLogs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            entityName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            entityId: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            oldData: {
                type: Sequelize.JSON,
            },
            newData: {
                type: Sequelize.JSON,
            },
            userId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.fn('NOW'),
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('AuditLogs');
    },
};

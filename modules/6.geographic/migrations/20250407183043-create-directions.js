'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Directions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            idCountry: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Countries',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            n2: {
                type: Sequelize.STRING,
            },
            n3: {
                type: Sequelize.STRING,
            },
            n4: {
                type: Sequelize.STRING,
            },
            n5: {
                type: Sequelize.STRING,
            },
            postalCode: {
                type: Sequelize.STRING(10),
            },
            lat: {
                type: Sequelize.DECIMAL(10, 8),
            },
            lng: {
                type: Sequelize.DECIMAL(11, 8),
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Directions');
    },
};

'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Clients', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            companyId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Companies',
                    key: 'id',
                },
        	onUpdate: 'CASCADE',
        	onDelete: 'CASCADE',
            },
            addresses: {
                type: Sequelize.JSON,
                validate: {
                    isValidAddressesArray(value) {
                        const validator = validators.addres;
                        const { error } = validator.schema.validate(value, { abortEarly: false });
                        if (error) {
                          throw new Error(`Address validation failed: ${error.message}`);
                        }
                    },
                },
                defaultValue: [],
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
        await queryInterface.dropTable('Catalogs');
    },
};

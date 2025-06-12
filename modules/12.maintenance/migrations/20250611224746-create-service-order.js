'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ServiceOrders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      folio: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      vehicleMileage: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'Kilometraje del vehiculo al momento de abrir la orden de servicio',
      },
      spareParts: {
        type: Sequelize.JSON,
        defaultValue: [],
        comment: 'Lista de refacciones y/o productos comprados',
      },
      supplier: {
        type: Sequelize.STRING,
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      status: {
        type: Sequelize.ENUM('open', 'released', 'closed'),
        allowNull: false,
        defaultValue: 'open',
      },
      maintenanceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Maintenances',
            key: 'id',
        },
        onUpdate: 'CASCADE',
      },
      serviceRefId: {
        type: Sequelize.STRING,
        allowNull: true,
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
      vehicleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Vehicles',
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ServiceOrders');
  }
};
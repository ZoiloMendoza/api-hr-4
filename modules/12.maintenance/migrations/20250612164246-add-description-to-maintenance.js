'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Maintenances', 'description', {
      type: Sequelize.STRING,
  });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Maintenances', 'description');
  }
};

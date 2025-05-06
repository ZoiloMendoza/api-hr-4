'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.sequelize.query(`
            UPDATE \`Clients\`
            SET \`addresses\` = JSON_ARRAY()
            WHERE \`addresses\` IS NOT NULL;
        `);
    },

    async down(queryInterface, Sequelize) {},
};

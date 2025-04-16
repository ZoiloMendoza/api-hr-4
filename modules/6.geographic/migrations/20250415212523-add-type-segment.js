'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Agregar la columna 'type' con valores ENUM
        await queryInterface.addColumn('Segments', 'type', {
            type: Sequelize.ENUM('free', 'toll', 'optimal'), // Valores en inglés
            allowNull: false, // No permitir valores NULL
            defaultValue: 'optimal', // Valor por defecto
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revertir la migración eliminando la columna y el tipo ENUM
        await queryInterface.removeColumn('Segments', 'type');
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_Segments_type";',
        ); // Eliminar el tipo ENUM
    },
};

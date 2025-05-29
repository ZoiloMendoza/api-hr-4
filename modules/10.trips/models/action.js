'use strict';

module.exports = (sequelize, DataTypes) => {
    class Action extends helpers.BaseModel {
        static associate(models) {
            // Aquí puedes definir asociaciones si es necesario
        }
    }

    Action.init(
        {
            refId: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            count: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 1,
            },
            orderIndex: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        {
            sequelize,
            tableName: false,
            timestamps: false,
            modelName: 'Action',
        },
    );

    return Action;
};

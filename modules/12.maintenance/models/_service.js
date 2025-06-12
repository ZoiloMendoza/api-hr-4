'use strict';

module.exports = (sequelize, DataTypes) => {
    class Service extends helpers.BaseModel {
        static associate(models) {}
    }

    Service.init(
        {
            refId: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            frequencyKm: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 0,
            },
            description: {
                type: DataTypes.STRING,
            },
        },
        {
            sequelize,
            tableName: false,
            timestamps: false,
            modelName: 'Service',
        },
    );

    return Service;
};

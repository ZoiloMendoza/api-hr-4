'use strict';

module.exports = (sequelize, DataTypes) => {
    class SparePart extends helpers.BaseModel {
        static associate(models) {}
    }

    SparePart.init(
        {
            refId: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
                comment: 'Nombre de la refaccion',
            },
            cost: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.0,
                comment: 'Costo de la refacccion',
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Cantidad de refacciones',
            }
        },
        {
            sequelize,
            tableName: false,
            timestamps: false,
            modelName: 'SparePart',
        },
    );

    return SparePart;
};

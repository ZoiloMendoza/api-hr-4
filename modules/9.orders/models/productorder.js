'use strict';
module.exports = (sequelize, DataTypes) => {
    class ProductOrder extends helpers.CRUDModel {
        static associate(models) {
            ProductOrder.belongsTo(models.order, {
                foreignKey: 'orderId',
                as: 'order',
            });
            ProductOrder.belongsTo(models.catalog, {
                foreignKey: 'productId',
                as: 'product',
            });
        }
    }

    ProductOrder.init(
        {
            weight: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.0,
                comment: 'Peso de la mercancía por unidad',
            },
            value: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0.0,
                comment: 'Valor del flete en pesos mexicanos',
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: true,
                defaultValue: 0,
                comment: 'Cantidad de productos',
            },
            orderId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Orders',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'ID del pedido relacionado',
            },
            productId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Catalogs',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
                comment: 'ID del producto relacionado',
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'ProductOrder',
        },
    );

    return ProductOrder;
};

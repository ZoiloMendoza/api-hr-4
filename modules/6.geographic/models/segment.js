module.exports = (sequelize, DataTypes) => {
    class Segment extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Segment.belongsTo(models.company, {
                foreignKey: 'companyId',
                as: 'company',
            });

            Segment.belongsTo(models.location, {
                foreignKey: 'origin',
                as: 'originLocation',
            });

            Segment.belongsTo(models.location, {
                foreignKey: 'destination',
                as: 'destinationLocation',
            });

            Segment.belongsToMany(models.route, {
                through: 'RouteSegment',
                foreignKey: 'segmentId',
                otherKey: 'routeId',
                as: 'routes',
            });
        }
    }

    Segment.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            origin: {
                type: DataTypes.INTEGER,
            },
            destination: {
                type: DataTypes.INTEGER,
            },
            kms: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            tollBoothsAmount: {
                type: DataTypes.DECIMAL(10, 2),
                defaultValue: 0,
            },
            companyId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Segment',
        },
    );

    return Segment;
};

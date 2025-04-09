module.exports = (sequelize, DataTypes) => {
    class Location extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Location.hasMany(models.segment, {
                foreignKey: 'origin',
                as: 'originSegments',
            });
            Location.hasMany(models.segment, {
                foreignKey: 'destination',
                as: 'destinationSegments',
            });
        }
    }

    Location.init(
        {
            directionN3: {
                type: DataTypes.STRING,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
            },
            lat: {
                type: DataTypes.DECIMAL(10, 8),
            },
            lng: {
                type: DataTypes.DECIMAL(11, 8),
            },
            active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'Location',
        },
    );

    return Location;
};

module.exports = (sequelize, DataTypes) => {
    class Direction extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Direction.belongsTo(models.country, {
                foreignKey: 'idCountry',
                as: 'country',
            });
        }
    }

    Direction.init(
        {
            idCountry: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            n2: {
                type: DataTypes.STRING,
            },
            n3: {
                type: DataTypes.STRING,
            },
            n4: {
                type: DataTypes.STRING,
            },
            n5: {
                type: DataTypes.STRING,
            },
            postalCode: {
                type: DataTypes.STRING(10),
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
            modelName: 'Direction',
        },
    );

    return Direction;
};

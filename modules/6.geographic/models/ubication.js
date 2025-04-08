module.exports = (sequelize, DataTypes) => {
    class Ubication extends helpers.CRUDModel {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // Define associations here
        }
    }

    Ubication.init(
        {
            directionN2: {
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
            modelName: 'Ubication',
        },
    );

    return Ubication;
};

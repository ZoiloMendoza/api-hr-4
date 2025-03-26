'use strict';

module.exports = (sequelize, DataTypes) => {
  class Address extends helpers.BaseModel {
    static associate(models) {
    }
  }
  
  Address.init(
    {
    street: {
      type: DataTypes.STRING,
      allowNull: false
    },
    number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    line2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullAddress: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.street} ${this.number}, ${this.city}, ${this.state}, ${this.country}`;
      }
    }
  }, {
    // This makes it a virtual model not tied to a database table
    sequelize,
    tableName: false,
    timestamps: false,
    modelName: 'Address'
  });
  
  return Address;
};
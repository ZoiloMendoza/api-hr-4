'use strict';
const { models } = global;
const { Op } = require('sequelize');

class CompanyStats extends helpers.CRUDModel {
  // Define virtual attributes that will be calculated
  static virtualAttributes = {
    userCount: true,
    activeUserCount: true,
    lastActivity: true,
    resourceUsage: true
  };

  // This is a virtual model, not tied to a database table
  static init(sequelize) {
    super.init(
      {
        // Reference to the actual company
        companyId: {
          type: DataTypes.INTEGER,
          primaryKey: true
        },
        // Company name for convenience
        name: {
          type: DataTypes.VIRTUAL,
          get() {
            return this.company ? this.company.name : null;
          }
        },
        // Computed property for total user count
        userCount: {
          type: DataTypes.VIRTUAL,
          async get() {
            if (!this._userCount) {
              this._userCount = await models.User.count({
                where: { companyId: this.companyId }
              });
            }
            return this._userCount;
          }
        },
        // Computed property for active user count
        activeUserCount: {
          type: DataTypes.VIRTUAL,
          async get() {
            if (!this._activeUserCount) {
              this._activeUserCount = await models.User.count({
                where: { 
                  companyId: this.companyId,
                  active: true
                }
              });
            }
            return this._activeUserCount;
          }
        },
        // Computed property for last activity date
        lastActivity: {
          type: DataTypes.VIRTUAL,
          async get() {
            if (!this._lastActivity) {
              const lastActiveUser = await models.User.findOne({
                where: { companyId: this.companyId },
                order: [['updatedAt', 'DESC']],
                attributes: ['updatedAt']
              });
              this._lastActivity = lastActiveUser ? lastActiveUser.updatedAt : null;
            }
            return this._lastActivity;
          }
        },
        // Complex computed property for resource usage
        resourceUsage: {
          type: DataTypes.VIRTUAL,
          async get() {
            if (!this._resourceUsage) {
              // Calculate various resource counts
              const [catalogCount, parameterCount, clientCount] = await Promise.all([
                models.Catalog.count({ where: { companyId: this.companyId } }),
                models.Parameter.count({ where: { companyId: this.companyId } }),
                models.Client.count({ where: { companyId: this.companyId } })
              ]);

              this._resourceUsage = {
                catalogs: catalogCount,
                parameters: parameterCount,
                clients: clientCount,
                total: catalogCount + parameterCount + clientCount
              };
            }
            return this._resourceUsage;
          }
        }
      },
      {
        sequelize,
        modelName: 'CompanyStats',
        tableName: null, // No actual table
        timestamps: false
      }
    );

    return CompanyStats;
  }

  static associate(models) {
    CompanyStats.belongsTo(models.Company, {
      foreignKey: 'companyId',
      as: 'company'
    });
  }

  // Factory method to create instances from company data
  static async fromCompany(company) {
    const stats = new CompanyStats();
    stats.companyId = company.id;
    stats.company = company;
    
    // Pre-load computed properties if needed
    await stats.userCount;
    await stats.activeUserCount;
    await stats.lastActivity;
    await stats.resourceUsage;
    
    return stats;
  }

  // Method to get stats for all companies
  static async getAllStats() {
    const companies = await models.Company.findAll({
      where: { active: true }
    });
    
    return Promise.all(companies.map(company => CompanyStats.fromCompany(company)));
  }
}

module.exports = (sequelize, DataTypes) => {
  return CompanyStats.init(sequelize, DataTypes);
};
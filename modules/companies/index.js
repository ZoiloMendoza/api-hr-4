const { BaseModule } = helpers;

const myself = new BaseModule("companies");

// Register services
myself.exportServices = (services) => {
    services.companyService = require('./services/company/company-service');
    services.companyStatsService = require('./services/company/company-stats-service');
};

// Register virtual models
myself.exportModels = (models) => {
    // Register the CompanyStats virtual model
    const { sequelize } = helpers;
    models.CompanyStats = require('./models/company-stats')(
        sequelize.sequelize, 
        sequelize.Sequelize.DataTypes
    );
};

module.exports = myself;
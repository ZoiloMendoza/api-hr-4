'use strict';
const { CompanyStats, Company } = models;
const { BaseService } = helpers;

class CompanyStatsService extends BaseService {
    constructor() {
        super('CompanyStats');
    }

    /**
     * Get stats for the current user's company
     * @returns {Promise<Object>} Company stats data
     */
    async getCurrentCompanyStats() {
        const loggedUser = this.getLoggedUser();
        const company = await Company.findByPk(loggedUser.company.id);
        
        if (!company) {
            throw new helpers.entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Company'));
        }
        
        return CompanyStats.fromCompany(company);
    }

    /**
     * Get stats for all companies (admin only)
     * @returns {Promise<Array>} Stats for all companies
     */
    async getAllCompanyStats() {
        const loggedUser = this.getLoggedUser();
        
        // Check if user has admin role
        const hasAdminRole = loggedUser.roles.some(role => 
            role.name === process.env.SYSADMIN_ROLE);
        
        if (!hasAdminRole) {
            throw new helpers.entityErrors.UnauthorizedError(i18n.__('unauthorized'));
        }
        
        return CompanyStats.getAllStats();
    }

    /**
     * Get stats for a specific company
     * @param {number} companyId - Company ID
     * @returns {Promise<Object>} Company stats
     */
    async getStatsForCompany(companyId) {
        const loggedUser = this.getLoggedUser();
        
        // Check if user has admin role or belongs to the requested company
        const hasAdminRole = loggedUser.roles.some(role => 
            role.name === process.env.SYSADMIN_ROLE);
        
        if (!hasAdminRole && loggedUser.company.id !== parseInt(companyId)) {
            throw new helpers.entityErrors.UnauthorizedError(i18n.__('unauthorized'));
        }
        
        const company = await Company.findByPk(companyId);
        
        if (!company) {
            throw new helpers.entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Company'));
        }
        
        return CompanyStats.fromCompany(company);
    }
}

module.exports = new CompanyStatsService();
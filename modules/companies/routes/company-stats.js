'use strict';
const { BaseController, entityErrors } = helpers;
const { companyStatsService } = services;

class CompanyStatsController extends BaseController {
    constructor() {
        super();
        
        // Set access control - only users with company admin or system admin roles can access
        this.setNeededRole([process.env.COMPANYADMIN_ROLE, process.env.SYSADMIN_ROLE]);
        
        // Configure routes
        this.addRoute('get', '/company-stats/current', this.getCurrentCompanyStats);
        this.addRoute('get', '/company-stats/all', this.getAllCompanyStats);
        this.addRoute('get', '/company-stats/:id', this.getCompanyStats);
    }

    /**
     * Get stats for current user's company
     */
    getCurrentCompanyStats = async (req, res) => {
        try {
            const stats = await companyStatsService.getCurrentCompanyStats();
            return res.json(stats);
        } catch (error) {
            return this.handleError(error, req, res);
        }
    }

    /**
     * Get stats for all companies (admin only)
     */
    getAllCompanyStats = async (req, res) => {
        try {
            const stats = await companyStatsService.getAllCompanyStats();
            return res.json(stats);
        } catch (error) {
            return this.handleError(error, req, res);
        }
    }

    /**
     * Get stats for a specific company
     */
    getCompanyStats = async (req, res) => {
        try {
            const stats = await companyStatsService.getStatsForCompany(req.params.id);
            return res.json(stats);
        } catch (error) {
            return this.handleError(error, req, res);
        }
    }

    /**
     * Handle common error patterns
     */
    handleError(error, req, res) {
        if (error instanceof entityErrors.EntityNotFoundError) {
            return res.status(404).json([req.__(error.message)]);
        } else if (error instanceof entityErrors.UnauthorizedError) {
            return res.status(401).json([req.__(error.message)]);
        }
        logger.error(`Error in company stats controller: ${error.message}`);
        return res.status(500).json([req.__('generic error', error.toString())]);
    }
}

module.exports = new CompanyStatsController();
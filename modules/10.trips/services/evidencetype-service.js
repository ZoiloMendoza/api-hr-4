'use strict';
const { evidencetype } = models;
const { CRUDService, entityErrors } = helpers;
const crypto = require('crypto');
class EvidencetypesService extends CRUDService {
    constructor() {
        super(evidencetype);
    }

    async updateEvidenceTypeActionByRefId(evidenceTypeId, actionRefId, updatedAction) {
        const evidenceTypeDb = await this.readById(evidenceTypeId);
        if (!evidenceTypeDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Tipo de Evidencia'));
        }

        if (!evidenceTypeDb.actions) {
            evidenceTypeDb.actions = [];
        }

        const actionIndex = evidenceTypeDb.actions.findIndex((action) => action.refId === actionRefId);

        if (actionIndex === -1) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Acción'));
        }

        evidenceTypeDb.actions[actionIndex] = {
            ...evidenceTypeDb.actions[actionIndex],
            ...updatedAction,
        };

        await this.update(evidenceTypeId, evidenceTypeDb);

        return {
            ...evidenceTypeDb.actions[actionIndex],
            id: actionRefId,
        };
    }

    async addEvidenceTypeAction(evidenceTypeId, newAction) {
        const evidenceTypeDb = await this.readById(evidenceTypeId);
        if (!evidenceTypeDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Tipo de Evidencia'));
        }

        if (!evidenceTypeDb.actions) {
            evidenceTypeDb.actions = [];
        }

        newAction.refId = crypto.randomBytes(8).toString('hex');

        evidenceTypeDb.actions.push(newAction);

        await this.update(evidenceTypeId, evidenceTypeDb);

        return {
            ...newAction,
            id: newAction.refId,
        };
    }

    async deleteEvidenceTypeActionByRefId(evidenceTypeId, actionRefId) {
        const evidenceTypeDb = await this.readById(evidenceTypeId);
        if (!evidenceTypeDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Tipo de Evidencia'));
        }

        if (!evidenceTypeDb.actions) {
            evidenceTypeDb.actions = [];
        }

        const actionIndex = evidenceTypeDb.actions.findIndex((action) => action.refId === actionRefId);

        if (actionIndex === -1) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Acción'));
        }

        const deletedAction = evidenceTypeDb.actions[actionIndex];

        evidenceTypeDb.actions.splice(actionIndex, 1);

        await this.update(evidenceTypeId, evidenceTypeDb);

        return {
            ...deletedAction,
            id: actionRefId,
        };
    }

    async getEvidenceTypeActions(evidenceTypeId) {
        const evidenceTypeDb = await this.readById(evidenceTypeId);
        if (!evidenceTypeDb) {
            throw new entityErrors.EntityNotFoundError(i18n.__('entity not found', 'Tipo de Evidencia'));
        }

        if (!evidenceTypeDb.actions) {
            evidenceTypeDb.actions = [];
        }

        return evidenceTypeDb.actions.map((action) => ({
            ...action,
            id: action.refId,
            evidenceTypeId: evidenceTypeId,
        }));
    }
}
module.exports = new EvidencetypesService();

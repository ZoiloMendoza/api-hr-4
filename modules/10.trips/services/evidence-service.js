const { evidence, evidencephoto, trip, evidencetype } = models;
const { CRUDService, entityErrors } = helpers;

class EvidencesService extends CRUDService {
    constructor() {
        super(evidence);
    }

    async createEvidenceWithPhotos({ evidenceTypeId, tripId, evidencePhoto = [] }, user) {

        const loggedUser = user; //zmm
        if (!loggedUser) {
            throw new entityErrors.UnauthorizedError('Usuario no encontrado');
        }
        const tripRecord = await trip.findOne({
            where: { id: tripId, companyId: loggedUser.company.id, active: true },
        });

        if (!tripRecord) {
            throw new entityErrors.EntityNotFoundError('El viaje especificado no existe');
        }

        const evidenceTypeRecord = await evidencetype.findOne({
            where: { id: evidenceTypeId, active: true },
            attributes: ['name'],
        });

        if (!evidenceTypeRecord) {
            throw new entityErrors.EntityNotFoundError('El tipo de evidencia especificado no existe');
        }

        let existingEvidence = await this.model.findOne({
            where: { evidenceTypeId, tripId, active: true },
        });

        if (!existingEvidence) {
            existingEvidence = await this.model.create({ evidenceTypeId, tripId });
            if (services.auditlogService) {
                await services.auditlogService.createLog({
                    entityName: this.model.name,
                    entityId: existingEvidence.id,
                    action: 'create',
                    oldData: null,
                    newData: existingEvidence,
                    userId: loggedUser.id,
                    username: loggedUser.username,
                    companyId: loggedUser.company.id,
                });
            }
        }

        const photos = [];
        for (const photo of evidencePhoto) {
            const { description, actionRefId, imgFile } = photo;
            if (!imgFile) continue;
            const buffer = Buffer.isBuffer(imgFile) ? imgFile : Buffer.from(imgFile, 'base64');
            const createdPhoto = await services.evidencephotoService.uploadEvidencePhoto(buffer, {
                evidenceId: existingEvidence.id,
                description,
                actionRefId,
            }, loggedUser);
            if (services.auditlogService) {
                await services.auditlogService.createLog({
                    entityName: services.evidencephotoService.model.name,
                    entityId: createdPhoto.id,
                    action: 'create',
                    oldData: null,
                    newData: createdPhoto,
                    userId: loggedUser.id,
                    username: loggedUser.username,
                    companyId: loggedUser.company.id,
                });
            }
            photos.push(createdPhoto);
        }

        const evidenceType = { name: evidenceTypeRecord.name };
        let evidence = this.toJson(existingEvidence);
        return { ...evidence, photos, evidenceType };
    }

    async getTripEvidenceWithPhotos(tripId, q, user) {
        const loggedUser = user; //zmm
        if (!loggedUser) {
            throw new entityErrors.UnauthorizedError('Usuario no encontrado');
        }

        const tripRecord = await trip.findOne({
            where: { id: tripId, companyId: loggedUser.company.id, active: true },
        });
        if (!tripRecord) {
            throw new entityErrors.EntityNotFoundError('El viaje especificado no existe');
        }

        const includeOpts = [
            {
                model: evidencephoto,
                as: 'photos',
                attributes: { exclude: ['active', 'createdAt', 'updatedAt', 'companyId'] },
                where: { active: true },
                required: false,
            },
        ];

        const { rows, count } = await this.findAndCountAllCustom({
            include: includeOpts,
            where: { tripId },
            offset: q.start,
            limit: q.limit,
            order: [[q.orderBy, q.order]],
            filter: q.filter,
        });

        return { rows, count };
    }
}
module.exports = new EvidencesService();

const { evidence } = models;
const { CRUDService } = helpers;

class EvidencesService extends CRUDService {
    constructor() {
        super(evidence);
    }

    async createEvidenceWithPhotos({ evidenceTypeId, tripId, evidencePhoto = [] }) {
        const created = await this.create({ evidenceTypeId, tripId });
        const photos = [];
        for (const photo of evidencePhoto) {
            const { description, actionRefId, imgFile } = photo;
            if (!imgFile) continue;
            const buffer = Buffer.isBuffer(imgFile) ? imgFile : Buffer.from(imgFile, 'base64');
            const createdPhoto = await services.evidencephotoService.uploadEvidencePhoto(buffer, {
                evidenceId: created.id,
                description,
                actionRefId,
            });
            photos.push(createdPhoto);
        }
        return { ...created, photos };
    }
}
module.exports = new EvidencesService();

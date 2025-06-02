const { evidencephoto } = models;
const { CRUDService, entityErrors } = helpers;
const crypto = require('crypto');
const S3Plugin = require('../../../server/plugins/s3');

class EvidencephotosService extends CRUDService {
    constructor() {
        super(evidencephoto);
        this.s3 = new S3Plugin({
            region: process.env.S3_REGION || 'bhs',
            accessKeyId: process.env.S3_ACCESS_KEY_ID || 'default',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'default',
            endpoint: process.env.S3_ENDPOINT || 'https://s3.amazonaws.com',
            bucketName: process.env.S3_BUCKET_NAME || 'default-bucket',
        });
    }

    async uploadEvidencePhoto(file, { evidenceId, description, actionRefId }) {
        if (!file || !Buffer.isBuffer(file)) {
            throw new entityErrors.EntityNotFoundError('El archivo debe ser un buffer válido');
        }

        const name = `img-${crypto.randomUUID()}`;
        const created = await this.model.create({
            evidenceId,
            description,
            actionRefId,
            imageId: name,
        });
        await this.s3.upload(name, file);
        //const imageUrl = `${process.env.S3_URL}/${name}`;
        return this.toJson(created);
    }

    async deleteEvidencePhoto(id) {
        const record = await this._readById(id);
        if (record.imageId) {
            await this.s3.delete(record.imageId);
        }
        return super.delete(id);
    }
}
module.exports = new EvidencephotosService();

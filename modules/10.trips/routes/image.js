const { BaseController } = helpers;
const S3Plugin = require('../../../server/plugins/s3');

class ImageController extends BaseController {
    constructor() {
        super();
        this.neededROLE = false;
        this.setValidator(validators.image);
        this.addRoute('get', '/img/:id', this.handleDownload.bind(this));
    }

    async handleDownload(req, res) {
        const { id } = req.params;
        const disposition = req.query.disposition === 'attachment' ? 'attachment' : 'inline';
        res.setHeader('Content-Disposition', `${disposition}; filename="${id}"`);
        const s3 = new S3Plugin({
            region: process.env.S3_REGION || 'us-east-1',
            accessKeyId: process.env.S3_ACCESS_KEY_ID || 'default',
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'default',
            endpoint: process.env.S3_ENDPOINT || 'https://s3.amazonaws.com',
            bucketName: process.env.S3_BUCKET_NAME || 'default-bucket',
        });
        try {
            await s3.download(id, res);
        } catch (error) {
            res.status(500).json([req.__('generic error', error.message)]);
        }
    }
}

module.exports = new ImageController();
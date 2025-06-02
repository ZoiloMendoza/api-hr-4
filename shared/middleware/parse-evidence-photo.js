function parseEvidencePhoto(req, res, next) {
    if (req.body && typeof req.body.evidencePhoto === 'string') {
        try {
            req.body.evidencePhoto = JSON.parse(req.body.evidencePhoto);
        } catch (err) {
            return res.status(400).json(['Formato de evidencias no valido']);
        }
    }
    return next();
}

module.exports = parseEvidencePhoto;

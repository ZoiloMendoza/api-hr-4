const JWT = require('jsonwebtoken');
const notoken = [
    { 'url': '/login', 'method': 'POST' },
    { url: '/request-password-reset', method: 'POST' },
    { url: '/firstconfig', method: 'POST' }
];


let accessVerify = (role) => {
    return async (req, res, next) => {
        let user = req.user;
        if (!user) {
            res.status(500).json(res.__("wrong headers"));
        } else {
            const rolesToCheck = [role];
            if (role !== process.env.SYSADMIN_ROLE) rolesToCheck.push(process.env.COMPANYADMIN_ROLE);
            if (!user.roles.some(r => rolesToCheck.includes(r.name))) {
                return res.status(401).json(res.__("auth error"));
            }
            return await next();
        }
    }
}

let verify = async (token) => {
    try {
      return await JWT.verify(token, process.env.JWT_SEED);
    } catch (error) {
      return null;
    }
  };
  
  

let tokenVerify =async (req, res, next) => {
    for (n in notoken) {
        if ((req.path == notoken[n].url) && (req.method == notoken[n].method)) return await next();
    }
    let h = req.get('Authorization');
    if (!h) {
        return res.status(500).json(res.__("missing token"));
    }
    let token = h.replace("Bearer ", "");
    JWT.verify(token, process.env.JWT_SEED, async (err, decd) => {
        if (err) {
            return res.status(401).json(res.__('generic error', err.message));
        }
        req.user = decd.user;
        return await next();
    });
}


module.exports = { accessVerify, tokenVerify, verify }
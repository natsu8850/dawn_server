const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors/unauthenticated')

function verify(req, res, next) {
    const authHeader = req.headers.token;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
        res.status(403).json({ msg: 'Token format invalid' });
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) res.status(403).json({ msg: 'Token is not valid!' });
            req.user = user;
            next();
        });
    } catch (error) {
        res.json({ msg: error.msg })
    }

}

module.exports = verify;
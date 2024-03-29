// Authenticate JWT
const jwt = require('jsonwebtoken')

function isAuthendicated(req, res, next) {
    let token = req.header("token");
    if (!token) return res.status(401).json({
        message: "Auth Error"
    });

    try {
        const decoded = jwt.verify(token, "myWookieSecret");
        req.user = decoded.user;
        next();
        
    } catch (e) {
        console.error(e);
        res.status(500).send({
            message: "Invalid Token"
        });
    }
    
}

module.exports = isAuthendicated;
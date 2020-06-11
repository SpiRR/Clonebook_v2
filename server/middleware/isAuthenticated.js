// Authenticate JWT
const jwt = require('jsonwebtoken')

function isAuthendicated(req, res, next) {
    const token = req.header("token");
    if (!token) return res.status(401).json({
        message: "Auth Error"
    });

    try {
        const decoded = jwt.verify(token, "randomString");
        req.user = decoded.user;
        next();
    } catch (e) {
        console.error(e);
        res.status(500).send({
            message: "Invalid Token"
        });
    }
    //     let username = "A" // Inreality it will come in post from the request, the jwt

    //     if (username == "A") { return next(); }
    //     return res.send("error");

    //    }

    //    app.get("/testMiddleware", isAuthendicated, (req, res) => {
    //     res.send("x")
}

module.exports = isAuthendicated;
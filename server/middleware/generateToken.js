const jwt = require('jsonwebtoken')

function generateToken(req, res, userId, userEmail) {
    const expiresIn = 10000
    
    jwt.sign( { userId, userEmail }, "myWookieSecret", {expiresIn}, (err, token) => {

        if(err){console.log('could not generate token'); return}

            return res.cookie('token', token, {
                expires: new Date(Date.now() + expiration),
                secure: false, // set to true if your using https
                httpOnly: true,
              });
        }
    )
}

module.exports = generateToken
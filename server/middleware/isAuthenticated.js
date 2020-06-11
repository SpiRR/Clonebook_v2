// Authenticate JWT
function isAuthendicated(req, res, next){
 
    let username = "A" // Inreality it will come in post from the request, the jwt
    
    if (username == "A") { return next(); }
    return res.send("error");
    
   }
    
   app.get("/testMiddleware", isAuthendicated, (req, res) => {
    res.send("x")
   })

module.exports = isAuthendicated;
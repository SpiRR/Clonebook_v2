const express = require("express")
const server = express()
const port = 80
const InitiateMongoServer = require("./config/db");
const users = require("./routes/users")
const port = 80

InitiateMongoServer();


server.use(express.urlencoded({
    extended: false
}));
server.use(express.json());
server.use(express.Router());

server.get("/", (req, res) => {
    res.json({ message: "API Working" });
});

server.use("/users", users);

// Cors
server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Origin", "http://localhost:9090");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

// Routes
const users = require('./routes/users.js');
const posts = require('./routes/posts.js');

server.use("/", users)
server.use("/", posts)

server.listen(port, err => {
    if (err) {
        console.log('Server error');
        return
    }
    console.log(`Server listening on port ${port}...`)
})
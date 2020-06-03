const express = require("express");
const router = express.Router();

// Search users
router.get("/users", (req, res) => {

    try {
        // Mongo query 
        db.collection('users').find({}).toArray((err, ajUsers) => {
            if (err) {
                res.status(500).send([]) // edited
                return
            }
            // Returning a response in ajUsers with all users in the database
            return res.send(ajUsers)
        })

    } catch (error) {
        // Should it be here? TODO: Test this
        process.on("uncaughtException", (err, data) => {
            if (err) {
                console.log("critical error, yet system keeps running");
                return;
            }
        });
    }

})

// Register
router.post("/signup", (req, res) => {
    res.send('signup')
});

// Login
router.post("/login", (req, res) => {
    res.send('login')
});

// Logout
router.post("/logout", (req, res) => {
    res.send('logout')
});

// Change my details 
router.patch("/change-details", (req, res) => {
    res.send('change details')
});

// Contacts and their statuses change
router.get("/contacts", (req, res) => {
    res.send('my contacts')
});

module.exports = router
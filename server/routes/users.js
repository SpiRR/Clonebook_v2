const express = require("express");
const router = express.Router();

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

module.exports = router
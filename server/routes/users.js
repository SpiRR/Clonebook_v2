const express = require("express");
const router = express.Router();
const http = require('http');
const formidable = require("formidable")
const { check, validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const multer = require('multer');
const upload = multer({ dest: 'images/' })
const fs = require("fs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')
const jwtKey = 'Bwaah'
const expiresIn = 10000

const User = require("../models/User.js")

//Search users 
router.get("/search", (req, res) => {

    try {
        // Mongo query 
        usersCollection.find({}).toArray((err, ajUsers) => {
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
router.post("/signup" ,[
    check("email", "Please Enter a Valid Email")
    .not()
    .isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
        min: 6
    })
], async (req, res) => {

    const err = validationResult(req)

    if (!err.isEmpty()) {
        return res.status(400).json({
            errors: err.array()
        });
    }
    const { email, password, firstName, lastName } = req.body

    try {

        let user = await User.findOne({
            email
        });

        if (user) {
            return res.status(400).json({
                message: "User already exists"
            }); 
        }

        // get profileimg here
        let profileimg = "../images/not.png"

        user = new User({
            email, 
            password, 
            firstName, 
            lastName, 
            profileimg
        });
        
        user.save(function (err, user) {
            if(err){console.error(err); return}
            console.log(user.email, 'Saved')

            return res.send(user)
        })

        // const salt = await bcrypt.genSalt(10);
        // user.password = await bcrypt.hash(password, salt);

        // const payload = {
        //     user: {
        //         id: user.id
        //     }
        // }

        // jwt.sign( payload, "randomString", {
        //     expiresIn
        // }, (err, token) => {
        //         if (err) throw err;
        //         res.status(200).json({
        //             token
        //         });
        //     }
        // );
        
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in register")
    }
});

// Login
router.post("/login",  (req, res) => {
    console.log('login')
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
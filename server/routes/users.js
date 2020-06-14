const express = require("express");
const router = express.Router();
const path = require("path")
const {
    check,
    validationResult
} = require("express-validator");
const bcrypt = require("bcryptjs");
const multer = require('multer');
const upload = multer({
    dest: 'images/'
})
const jwt = require('jsonwebtoken')
const expiresIn = 10000

const User = require("../models/User.js");
const isAuthendicated = require("../middleware/isAuthenticated.js");

//Search users (NEED TO BE CONVERTED)
// router.get("/search", async (req, res) => {
//     try {

//         let users = await User.findOne({
//             email
//         });

//         return users;

//     } catch (error) {
//         // Should it be here? TODO: Test this
//         process.on("uncaughtException", (err, data) => {
//             if (err) {
//                 console.log("critical error, yet system keeps running");
//                 return;
//             }
//         });
//     }

// });

// Get signup

router.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "signup.html"))
})


// Register
router.post("/signup", [
    check("email", "Missing email").not().isEmpty(),
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
    const {
        email,
        password,
        firstName,
        lastName
    } = req.body

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
        // let profileimg = "./images/not.png"

        user = new User({
            email,
            password,
            firstName,
            lastName,
            // profileimg
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        // Redirect to loggedIn content
        jwt.sign(
            payload, "randomString", {expiresIn}, (err, token) => {
                if(err) throw err;
                res.status(200).json({
                    user: user.email,
                    token: token
                });
            }
        )

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in register")
    }
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"))
})

// Login
// Save TOKEN in FE in LocalStorage
router.post("/login", [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({
        min: 6
    })
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        email,
        password
    } = req.body

    try {

        let user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(400).json({
                message: "User does not exists"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({
                message: "Incorrect Password !"
            });

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload, "randomString", {expiresIn}, (err, token) => {
                if(err) throw err;
                res.status(200).json({
                    token: token
                });
            }
        )

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server Error"
        });
    }

});

router.get("/profile", isAuthendicated ,async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
      } catch (e) {
        res.send({ message: "Error in Fetching user" });
      }
});

// Logout
// DELETE TOKEN IN FE LOCALSTORAGE
router.post("/logout", (req, res) => {

    res.send('logout')
});

// Change my details 
router.patch("/change-details", (req, res) => {
    // Which details? 
    // Profile img
    // Name
    res.send('change details')
});

// Contacts and their statuses change
// Get my contacts / friends
router.get("/contacts", (req, res) => {
    res.send('my contacts')
});

module.exports = router
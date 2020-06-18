const express = require("express");
const router = express.Router();
const path = require("path")
const bcrypt = require("bcryptjs");
const formidable = require("formidable")
const fs = require('fs');
const detect = require('detect-file-type');
const { v4: uuidV4 } = require('uuid');
const User = require("../models/User.js");
const isAuthendicated = require("../middleware/isAuthenticated.js");
const jwt = require('jsonwebtoken')
const expiresIn = 10000
const ObjectID = require('mongodb').ObjectID;

//Search users (NEED TO BE CONVERTED SO YOU CAN SEARCH ON EMAIL)
router.get("/search", async (req, res) => {
    const { firstName } = req.body;

    let users = await User.find({firstName});

    res.send(users)
    
});

// Get signup
router.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "signup.html"))
})


// Register
router.post("/signup", async (req, res) => {

    const form = formidable({multiples: true});
    form.parse(req, async (err, fields, files) => {

        if(err){console.log('something went wrong in form, signup'); return}

        const email = fields.email
        const password = fields.password
        const firstName = fields.firstName
        const lastName = fields.lastName
        const profilepicture = files.profilepicture 

        try {

            let user = await User.findOne({
                email
            });

            
            if (user) {
                return res.status(400).json({
                    message: "User already exists"
                });
            
            } else {
                
                detect.fromFile(profilepicture.path, async function(err, result) {
                    
                    if (err) {
                        return console.log(err);
                    }

                    const filename = uuidV4() + '.jpg'
                    const oldPath = files.profilepicture.path
                    const newPath = path.join(__dirname, '..', '..', 'client', 'public', 'images', 'userImages', filename)
                    
                    fs.rename(oldPath, newPath, function (err) {
                        if(err){console.log('Could not move img!'); return}
                        console.log('Moved img. successfully')
                    })
                    
                    console.log(result); // { ext: 'jpg', mime: 'image/jpeg' }
                
                
                user = new User({
                    email,
                    password,
                    firstName,
                    lastName,
                    profilepicture: filename.toString(), 
                    friends: [], 
                });

                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);

                await user.save();

       
            });
        }
        res.redirect("/login")
        
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in register")
        }
    });
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"))
})

// Login
// Save TOKEN in FE in LocalStorage
router.post("/login", async (req, res) => {
    const form = formidable({multiples: true})

    form.parse(req, async (err, fields, files) => {

        if(err){console.log('something went wrong in form, login'); return}

        const email = fields.email
        const password = fields.password      

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

                let saveToken = jwt.sign(payload, "myWookieSecret")

                    console.log(typeof saveToken)

                    res.send(saveToken)
    
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Server Error"
            });
        }
    })
});

router.get("/profile", isAuthendicated, async (req, res) => {

    try {
        const user = await User.findById({_id: ObjectID(req.user.id)});
        res.json(user);
    } catch (e) {
        res.send({
            message: "Error in Fetching user"
        });
    }
});

router.post("/edit", isAuthendicated, (req, res) => {
    const form = formidable({multiples: true})

    form.parse(req, async (err, fields, files) => {
        if(err){console.log('something went wrong in form, change-details'); return}
        
        let updatedFirstName = fields.firstName
        let updatedLastName = fields.lastName

        console.log(updatedFirstName)
        console.log(updatedLastName)
          
        try {
            
            let doc = await User.findOneAndUpdate({_id: ObjectID(req.user.id)}, {firstName: updatedFirstName, lastName: updatedLastName}, async function (err, docs) {
                if(err){console.log('something went wrong in update'); return}
                await docs.save()
            })

            console.log(doc)
            return res.json(doc)

        } catch (error) {
            if (err) {console.log("could not edit"); return}
        }

    })
});

// Contacts and their statuses change
// Get my contacts / friends
router.get("/friends", isAuthendicated, async (req, res) => {
    
    let user = await User.find({_id: ObjectID(req.user.id)});
    res.send(user[0].friends)
});

module.exports = router
router.post("/signup", (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        let email = fields.txtEmail;
        let password = fields.txtPassword;
        let firstName = fields.txtFirstName;
        let lastName = fields.txtLastName;
        let profileimg = files.profileimg.name;
        console.log( email, password, firstName, lastName, profileimg)

        usersCollection.insertOne({ email: email, password: password, firstName: firstName, lastName: lastName, profileimg: profileimg }), function(err, unknown) {
            if(err){console.log('Could not insert'); return}
            res.status(200).send(`${email} ${password} ${unknown}`)
        }
        return res.status(200).send('User successfully registered')
    })
    // return res.status(500).send('ERROR')
});


// const {email, password} = req.body

try {
    // Mongo query 
    let email = 'a@a.com'
    usersCollection.findOne({email: "a@a.com"}).toArray((err, ajUser) => {
        if (err) {
            res.status(500).send([]) // edited
            return
        }
        // Returning a response in ajUsers with all users in the database
        return res.send(ajUser)
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






// const find = async () => {
//     try {
//         const user = await usersCollection.findOne({ email: email, password: password })
//     } catch (err) {
//         console.log(err)
//     }
// }

// usersCollection.findOne({ email, password }), function(err, unknown) {
//     return res.send('found email', email)
// }

// const form = formidable({multiples: true});

// form.parse(req, (err, fields) => {
//     if(err){console.log('no user'); return}
//     let email = fields.txtEmail
//     let password = fields.txtPassword
    // if ( !email || !password || email !== password ) { // validating wrong
    //     console.log('x')
    //     return res.status(400).end()
    // }
            
    // const token = jwt.sign({email}, jwtKey, {
    //         algorithm: "HS256",
    //         expiresIn: jwtExpirySecounds
    // })
    //     console.log("Token:", token)

    // return res.status(200).send(`${email} ${password} `) // ${token}

// })
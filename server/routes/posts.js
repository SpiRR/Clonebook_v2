const express = require("express");
const router = express.Router();

// ------------------------------------------------------------
// POSTS
// ------------------------------------------------------------

// Create a post (STATIC USERID)
router.post("/create-post", (req, res) => {
    // Who is creatng the post
    // Shoud come from session or JWT
    const user_id = "5ed7a65fb2c60f66889c44e2"
    // the post body
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {
        let post = fields.txtPost
        likes = 0
        comments = []
        console.log( post )

        postsCollection.insertOne({ user_id: user_id, post: post, likes, comments }), function(err, unknown) {
            if(err){console.log('Could not insert post'); return}
            return res.status(200).send(`${user_id} ${post} ${unknown}`)
        }
    })
    return res.status(200).send('Post added')
});

// Like a post
// POST??????? OR PATCH??????
router.post("/liked-post", (req, res) => {
    res.send('post liked')
});

// BONUS - COMMENT ON A POST


module.exports = router
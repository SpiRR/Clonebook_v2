const express = require("express");
const isAuthendicated = require("../middleware/isAuthenticated.js");
const router = express.Router();
const formidable = require("formidable");
const Post = require("../models/Post.js");

// Create a post
// If no posts - create empty array of posts
router.post("/create-post", isAuthendicated, async (req, res) => {
    const userId = req.user.id
    const form = formidable({multiples: true})

    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        const postmsg = fields.postmsg

        try {
            const likes = 0
            post = new Post({
                author_id: userId,
                post: postmsg,
                likes,
                comments: []
            })

            await post.save()
            
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in create-post")
        }
    })
});

// Like a post
// POST??????? OR PATCH??????
router.patch("/liked-post", (req, res) => {
    res.send('post liked')
});

// comment post
router.patch("/comment-post", isAuthendicated, async (req, res) => {
    // Who comments on the post (comment_author_id)
    const author_id = req.user.id
    const form = formidable({multiples: true})
    
    // I need postID to know which one the comment shoudl go  on

    form.parse(req, async (err, fields, files) => {
        if (err) {
            next(err);
            return;
        }
        const commentmsg = fields.commentmsg

        try {
            // I need to push into comments array in post
            const postId= "5ee8d684da718d1478b673a3"
            const newCommentToPost = {author_id, commentmsg}

            const post = Post.findById(postId, async function (err, post) {
                console.log('found it')
                console.log(postId)
                // await newCommentToPost.save()

                // res.send('X')
            })


            

        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in create-post")
        }
    })
    // Comments should consisit of who commented the post? (author and comment)

});

// get All yours and your friends posts
router.get("/get-posts", (req, res) => {
    res.send('loaded posts')
})

module.exports = router
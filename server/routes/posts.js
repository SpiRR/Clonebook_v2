const express = require("express");
const isAuthendicated = require("../middleware/isAuthenticated.js");
const router = express.Router();
const formidable = require("formidable");
const Post = require("../models/Post.js");
const User = require("../models/User.js");
const ObjectID = require('mongodb').ObjectID;

// Create a post
// If no posts - create empty array of posts
router.post("/create-post", isAuthendicated, async (req, res) => {
    const form = formidable({multiples: true})

    form.parse(req, async (err, fields, files) => {
        // if (err) {
        //     next(err);
        //     return;
        // }
        const postmsg = fields.postmsg

        try {

            const user = await User.find({ _id: ObjectID(req.user.id)})
            const likes = 0

            let post = new Post({
                author: {
                    author_id: ObjectID(req.user.id), 
                    author_firstName: user[0].firstName, 
                    author_lastName: user[0].lastName,
                    author_img: user[0].profilepicture //[object global] on pic. -> [DEP0016] DeprecationWarning: 'root' is deprecated, use 'global'
                }, 
                post: postmsg,
                likes
            })
            
            await post.save( async function (err) {
                if(err){console.log('Could not save'); return}
                
                // set  in filtering users friends and pots 
                let aFriendsID = []
                let aPosts = []
            
                for (let i = 0; i < user[0].friends.length; i++) {
                    const friendID = user[0].friends[i].friendID.toString()
                    aFriendsID.push(friendID)   
                }
                
                console.log(aFriendsID)
                let posts = await Post.find({});

                console.log(user[0].friends.length)
                console.log(posts.length)
            
                for (let i = 0; i < posts.length; i++) {
                    if ( aFriendsID.includes(posts[i].author.author_id.toString()) || posts[i].author.author_id.toString() == req.user.id ) {
                        aPosts.push(posts[i])
                    }
                }
                return res.send(aPosts)
            });


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
        // if (err) {
        //     next(err);
        //     return;
        // }
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

// Delete post
router.delete("/delete", (req, res) => {

});

// get All your's and your friends posts
router.get("/posts", isAuthendicated, async (req, res) => {
    // All posts
    const user = await User.findById({_id: ObjectID(req.user.id)});
    let aFriendsID = []

    for (let i = 0; i < user.friends.length; i++) {
        const friendID = user.friends[i].friendID.toString()
        aFriendsID.push(friendID)   
    }
    
    let posts = await Post.find({});
    let aPosts = []

    for (let i = 0; i < posts.length; i++) {
        if ( aFriendsID.includes(posts[i].author.author_id.toString()) || posts[i].author.author_id.toString() == req.user.id ) {
            aPosts.push(posts[i])
        }
    }
    return res.send(aPosts)

})

module.exports = router
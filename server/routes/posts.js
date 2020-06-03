const express = require("express");
const router = express.Router();

// Create a post
router.post("/create-post", (req, res) => {
    res.send('post created')
});

// Like a post
// POST??????? OR PATCH??????
router.post("/liked-post", (req, res) => {
    res.send('post liked')
});

module.exports = router
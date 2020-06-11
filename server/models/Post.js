const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  post: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    required: false
  },
  comments: {
    type: String,
    required: false
  }
});

// export model user with UserSchema
module.exports = mongoose.model("posts", PostSchema);
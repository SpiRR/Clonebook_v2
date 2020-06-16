const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  author_id: {
    type: String,
    required: true
  },
  post: {
    type: String,
    required: true
  },
  likes: {
    type: Number
  },
  comments: {
    type: Array
  },
  postImg: {
    data: Buffer,
    contentType: String
  }

});

// export model user with UserSchema
module.exports = mongoose.model("posts", PostSchema);
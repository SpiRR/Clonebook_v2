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
  postImg: {
    data: Buffer,
    contentType: String
  }

});

// export model user with UserSchema
module.exports = mongoose.model("posts", PostSchema);
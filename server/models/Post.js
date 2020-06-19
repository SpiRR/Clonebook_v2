const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const PostSchema = mongoose.Schema({
  author: {
    type: Object,
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
const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  firstName: {
    type: String,
    required: true
  },

  lastName: {
    type: String,
    required: true
  },

  profilepicture: {
    data: Buffer, 
    contentType: String
  },

  friends: {
    type: Array
  },

  posts: {
    type: Array
  }
});

// export model user with UserSchema
module.exports = mongoose.model("users", UserSchema);
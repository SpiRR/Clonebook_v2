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
    type: String,
    get: v => `${root}${v}`
  },

  friends: {
    type: Array
  }

});

// export model user with UserSchema
module.exports = mongoose.model("users", UserSchema);
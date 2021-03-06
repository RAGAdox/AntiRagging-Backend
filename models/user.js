const mongoose = require("mongoose");
const bcrypt = require("bcrypt-nodejs");
const usersSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  activated: {
    type: Boolean,
    required: true,
    default: false
  },
  staffStatus: {
    type: Boolean,
    required: true
  },
  superUser: {
    type: Boolean,
    required: true
  },
  presentAddress: {
    type: String
    //required:true
  },
  collegeName: {
    type: String
    //required:true
  },
  phoneNumber: {
    type: String
    //required:true
  }
});
usersSchema.methods.hashPassword = function(password) {
  //console.log(bcrypt.hashSync(password, bcrypt.genSaltSync(10)));
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};
usersSchema.methods.comparePassword = function(password, hash) {
  return bcrypt.compareSync(password, hash);
};
const users = mongoose.model("users", usersSchema);
module.exports = users;

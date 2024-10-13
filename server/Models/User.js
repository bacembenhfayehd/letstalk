const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {type: String,required: true,unique: true},
    password: {type :String , unique:true},
  },{ timestamps: true });

const UserModel = mongoose.model('User', userSchema);
module.exports = UserModel;

/*const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {type:String, unique:true},
  password: String,
}, {timestamps: true});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;*/
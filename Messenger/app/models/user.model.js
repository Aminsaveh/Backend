const mongoose = require("mongoose");
const chatModel = require("./chat.model");
const joinRequestModel = require("./joinRequest.model");
const UserSchema =  new mongoose.Schema({
  id           : {type : Number},
  name         : {type : String},
  email        : {type : String},
  password     : {type : String},
  groupId      : {type : String},
  joinRequests : {type : [joinRequestModel.JoinRequestSchema]},
  chats        : {type : [chatModel.ChatSchema]},
});
const User = mongoose.model(
  "User",
   UserSchema
);
module.exports = {
  User : User,
  UserSchema : UserSchema
};
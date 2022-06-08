const mongoose = require("mongoose");
const messageModel = require("./message.model");
const ChatSchema =  new mongoose.Schema({
  userId     : {type : String},
  name       : {type : String},
  messages   : {type : [messageModel.MessageSchema]},
  date       : {type : Number ,default : Date.now()},
});
const Chat = mongoose.model(
    "Chat",
    ChatSchema
);
module.exports = {
    Chat: Chat,
    ChatSchema : ChatSchema
};
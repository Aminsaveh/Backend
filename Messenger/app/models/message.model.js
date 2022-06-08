const mongoose = require("mongoose");
const MessageSchema =  new mongoose.Schema({
  message    : {type : String},
  date       : {type : Number ,default : Date.now()},
  sentby     : {type : String},
});
const Message = mongoose.model(
    "Message",
    MessageSchema
);
module.exports = {
    Message: Message,
    MessageSchema : MessageSchema
};
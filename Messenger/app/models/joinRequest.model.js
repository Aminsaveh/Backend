const mongoose = require("mongoose");
const JoinRequestSchema =  new mongoose.Schema({
  id         : {type : Number},
  groupId    : {type : String},
  userId     : {type : String},
  date       : {type : Number ,default : Date.now()},

});
const JoinRequest = mongoose.model(
    "JoinRequest",
    JoinRequestSchema
);

module.exports = {
    JoinRequest : JoinRequest,
    JoinRequestSchema : JoinRequestSchema
};
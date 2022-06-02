const mongoose = require("mongoose");
const joinRequestModel = require("./joinRequest.model");
const Member = require("./member.model");

const GroupSchema =  new mongoose.Schema({
    id            : {type : Number},
    name          : {type : String},
    description   : {type : String},
    members       : {type: [Member.MemberSchema]},
    joinRequests  : {type : [joinRequestModel.JoinRequestSchema]}
  });
const Group = mongoose.model(
  "Group",
   GroupSchema 
);
module.exports = Group;
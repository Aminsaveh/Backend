const mongoose = require("mongoose");
const connectionModel = require("./connection.model");
const connectionRequestModel = require("./connectionRequest.model");
const joinRequestModel = require("./joinRequest.model");
const Member = require("./member.model");

const GroupSchema =  new mongoose.Schema({
    id                 : {type : Number},
    name               : {type : String},
    description        : {type : String},
    members            : {type:  [Member.MemberSchema]},
    connections        : {type : [connectionModel.ConnectionSchema]},
    joinRequests       : {type : [joinRequestModel.JoinRequestSchema]},
    connectionRequests : {type : [connectionRequestModel.ConnectionRequestSchema]},
  });
const Group = mongoose.model(
  "Group",
   GroupSchema 
);
module.exports = Group;
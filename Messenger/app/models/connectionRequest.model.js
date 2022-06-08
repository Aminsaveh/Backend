const mongoose = require("mongoose");
const ConnectionRequestSchema =  new mongoose.Schema({
  connectionRequestId  : {type : Number},
  groupId              : {type : String},
  sent                 : {type : Number ,default : Date.now()},

});
const ConnectionRequest = mongoose.model(
    "ConnectionRequest",
    ConnectionRequestSchema
);

module.exports = {
    ConnectionRequest : ConnectionRequest,
    ConnectionRequestSchema : ConnectionRequestSchema
};
const mongoose = require("mongoose");
const ConnectionSchema =  new mongoose.Schema({
  groupId   : {type : Number},
});
const Connection = mongoose.model(
    "Connection",
    ConnectionSchema
);
module.exports = {
    Connection : Connection,
    ConnectionSchema : ConnectionSchema
};
const mongoose = require("mongoose");
const MemberSchema =  new mongoose.Schema({
  id   : {type : Number},
  name : {type : String},
  email: {type : String},
  rule : {type : String}
});
const Member = mongoose.model(
    "Member",
    MemberSchema
);
module.exports = {
    Member : Member,
    MemberSchema : MemberSchema
};
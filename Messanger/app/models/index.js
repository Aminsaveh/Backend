const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const db = {};
db.mongoose = mongoose;
db.user = require("./user.model");
db.group = require ("./group.model")
db.counters = require ("./counters.model")
module.exports = db;
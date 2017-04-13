var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({},{'strict':false});

module.exports = mongoose.model('Feeds',userSchema); //creating Users collection

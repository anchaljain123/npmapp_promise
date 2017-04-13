
var mongoose = require('mongoose');
var mongoURI = "mongodb://localhost/demo1";

mongoose.connect(mongoURI); //creating db
(function () {
    mongoose.connection.on('open',function(err,data) {
        console.log('Connected to First Database');

    });
    mongoose.connection.on('error',function(err,data) {
        console.log('Could not connect to Mongoose',err);
    });
})();
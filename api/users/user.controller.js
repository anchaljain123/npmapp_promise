var userService = require('./user.service');
exports.createFeed = function(req,res,next) {
    userService.createFeed(userData,res);
};

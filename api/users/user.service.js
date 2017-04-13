var Feed = require('./user.model');
exports.createFeed = function(userData,res) {
    Feed.create(userData , function (err,data) {
        if(err){
            console.log({msg: "Somwthing went wrong in post ",error: err});
        }
        else{
            console.log(" Success ");
            res.send({result : data});
        }

    })

};
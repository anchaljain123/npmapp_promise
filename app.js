var cheerio = require('cheerio');
require('./config/data');
var request = require('request');
var async = require('async');
xml2js = require('xml2js');
var parser = new xml2js.Parser();
var Feed = require('./api/users/user.model');
var xmlData = {};
var taskArray = [],taskArray1=[];


function Insertfeeds(resultJson) {

    return new Promise(function (resolve, reject) {

        for (i in resultJson) {

            resultJson[i].map( (item) => {

                taskArray1.push((function (item) {
                    //console.log("**************",item.rss.channel)

                    return function (cb) {
                        Feed.create(item.rss.channel, function (err, data) {
                            if (err) {
                                console.log("Somwthing went wrong in post ",err);
                            }
                            else {
                                console.log(" Success ");
                                cb(data)
                            }

                        })
                    }


                })(item))
            })

        }

        async.series(taskArray1, function (err, finalResult) {

            if(err)  reject('error');

            console.log(finalResult.length,"============finalresult");

            resolve('inserted into db');
        })

    })
}

function readAllFeeds(linksObj) { //reading all links and saving data
    var seriesArray = [],tempArray = [];
    return new Promise(function (resolve, reject) {
        for (i in linksObj) {

            if (i == 'country') {

                linksObj[i].map((item) => {
                    taskArray.push((function (item) {
                        return function (callback) {
                            request({
                                method: 'GET',
                                url: item,
                            }, function (err, response, body) {
                                tempArray.push(body);
                                xmlData['country']=tempArray;
                                callback();

                            })
                        }
                    })(item))
                })

            }
            if (i == 'series') {

                linksObj[i].map((item) => {

                    taskArray.push((function (item) {
                        return function (callback) {
                            request({
                                method: 'GET',
                                url: item,
                            }, function (err, response, body) {
                                seriesArray.push(body);

                                xmlData['series']=tempArray;
                                callback();

                            })
                        }
                    })(item))
                })
            }
            if (i == 'topplayers') {
                var topplayerArray = [];
                linksObj[i].map((item) => {

                    taskArray.push((function (item) {
                        return function (callback) {
                            request({
                                method: 'GET',
                                url: item,
                            }, function (err, response, body) {
                                topplayerArray.push(body);
                                xmlData['topplayers'] = tempArray;
                                callback();

                            })
                        }
                    })(item))
                })
            }

        }


        async.parallel(taskArray, function (err, finalResult) {

            resolve(xmlData);
        })

    })
}

var saveFeeds = function (data) {//parse xml to json
    var feedString = JSON.stringify(data);

    var jsonDataObj = {},keys=0;

    return new Promise(function (resolve, reject) {

        for (i in data) {
            keys++;
            var jsonData =[];
            for( j =0 ;j<10;j++) {

                parser.parseString(data[i][j], function (err, result) {
                    if (err) console.log(err);
                    jsonData.push(result);
                });
            }

            jsonDataObj[i]=jsonData;
        }


        if (keys == 3) {
            resolve(jsonDataObj);
        }
    });

};


var prepareApiResponse = function (data) {
    var i = 0;
    // console.log(data, "---------------data");

    /*var promise = new Promise(function (resolve, reject) {
     if (typeof data[i] == "object")
     {
     countXml++;
     console.log("hi")
     prepareApiResponse(data[i++])

     }
     else {

     resolve(countXml);
     console.log("bye")
     }

     });

     return promise.all;*/
    let requests = data.map((item) => {
        return new Promise((resolve, reject) => {
            apiResponse(item, resolve);
        });
    })

    Promise.all(requests).then(() => {
        sendApiResponse(countXml)
    });

};

function apiResponse(feed, resolve) {
    var countXml = 0
    if (typeof feed == "object") {
        countXml++;
        // console.log(countXml, "!!!!!!!!!!!countresponse")
        resolve(countXml);
    }

}


function sendApiResponse(data) {
    return new Promise(function (resolve, reject) {
        console.log(data);
        resolve('sent api response :');
    })
}

function apiController() {

    var linksArray = [], i = 0, counter = 0, linksObj = {};
    var feedname = ['country', 'series', 'topplayers'];
    request({
        method: 'GET',
        url: 'http://www.espncricinfo.com/ci/content/rss/feeds_rss_cricket.html'
    }, function (err, response, body) {
        if (err) return console.error(err);
        $ = cheerio.load(body);
        $('td li').each(function () {
            var href = $("a", this).attr('href');
            linksArray.push(href);
        });


        linksObj['country'] = linksArray.slice(0, 10);
        linksObj['series'] = linksArray.slice(11, 20);
        linksObj['topplayers'] = linksArray.slice(20, 30);

        readAllFeeds(linksObj)
            .then(saveFeeds)
            .then(function(result){
                Insertfeeds(result)
            })
            .then(function (result) {
                console.log("finished" + result)
            }).catch(function (err) {
            console.log(err)
        });
    });
    /*Promise.all([readAllFeeds(),saveFeeds(),prepareApiResponse(),sendApiResponse()]).then(function () {
     console.log('finish');
     })*/




}

apiController();
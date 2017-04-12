var cheerio = require('cheerio');
var request = require('request');
var async = require('async');
xml2js = require('xml2js');
var parser = new xml2js.Parser();
var xmlData = {};
var taskArray = [];

function readAllFeeds(linksObj) { //reading all links and saving data
                     var seriesArray = [],tempArray = [];;
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
                                // console.log(xmlData + "=========country result" + "\n");
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
                                // console.log(xmlData + "=========series result" + "\n");
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
                                // console.log(xmlData + "=========topplyaer result" + "\n");
                            })
                        }
                    })(item))
                })
            }

        }

        //console.log('taskArray', taskArray);
        async.parallel(taskArray, function (err, finalResult) {
            // console.log('finalResult is '+ "\n"+ xmlData+"\n");
            resolve(xmlData);
        })

    })
}

var saveFeeds = function (data) {//parse xml to json
    var feedString = JSON.stringify(data);
  //console.log(data.country.length,"====================Final Data")
    var jsonData = [];
    //console.log("---enter savefeeds--------------------------------------------------",data.country);
    return new Promise(function (resolve, reject) {
        //  console.log("---enter promise-----------------------------------------------",data.topplayers);
       for (i in data) {
          // console.log(i,": ---enter forloop----------------: ",data[i].length);
                 for( j =0 ;j<10;j++) {
                    //     console.log(data[i][j])
             parser.parseString(data[i][j], function (err, result) {

                    if (err) console.log(err);
                    jsonData.push(result);
                });
            }
        }

        console.log("**********************************",jsonData)
        /* if (i == data.length) {
         console.log( "%%%%%%%%%%% XML to JSON"); //country data
         resolve(jsonData);
         }  */
    });
    //  console.log("---end-----------------------------------------------------",data.series);
};


var prepareApiResponse = function (data) {
    var i = 0;
  //  console.log(data, "---------------data");

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

            // linksArray[feedname[i]] = href;
        });

        linksObj['country'] = linksArray.slice(0, 10);
        linksObj['series'] = linksArray.slice(11, 20);
        linksObj['topplayers'] = linksArray.slice(20, 30);

        // console.log(linksObj.series)

        readAllFeeds(linksObj)
            .then(saveFeeds)
            .then(prepareApiResponse)
            .then(sendApiResponse).then(function (result) {
            console.log(result)
        });

        /*Promise.all([readAllFeeds(),saveFeeds(),prepareApiResponse(),sendApiResponse()]).then(function () {
         console.log('finish');
         })*/

    });


}

apiController();
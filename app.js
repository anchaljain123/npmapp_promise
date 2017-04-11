var cheerio = require('cheerio');
var request = require('request');
var fs=require('fs');
xml2js = require('xml2js');
var parser = new xml2js.Parser();
var writefileStream=fs.createWriteStream('./links.txt','UTF8');

function readAllFeeds(linksArray){
    var xmlData = [];
    var promise = new Promise(function(resolve, reject) {
  function hitxmlData(cb) {
      for (i = 0; i < 2; i++) {
          request({
              method: 'GET',
              url: linksArray[i]
          }, function (err, response, body) {
              xmlData.push(body);
              if(xmlData.length == 2)
              cb(xmlData);
          });


      }
  }

        hitxmlData(function (res) {
            resolve(res)
        })

    });
return promise;
}

var saveFeeds = function(data) { //parse xml to json

    var promise = new Promise(function(resolve, reject){
        parser.parseString(data[0], function (err, result) {
            if(err) console.log(err);
            resolve(result);
        });

    });
    return promise;
};



var prepareApiResponse = function(data) {
    var countXml = 0;
    var promise = new Promise(function(resolve, reject){
        if(typeof data == "object")
           countXml ++ ;
        resolve(countXml)
    });
    return promise;
};
function sendApiResponse(data){
    console.log(data)
}

function apiController() {

    var linksArray = {},i=0,counter=0;
    var feedname = ['country','series','topplayers'];
    request({
        method: 'GET',
        url: 'http://www.espncricinfo.com/ci/content/rss/feeds_rss_cricket.html'
    }, function (err, response, body) {

        if (err) return console.error(err);
        $ = cheerio.load(body);
        $('td li').each(function () {
            counter++;

            if(counter % 10  == 0){
                var href = $("a", this).attr('href');
                // linksArray.push(href);
                if(href.length == 10){
                    linksArray[feedname[i]]=href;
                }

                i++;
            }


        });

        readAllFeeds(linksArray)
          .then(saveFeeds)
            .then(prepareApiResponse)
            .then(sendApiResponse)
    });



}
apiController();
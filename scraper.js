var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var rateLimit = require('express-rate-limit');
var limiter = rateLimit({windowMs: 3600000}); //store in memory for 1 hour

var app = express();
app.use(limiter);

var collection = {};
var url = 'http://www.atlantaga.gov/index.aspx?page=768';

function doRequest() {
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
	    $('.content table tr').each(function(i, element){
                if (!i) return true;
                var agendaColumn = $(this).children('td').first();
                var npu = agendaColumn.text().trim().slice(-1);
                var relLink = agendaColumn.find('a').attr('href');
                var absLink = 'http://www.atlantaga.gov/' + relLink;
                collection[npu] = absLink;
            });
        }
    });
}

app.get('/demos/latest-npu-agenda/', function(req, res){
    doRequest();
    res.send(collection);
});
app.get('/demos/latest-npu-agenda/:npu', function(req, res){
    doRequest();
    var requestedNPU = req.params.npu.toUpperCase();
    res.redirect(collection[requestedNPU]);
});

app.set('port', process.env.PORT || 8000);
app.listen(app.get('port'),function(){
	
});
console.log("The server is now running on port " + app.get('port'));

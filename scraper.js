var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var url = 'http://www.atlantaga.gov/index.aspx?page=768';
app.get('/npu-agenda-scraper/:npu', function(req, res){
    var requestedNPU = req.params.npu.toUpperCase();
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            var collection = {};
            $('.content table tr').each(function(i, element){
                if (!i) return true;
                var agendaColumn = $(this).children('td').first();
                var npu = agendaColumn.text().trim().slice(-1);
                var relLink = agendaColumn.find('a').attr('href');
                var absLink = 'http://www.atlantaga.gov/' + relLink;
                collection[npu] = absLink;
            });
            if (requestedNPU) {
                res.redirect(collection[requestedNPU]);
            } else {
                res.send(collection);
            }
        }
    });
});
app.listen(8080);
console.log("The server is now running on port 8080.");

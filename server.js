var express = require('express');
var fs      = require('fs');
var csv     = require('csv-parser');

var Datastore = require('nedb')
    , db = new Datastore();

var port = 8081;

var refreshData = function() {

    console.log("Dropper database og kjører opp ny");

    db.remove({}, { multi: true }, function (err, numRemoved) {
        if(err) {
            console.log('Error i refreshData', error);
        } else {
            console.log(numRemoved,' - Removed items');
            loadData();
        }
    });
};

var loadData = function() {
    fs.createReadStream('./data/dump.csv')
        .pipe(csv())
        .on('data', function(data) {
            db.insert(data);
        });
};

setInterval(refreshData, 5000); //refreshing every 5 sec
//setInterval(refreshData, 3600000); //refreshing every hour

var restApi = express();

restApi.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

restApi.get('/customer/:id', function(req,res){
    db.find(
        {customer_id: req.params.id},
        function(err, docs){
            res.status(200).send(docs);
            console.log(docs);
        })
});

restApi.get('/order/:id', function(req,res){

    db.find(
        {order_ref: req.params.id},
        function(err, docs){
            res.status(200).send(docs);
            console.log(docs);
        })
});


restApi.get('/', function(req,res){

    db.findOne(
        {},
        function(err, docs){
            res.status(200).send(docs);
            console.log(docs);
        })
});

restApi.listen(port);

console.log('Server running at http://localhost:'+port+'/');

loadData();
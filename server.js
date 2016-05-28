var express = require('express');
var fs      = require('fs');
var csv     = require('csv-parser');

var Datastore = require('nedb')
    , db = new Datastore();

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

setInterval(refreshData, 5000);

var restApi = express();

restApi.get('/customer/:id', function(req,res){
    db.find(
        {customer_name: req.params.id},
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

restApi.get('/product/:id', function(req,res){
    db.find(
        {product_group: req.params.id},
        function(err, docs){
            res.status(200).send(docs);
            console.log(docs);
        })
});

restApi.listen(3000);

console.log('Server running at http://localhost:3000/');

loadData();
var express     = require('express');
var fs          = require('fs');
var csv         = require('csv-parser');
var jwt         = require('jwt-simple');

var inputFile   = './data/input/qlikinput.csv';
var outputFile  = './data/output/qlikoutput.csv';
var outputWrite = null;

var secret      = 'qlikSecretBroadnet';


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
    var fileOut = fs.createWriteStream(outputFile);
    var fileIn  = fs.createReadStream(inputFile);

    fileIn
        .pipe(csv())
        .on('data', function(data) {
            var encrypted = null;
            db.insert(data);
            console.log("data som settes inn",data);
            encrypted = {
                customer_id: data.customer_id,
                cust_id_encrypted: jwt.encode({
                    customer_id: data.customer_id
                }, secret)
            };
            var stringToWrite = data.customer_id+', '+ jwt.encode({
                    customer_id: data.customer_id
                }, secret)+ '\n';

            fileOut.write(stringToWrite);
            console.log('string to write', stringToWrite);
            console.log('encrypt', jwt.encode({
                customer_id: data.customer_id
            }, secret))
            //writeToFile(encrypted)
        });
    //fileOut.end();
    fileIn.on('open', function(){
        console.log('fileIn is open');
    });


    fileIn.on('close', function(){
        console.log('fileIn is closed');
        fileOut.close();
    });

    fileOut.on('open', function(){
        console.log('fileOut is open');
    });


    fileOut.on('close', function(){
        console.log('fileOut is closed');
    });

};

// Writing data to file
var writeToFile = function(encryptedData) {
    console.log('encrypted data', encryptedData)
    console.log('decrypted', jwt.decode(encryptedData.cust_id_encrypted, secret));
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
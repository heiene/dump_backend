var express     = require('express');
var fs          = require('fs');
var csv         = require('csv-parser');
var jwt         = require('jwt-simple');

var inputFile   = './data/input/qlikinput.csv';
var outputFile  = './data/output/qlikoutput.csv';
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

    // Write header for CSV out
    fileOut.write(
        'customer_id,customer_id_encrypted,order_ref,order_ref_encrypted,salesperson_id,salesperson_id_encrypted\n'
    );



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
            var stringToWrite =
                data.customer_id+','+ new Buffer(jwt.encode({customer_id: data.customer_id}, secret)).toString('base64')+','+
                data.order_ref+','+ new Buffer(jwt.encode({order_ref: data.order_ref}, secret)).toString('base64')+','+
                data.salesperson_id+','+ new Buffer(jwt.encode({salesperson_id: data.salesperson_id}, secret)).toString('base64')+'\n';

            fileOut.write(stringToWrite);
            console.log('string to write', stringToWrite);
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

restApi.get('/encrypt/:token', function(req,res){
    var token_temp = new Buffer(req.params.token, 'base64').toString('ascii');
    var token = jwt.decode(token_temp, secret);
    console.log(token, token_temp, 'tokesn in yeayeah');
    db.find(
        token,
        function(err, docs){
            res.status(200).send(docs);
            console.log(docs);
        })
});


restApi.listen(port);

console.log('Server running at http://localhost:'+port+'/');

loadData();
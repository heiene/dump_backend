var express = require('express');
var sqlite3 = require('sqlite3').verbose();
var fs      = require('fs');
var csv     = require('csv-parser');

/*fs.createReadStream('./data/27.05.2016.csv')
    .pipe(csv())
    .on('data', function(data) {
        console.log('row', data)
    });
*/
var restApi = express();
/*
restApi.get('/customer/:name', function(req,res){
    db.all("SELECT order_ref as orderNumber, process_step as process FROM order WHERE customer_name = '" + req.params.name+ "'", function(err,row) {
        if(err != null) {
            //Error handling
        } else {
            console.log(row);
            res.send(200, row)
        }
    })
});

restApi.get('/customer/:name/order/:id', function() {
    db.all("SELECT order_ref as orderNumber, process_step as process FROM order WHERE order_ref = '" + req.params.id+ "'", function(err,row) {
        if(err != null) {
            //Error handling
        } else {
            console.log(row);
            res.send(200, row)
        }
    })
});
*/

var funki = function(){
    console.log("funki created", db);

};

var handleData = function(){

};

var db = new sqlite3.Database(':memory:',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, funki);

db.serialize(function() {
    console.log("creating table", db);
    db.run("CREATE TABLE orders (" +
        "order_ref TEXT, " +
        "product_group TEXT, " +
        "process_step TEXT, " +
        "customer_name TEXT)");

    console.log("creating table done", db);
    //customer_name	order_ref	product_group	process_step	circuit_id	reg_date	plan_done_date	clean_order_date	agreed_date	agreed_installation_date	FM_date	finalize_access_date	latest_agreed_date	order_counter

    fs.createReadStream('./data/27.05.2016.csv')
        .pipe(csv())
        .on('data', function(data) {
            db.run("INSERT into orders (customer_name ,order_ref, product_group, process_step) VALUES ('" +data.customer_name + "', '"+data.order_ref + "', '"+data.product_group + "', '"+data.process_step + "')");
            //console.log('row', data)
        });

   /* var stmt = db.prepare("INSERT INTO orders VALUES (?)");
    for (var i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i, "ejsy    q");
    }
    stmt.finalize();

    db.each("SELECT order_ref as orderNumber, process_step as process FROM order", function(err, row) {
        console.log(row.orderNumber + ":  : " + row.process);
    });
    */
});

db.close();

restApi.listen(3000);
console.log('Server running at http://localhost:3000/');
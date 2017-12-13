var express=require('express'),
mysql=require('mysql'),
Promise = require('bluebird'),
using = Promise.using,
credentials=require('./credentials.json'),
app = express(),
port = process.env.PORT || 1337;

var connection = mysql.createConnection(credentials); // setup the connection

connection.connect(function(err){if(err){console.log(error)}});

app.use(express.static(__dirname + '/public'));
app.get("/buttons",function(req,res){
  var sql = 'SELECT * FROM fluto006.till_buttons';
  connection.query(sql,(function(res){return function(err,rows,fields){
     if(err){console.log("We have an error:");
             console.log(err);}
     res.send(rows);
  }})(res));
});

app.post("/click",function(req,res){
  var user = req.param('user');
  var id = req.param('id');
  var sql = 'CALL fluto006.newAddItem('+id+', "'+user+'")';
  console.log("Attempting sql ->"+sql+"<-");

  connection.query(sql,(function(res){return function(err,rows,fields){
    if(err){console.log("Error: couldn't add item to transaction table");
    console.log("Attempting sql ->"+sql+"<-");
    console.log(err);
    res.send(err);
  }
  res.send("");
}})(res));
});

app.get("/deleteItem",function(req,res){
  var id = req.param('id');
  var sql = 'DELETE FROM fluto006.current_transaction WHERE item = ' + mysql.escape(id);
  console.log("Attempting sql ->"+sql+"<-");

  connection.query(sql,(function(res){return function(err,rows,fields){
     if(err){console.log("Error: couldn't delete item from transaction table");
             console.log(err);
             res.send(err);
           }
    res.send("");
  }})(res));
});

// Your other API handlers go here!
app.get("/sale",function(req,res){
  var user = req.param('user');
  var total = req.param('total');
  var sql = 'CALL fluto006.archive_testing("'+user+'", '+total+'); CREATE OR REPLACE VIEW transactionSummary as SELECT transactionsID, MIN(startTime) as startTime, MAX(stopTime) as stopTime, TIMESTAMPDIFF(second, MIN(startTime), MAX(stopTime)) as DurationSecs, user, total_price FROM archive_transactions_table GROUP BY transactionsID ORDER BY transactionsID;';
  connection.query(sql, (function(res){return function(err,rows,fields){
    if(err){
	console.log("Error: couldn't complete transaction");
	console.log(err);
    }
    res.send(rows);
    }})(res));
});

app.get("/void",function(req,res){
  var sql = 'CALL fluto006.voidTransaction';
  connection.query(sql, (function(res){return function(err,rows,fields){
    if(err){
	console.log("Error: couldn't void transaction");
        console.log(err);
    }
    res.send(rows);
  }})(res));
});
'/'+
app.get("/list",function(req,res){
  var sql = 'SELECT * FROM fluto006.current_transaction';
  connection.query(sql, (function(res){return function(err,rows,fields){
    if(err){
      console.log("Error: couldn't list transaction");
      console.log(err);
    }
    res.send(rows);
  }})(res));
});

app.get("/login/:user/:pass", function(req,res) {
  var resp = {};
  var user = req.params.user;
  var pass = req.params.pass;
  var sql = "SELECT * FROM fluto006.user_info WHERE user = '" +user+ "'";
  console.log("Calling " + sql);
  connection.query(sql,(function(res){
    return function(err,rows,fields){
     if(err){
       resp.err = err;
       console.log("Houston we have a problem (again): ");
       console.log(err);
     }
     resp.correct = rows[0].password == pass;
     res.send(resp);
  }})(res));
});



app.listen(port);

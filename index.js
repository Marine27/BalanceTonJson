'use strict'

var express = require('express');
var app = express();

const port = process.env.PORT || 3000 ;

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname + '/index.html'));})

app.listen(port, function () {
    console.log('Serveur listening on port ' + port);
});

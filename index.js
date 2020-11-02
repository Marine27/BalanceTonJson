'use strict'

var express = require('express');
var app = express();

const port = process.env.PORT || 3000 ;

app.get("/", function(req, res){
    res.sendFile('index.html');
});

app.listen(port, function () {
    console.log('Serveur listening on port ' + port);
});

'use strict'

var express = require('express');
var app = express();
const monumentJson = "https://geoweb.iau-idf.fr/agsmap1/rest/services/OPENDATA/OpendataDRAC/MapServer/4/query?where=1%3D1&outFields=*&outSR=4326&f=json"
const velibJson = "https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=139&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes"
const port = process.env.PORT || 3000;

var fetch = require('node-fetch');
var https = require('https');
var cors = require('cors');

var corsOptions = {
    origin: 'https://acanetti.github.io/BalanceTonJson/',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

//app.options('*', cors()) // Enabling CORS Pre-Flight

//serves static files
app.use(express.static('docs'));


//ROUTES
app.get("/", function(req, res) {
    res.send("helloWorld !");
})

/*
app.get("/:name", function(req, res) {
    res.send("hello : " + req.params.name);
})
*/



app.get("/velib", cors(corsOptions), function(req, res) {

    let url = velibJson;
    fetch(url)
        .then(res => res.json())
        .then(json => {
            var data=json.records
            if (req.query.minbike != null){
            data=data.filter(x => x['fields']["numbikesavailable"] >= req.query.minbike) ;
            }

            else if (req.query.maxbike != null){
                data=data.filter(x => x['fields']["numbikesavailable"] <= req.query.maxbike) ;
            }


            if (req.query.longitude != null && req.query.latitude != null){
                data=data.filter(function(x){
                                    let arr= x['fields']["coordonnees_geo"] ;

                                    return  arr[0] === req.query.longitude &&  arr[1] === req.query.latitude ; } ) ;
            }


            res.send(data)


















        });
})



//Monuments requete
app.get("monuments", cors(corsOptions), function(req, res) {

        let url = monumentJson;
        fetch(url)
            .then(res => res.json())
            .then(json => {
                console.log("fetchair", json);
                res.send("data fetched look your console");
            });
    })

    /* v2 pour fetch
    app.get("/requestair/velib", function(req, res) {

        let url = velibJson;
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });
            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                console.log("requestair", JSON.parse(data));
                res.send("data requested look your console");
            });

        }).on("error", (err) => {
            console.log("Error: " + err.message);
            res.send("nope request didnt work");
        });
    })
    */

app.listen(port, function() {
    console.log('Serveur listening on port ' + port);
})

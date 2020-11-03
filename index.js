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



app.get("/velib", cors(corsOptions), function(req, res) {
    res.send(apiVelib(req.query))
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

app.listen(port, function() {
    console.log('Serveur listening on port ' + port);
})


// Function for app.get/ post request //
// ============================================== //

function apiVelib(kargs){
    let url = velibJson;
    fetch(url)
        .then(res => res.json())
        .then(json => {
            var data=json.records
            if (kargs.minbike != null){
                data=data.filter(x => x['fields']["numbikesavailable"] >= req.query.minbike) ;
                console.log(data)
            }

            if (kargs.maxbike != null){
                data=data.filter(x => x['fields']["numbikesavailable"] <= req.query.maxbike) ;
                console.log(data)
            }


            if (kargs.lon != null && kargs.lat != null && kargs.radial != null){
                data=data.filter(function(x){
                    let arr= x['fields']["coordonnees_geo"] ;
                    let distance_point= (arr[0]-kargs.lon)**2 + (arr[1]-kargs.lat)**2
                    return  distance_point < req.query.radial**2 ; } ) ;
            }


            return data

        });



}
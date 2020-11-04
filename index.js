'use strict'

var express = require('express');
var app = express();


const monumentJson = "https://geoweb.iau-idf.fr/agsmap1/rest/services/OPENDATA/OpendataDRAC/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"
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


//Velib api
app.get("/velib", cors(corsOptions), function(req, res) {
    fetch(velibJson)
        .then(res => res.json())
        .then(json => {
            let data = apiVelib(req.query,json)
            res.send(data)

        });

})




//Monuments requete
app.get("/monuments", cors(corsOptions), function(req, res) {


        fetch(monumentJson)
            .then(res => res.json())
            .then(json => {


                let data= apiMonument(req.query,json)
                res.send(data);


            });
    })

app.listen(port, function() {
    console.log('Serveur listening on port ' + port);
})

//api full
app.get("/api", cors(corsOptions), function(req, res) {

    Promise.all([
        fetch(velibJson),
        fetch(monumentJson)
    ]).then(function (res) {
        // Get a JSON object from each of the responses
        return Promise.all(res.map(function (res) {
            return res.json();
        }));
    }).then(function (data) {
        let monfields= data[1].fields
        let velfields = data[0].parameters.facet


        data[0]= apiVelib(req.query,data[0]) ;
        data[1]= apiMonument(req.query,data[1]) ;

        let dataset= {
            'data':{'monuments': data[1], 'velib': data[0]},
            'param': {'monuments': monfields, 'velib': velfields}
        } ;
        res.send(dataset)
    })

})



// Function for app.get/ post request //
// ============================================== //

function apiVelib(kargs,json){
    console.log(kargs) ;
    var data=json.records;
    data = data.map(x => x.fields)
    if (kargs.minbike != null){

        data=data.filter(x => x["numbikesavailable"] >= kargs.minbike) ;

    }
    if (kargs.maxbike != null){
        data=data.filter(x => x["numbikesavailable"] <= kargsf.maxbike) ;

    }

    if (kargs.lon != null && kargs.lat != null && kargs.radial != null){
        data=data.filter(function(x){
            let arr= x["coordonnees_geo"] ;
            let distance_point= CoordDist(arr[1],arr[0], kargs.lat,kargs.lon);
            console.log(distance_point)
            return  distance_point < kargs.radial ; } ) ;
    }
    return data ;
}

function apiMonument(kargs,json){
    console.log(kargs) ;
    var data=json.features ;

    if(kargs.archi != null){
        data= data.filter(x=>x.attributes.type_archi === kargs.archi) ;
    }

    if(kargs.arrondissement != null){
        data =data.filter(x =>x.attributes.nomcom.includes(kargs.arrondissement) );
    }

    if (kargs.lon != null && kargs.lat != null && kargs.radial != null){
        data=data.filter(function(x){
            let arr= x.geometry.rings[0][0];
            let distance_point= CoordDist(arr[0],arr[1], kargs.lat,kargs.lon);
            return  distance_point < kargs.radial ; } ) ;
    }
    return data ;
}




// Utils Fonction //

function CoordDist(lat1, lon1, lat2, lon2,) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344

        return dist;
    }
}

'use strict'

let express = require('express');
let app = express();


const monumentJson = "https://geoweb.iau-idf.fr/agsmap1/rest/services/OPENDATA/OpendataDRAC/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json"
const velibJson = "https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=139&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes"
const port = process.env.PORT || 3000;

let fetch = require('node-fetch');
let https = require('https');
let cors = require('cors');
let bodyParser = require('body-parser');

// use all route definitions and all origin
app.use(cors({ origin: '*' }));

//serves static files
app.use(express.static('docs'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//ROUTES

//Velib stations requete
app.get("/velibstations", function(req, res) {
    fetch(velibJson)
        .then(res => res.json())
        .then(json => {
            let data = apiVelib(req.query, json);
            console.log("velib get ok");
            let rdf = '<test>'
            rdf = xml_velibstations(rdf, data)
            rdf += '</test>'
            console.log(rdf)
            res.send(rdf);
        });
})


//Monuments requete
app.get("/monuments", function(req, res) {
    fetch(monumentJson)
        .then(res => res.json())
        .then(json => {
            let data = apiMonument(req.query, json);
            console.log("monuments get ok");
            let rdf = '<test>'
            rdf = xml_monuments(rdf, data);
            console.log(rdf);
            res.send(rdf);
        });
})

app.listen(port, function() {
    console.log('Serveur listening on port ' + port);
})

//Locations monuments and velib sations requete
app.get("/locations", function(req, res) {
    if (req.query.download) {
        res.set("Content-Disposition", "attachment;filename=locations.json");
    }
    Promise.all([
        fetch(velibJson),
        fetch(monumentJson)
    ]).then(function(res) {
        // Get a JSON object from each of the responses
        return Promise.all(res.map(function(res) {
            return res.json();
        }));
    }).then(function(data) {
        let monfields = data[1].fields;
        let velfields = data[0].parameters.facet;


        data[0] = apiVelib(req.query, data[0]);
        data[1] = apiMonument(req.query, data[1]);

        let dataset = {
            'data': { 'monuments': data[1], 'station_velib': data[0] },
            'param': { 'monuments': monfields, 'station_velib': velfields }
        };
        res.send(dataset);
    })

})



// Function for app.get/ post request //
// ============================================== //

function apiVelib(kargs, json) {
    console.log(kargs);
    let data = json.records;
    data = data.map(x => x.fields)
    if (kargs.minbike != null) {

        data = data.filter(x => x["numbikesavailable"] >= kargs.minbike);

    }
    if (kargs.maxbike != null) {
        data = data.filter(x => x["numbikesavailable"] <= kargs.maxbike);

    }

    if (kargs.lon != null && kargs.lat != null && kargs.radial != null) {
        data = data.filter(function(x) {
            let arr = x["coordonnees_geo"];
            let distance_point = CoordDist(arr[0], arr[1], kargs.lat, kargs.lon);
            console.log(distance_point)
            return distance_point < kargs.radial;
        });
    }
    return data;
}

function apiMonument(kargs, json) {
    console.log(kargs);
    let data = json.features;

    if (kargs.archi != null) {
        data = data.filter(x => x.attributes.type_archi === kargs.archi);
    }

    if (kargs.lon != null && kargs.lat != null && kargs.radial != null) {
        data = data.filter(function(x) {
            let arr = x.geometry.rings[0][0];
            let distance_point = CoordDist(arr[1], arr[0], kargs.lat, kargs.lon);
            return distance_point < kargs.radial;
        });
    }
    return data;
}




// Utils Fonction //


function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Returns the distance between 2 points of coordinates in Google Maps
 *
 * @see https://stackoverflow.com/a/1502821/4241030
 * @param lat1 Latitude of the point A
 * @param lng1 Longitude of the point A
 * @param lat2 Latitude of the point B
 * @param lng2 Longitude of the point B
 */
function CoordDist(lat1, lng1, lat2, lng2) {
    // The radius of the planet earth in meters
    let R = 6378137;
    let dLat = degreesToRadians(lat2 - lat1);
    let dLong = degreesToRadians(lng2 - lng1);
    let a = Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
        Math.cos(degreesToRadians(lat1)) *
        Math.cos(degreesToRadians(lat1)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));


    return R * c;
}


function xml_monuments(rdf, data) {

    data.forEach(function(x) {
        rdf += ' \t \t <balancetonjson:monuments> \n '
        rdf += ' \t \t \t <balancetonjson:type_archi>' + x.attributes.type_archi + '</balancetonjson:type_archi> \n '
        rdf += ' \t \t \t <balancetonjson:type_prot> ' + x.attributes.type_prot + ' </balancetonjson:type_prot> \n '
        rdf += ' \t \t \t <balancetonjson:protection>' + x.attributes.protection + '  </balancetonjson:protection> \n'
        rdf += ' \t \t \t <balancetonjson:inserimmeu>' + x.attributes.inserimmeu + '</balancetonjson:inserimmeu> \n'
        rdf += ' \t \t \t <balancetonjson:lien_merim>' + x.attributes.lien_merim + '</balancetonjson:lien_merim> \n'
        rdf += ' \t \t \t <balancetonjson:merimimm>' + x.attributes.merimimm + '</balancetonjson:merimimm> \n'
        rdf += ' \t \t \t <balancetonjson:nomcom>' + x.attributes.nomcom + '</balancetonjson:nomcom> \n'
        rdf += ' \t \t \t <balancetonjson:object_id>' + x.attributes.object_id + '</balancetonjson:object_id> \n '
        rdf += ' \t \t \t <balancetonjson:locations> \n'
        rdf += '\t \t \t \t <balancetonjson:latitude>' + x.geometry.rings[0][0][1] + ' </balancetonjson:latitude> \n'
        rdf += '\t \t \t \t <balancetonjson:longitude>' + x.geometry.rings[0][0][0] + ' </balancetonjson:longitude> \n'
        rdf += ' \t \t \t </balancetonjson:locations> \n'
        rdf += ' \t \t </balancetonjson:monuments> \n '
    })
    return rdf;

}

function xml_velibstations(rdf, data) {

    data.forEach(function(x) {
        rdf += '\t \t <balancetonjson:velibstations> \n '
        rdf += '\t \t \t <balancetonjson:ebike> ' + x.ebike + ' </balancetonjson:ebike> \n'
        rdf += '\t \t \t <balancetonjson:capacity>' + x.capacity + '</balancetonjson:capacity>\n'
        rdf += '\t \t \t <balancetonjson:name>' + x.name + ' </balancetonjson:name>\n'
        rdf += '\t \t \t <balancetonjson:nom_arrondissement_communes>' + x.nom_arrondissement_communes + ' </balancetonjson:nom_arrondissement_communes> \n'
        rdf += '\t \t \t <balancetonjson:numbikesavailable>' + x.numbikesavailable + '</balancetonjson:numbikesavailable> \n'
        rdf += '\t \t \t <balancetonjson:is_installed>' + x.is_installed + ' </balancetonjson:is_installed> \n'
        rdf += '\t \t \t <balancetonjson:is_renting>' + x.is_renting + ' </balancetonjson:is_renting> \n'
        rdf += '\t \t \t <balancetonjson:mechanical>' + x.mechanical + '</balancetonjson:mechanical> \n'
        rdf += '\t \t \t <balancetonjson:stationcode>' + x.stationcode + ' </balancetonjson:stationcode> \n'
        rdf += '\t \t \t <balancetonjson:numdocksavailable>' + x.numdocksavailable + '</balancetonjson:numdocksavailable>\n'
        rdf += '\t \t \t <balancetonjson:duedate>' + x.duedate + ' </balancetonjson:duedate>\n'
        rdf += '\t \t \t <balancetonjson:is_returning>' + x.is_returning + ' </balancetonjson:is_returning> \n'
        rdf += '\t \t \t <balancetonjson:location> \n'
        rdf += '\t \t \t \t <balancetonjson:latitude>' + x.coordonnees_geo[0] + '</balancetonjson:latitude>\n '
        rdf += '\t \t \t \t <balancetonjson:longitude>' + x.coordonnees_geo[1] + ' </balancetonjson:longitude>\n '
        rdf += '\t \t \t </balancetonjson:location> \n'
        rdf += '\t \t </balancetonjson:velibstations> \n'
    })

    return rdf
}
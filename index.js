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
            res.format({
                'application/json': function () {
                    res.send(data)
                },

                'application/xml+rdf': function () {
                    let xml_rdf= send_xml_velibstations(data, '/velibstations')
                    res.send(xml_rdf)
                },


                default: function () {
                    res.status(406).send('Not Acceptable')
                }
            })
        });
})


//Monuments requete
app.get("/monuments", function(req, res) {
    fetch(monumentJson)
        .then(res => res.json())
        .then(json => {
            let data = apiMonument(req.query, json);
            res.format({
                'application/json': function () {
                    res.send(data)
                },
                'application/xml+rdf': function () {
                    let xml_rdf= send_xml_monuments(data, '/monuments')
                    res.send(xml_rdf)
                },



                default: function () {
                    res.status(406).send('Not Acceptable')
                }
            })
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
        res.format({


            'application/json': function () {
                let dataset = {
                    'data': { 'monuments': data[1], 'station_velib': data[0] },
                    'param': { 'monuments': monfields, 'station_velib': velfields }
                };
                res.send(dataset);
            },
            'application/xml+rdf': function () {
                let xml_rdf=send_xml_locations(data[0],data[1],req.originalUrl)
                res.send(xml_rdf)
            },

            default: function () {
                res.status(406).send('Not Acceptable')
            }
        })

    })

})


app.get("/scheme_rdf", function(req, res) {
    res.format({
        'application/xml+rdf': function () {
            let xml_rdf = send_scheme_rdf()
            res.send(xml_rdf)
        },
        default: function () {
            res.status(406).send('Not Acceptable')
        }
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

// fonction de calcul de distance entre deux points selon coordonnées //
// source : https://ourcodeworld.com/articles/read/1021/how-to-calculate-the-distance-between-2-markers-coordinates-in-google-maps-with-javascript //
/**
 * Returns the distance between 2 points of coordinates in Google Maps
 *@see https://ourcodeworld.com/articles/read/1021/how-to-calculate-the-distance-between-2-markers-coordinates-in-google-maps-with-javascript
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
        rdf += ' \t \t <balancetonjson:monument> \n '
        rdf += ' \t \t \t <balancetonjson:type_archi>' + x.attributes.type_archi + '</balancetonjson:type_archi> \n '
        rdf += ' \t \t \t <balancetonjson:type_prot> ' + x.attributes.type_prot + ' </balancetonjson:type_prot> \n '
        rdf += ' \t \t \t <balancetonjson:protection>' + x.attributes.protection + '  </balancetonjson:protection> \n'
        rdf += ' \t \t \t <balancetonjson:inserimmeu>' + x.attributes.inserimmeu + '</balancetonjson:inserimmeu> \n'
        rdf += ' \t \t \t <balancetonjson:lien_merim>' + x.attributes.lien_merim + '</balancetonjson:lien_merim> \n'
        rdf += ' \t \t \t <balancetonjson:merimimm>' + x.attributes.merimimm + '</balancetonjson:merimimm> \n'
        rdf += ' \t \t \t <balancetonjson:nomcom>' + x.attributes.nomcom + '</balancetonjson:nomcom> \n'
        rdf += ' \t \t \t <balancetonjson:object_id>' + x.attributes.object_id + '</balancetonjson:object_id> \n '
        rdf += ' \t \t \t <balancetonjson:coordonnees_geo> \n'
        rdf += '\t \t \t \t <balancetonjson:latitude>' + x.geometry.rings[0][0][1] + ' </balancetonjson:latitude> \n'
        rdf += '\t \t \t \t <balancetonjson:longitude>' + x.geometry.rings[0][0][0] + ' </balancetonjson:longitude> \n'
        rdf += ' \t \t \t </balancetonjson:coordonnees_geo> \n'
        rdf += ' \t \t </balancetonjson:monument> \n '
    })
    return rdf;

}

function xml_velibstations(rdf, data) {

    data.forEach(function(x) {
        rdf += '\t \t <balancetonjson:velibstation> \n '
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
        rdf += '\t \t \t <balancetonjson:coordonnees_geo> \n'
        rdf += '\t \t \t \t <balancetonjson:latitude>' + x.coordonnees_geo[0] + '</balancetonjson:latitude>\n '
        rdf += '\t \t \t \t <balancetonjson:longitude>' + x.coordonnees_geo[1] + ' </balancetonjson:longitude>\n '
        rdf += '\t \t \t </balancetonjson:coordonnees_geo> \n'
        rdf += '\t \t </balancetonjson:velibstation> \n'
    })

    return rdf
}

function send_xml_velibstations(data,head){
    let rdf = '<?xml version="1.0"?>\n'
     rdf +="<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:si=\"https://www.w3schools.com/rdf/\""
     rdf += " xmlns:balancetonjson = \"https://balancetonjson.herokuapp.com"+head+ "\">\n"
     rdf += " \t <balancetonsjon:velibstations> \n"
     rdf = xml_velibstations(rdf,data)
     rdf += " \t </balancetonsjon:velibstations> \n"
     return rdf

}

function send_xml_monuments(data,head){
    let rdf = '<?xml version="1.0"?>\n'
    rdf +="<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:si=\"https://www.w3schools.com/rdf/\""
    rdf += " xmlns:balancetonjson = \"https://balancetonjson.herokuapp.com"+head+ "\">\n"
    rdf += " \t <balancetonsjon:monuments> \n"
    rdf = xml_monuments(rdf,data)
    rdf += " \t </balancetonsjon:monuments>\n"

    return rdf


}

function send_xml_locations(data_velib,data_monuments,head){
    let rdf = '<?xml version="1.0"?>\n'
    rdf +="<rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\" xmlns:si=\"https://www.w3schools.com/rdf/\""
    rdf += " xmlns:balancetonjson = \"https://balancetonjson.herokuapp.com"+head+ "\">\n"
    rdf += " \t <balancetonsjon:locations> \n"
    rdf = xml_velibstations(rdf,data_velib)
    rdf += xml_monuments(rdf,data_monuments)
    rdf += " \t </balancetonsjon:locations> \n"
    return rdf
}

function send_scheme_rdf() {
    var rdfscheme = "<?xml version=\"1.0\"?>\n\n"
    rdfscheme += "    <rdf:RDF xmlns:rdf=\"#\" xmlns:rdfs=\"#\" xmlns:dc=\"\">\n\n   "
    rdfscheme += "<rdfs:Class rdf:about=\"mondomain/rdfvocabulary#Velibstations\">\n     "
    rdfscheme += "<rdfs:label xml:lang=\"fr\">velibstations</rdfs:label>\n        "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">stationement des vélos libre service dans la région ile-de-france</rdfs:comment>\n "
    rdfscheme += " <rdfs:Class/>\n        </rdfs:Class>\n     "
    rdfscheme += "<rdfs:Class rdf:about=\"/rdfvocabulary#ebike\">\n      "
    rdfscheme += "<rdfs:label xml:lang=\"en\">ebike</rdfs:label>\n      "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> Le nombre de vélos électriques</rdfs:comment>\n   "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#capacity\">\n     "
    rdfscheme += "rdfs:label xlm:lang = \"en\">capacity</rdfs:label>\n     "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">La capacité maximale de vélibs pouvant être accueilli à la station</rdfs:comment>\n "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#name\">\n  "
    rdfscheme += "<rdfs:label xlm:lang = \"en\">name</rdfs:label>\n     "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">Le nom de la station</rdfs:comment>\n   "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#nom_arrondissement_communes\">\n    "
    rdfscheme += "<rdfs:label xlm:lang = \"fr\">nom_arrondissement_communes</rdfs:label>\n     "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">Nom de la commune /  de l'arrondissement</rdfs:comment>\n   "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#numbikesavailable\">\n    "
    rdfscheme += "<rdfs:label xlm:lang = \"en\">numbikesavailable</rdfs:label>\n    "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">Le nombre de vélos disponibles</rdfs:comment>\n  "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#is_installed\">\n    "
    rdfscheme += "<rdfs:label xlm:lang = \"en\">is_installed</rdfs:label>\n     "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> Savoir si la station de vélib est en service</rdfs:comment>\n  "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#is_renting\">\n     "
    rdfscheme += "<rdfs:label xlm:lang = \"en\">is_renting</rdfs:label>\n    "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> Savoir si la station permet l'emprunt de Vélibs</rdfs:comment>\n     "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#mechanical\">\n      "
    rdfscheme += "<rdfs:label xlm:lang = \"en\">mechanical</rdfs:label>\n      "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> Nombre de vélos sans assistance éléctrique présents</rdfs:comment>\n   "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#stationcode\">\n    "
    rdfscheme += "<rdfs:label xlm:lang = \"en\">stationcode</rdfs:label>\n     "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">Identifiant de la station</rdfs:comment>\n   "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#coordonnees_geo\">\n    "
    rdfscheme += "<rdfs:label xlm:lang = \"en\">coordonnees_geo</rdfs:label>\n    "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">Coordonées de la station</rdfs:comment>\n  "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#numdocksavailables\">\n    "
    rdfscheme += "<rdfs:label xlm:lang = \"en\">numdocksavailable</rdfs:label>\n     "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">Nombre de vélos disponibles (éléctrique et non éléctrique)</rdfs:comment>\n  "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#duedate\">\n  "
    rdfscheme += "<rdfs:label xlm:lang = \"en\">duedate</rdfs:label>\n    "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">Date de mise à jour des données</rdfs:comment>\n   "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#is_returning\">\n     "
    rdfscheme += "<rdfs:label xlm:lang = \"en\">is_returning</rdfs:label>\n       "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> Savoir si  la station permet le retour de Vélibs</rdfs:comment>\n  "
    rdfscheme += "</rdfs:Class>\n"
    rdfscheme += "<rdfs:Class rdf:about=\"mondomain/rdfvocabulary#monuments\">\n    "
    rdfscheme += "<rdfs:label xml:lang=\"en\">monuments\"</rdfs:label>\n       "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">Les monuments dans la région ile-de-france</rdfs:comment>\n  "
    rdfscheme += "</rdfs:Class>\n\n        <rdfs:Class rdf:about=\"mondomain/rdfvocabulary#coordonnees_geo\">\n   "
    rdfscheme += "<rdfs:label xml:lang=\"en\">coordonnees_geo</rdfs:label>\n      "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> .... </rdfs:comment>\n     "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"mondomain/rdfvocabulary#Type_archi\">\n    "
    rdfscheme += "<rdfs:label xml:lang=\"en\">Type_archi</rdfs:label>\n         "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> Type d'achitecture du monument </rdfs:comment>\n   "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#Type_prot\">\n      "
    rdfscheme += "<rdfs:label xml:lang=\"en\">Type_prot</rdfs:label>\n       "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> Type .... </rdfs:comment>\n    "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#Protection\">\n     "
    rdfscheme += "<rdfs:label xml:lang=\"en\">Protection</rdfs:label>\n      "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> .... </rdfs:comment>\n    "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#Inseeimmeu\">\n   "
    rdfscheme += "<rdfs:label xml:lang=\"en\">Inseeimmeu</rdfs:label>\n    "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> .... </rdfs:comment>\n     "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#Lien_merim\">\n  "
    rdfscheme += "<rdfs:label xml:lang=\"en\">Lien_merim</rdfs:label>\n      "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> .... </rdfs:comment>\n   "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#Merimimm\">\n    "
    rdfscheme += "<rdfs:label xml:lang=\"en\">Merimimm</rdfs:label>\n     "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> .... </rdfs:comment>\n   "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#Nomcom\">\n    "
    rdfscheme += "<rdfs:label xml:lang=\"fr\">Nomcom</rdfs:label>\n  "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> Nom de la commune</rdfs:comment>\n    "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"/rdfvocabulary#ObjectID\">\n     "
    rdfscheme += "<rdfs:label xml:lang=\"en\">ObjectID</rdfs:label>\n    "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\"> .... </rdfs:comment>\n   "
    rdfscheme += "</rdfs:Class>\n"
    rdfscheme += "<rdfs:Class rdf:about=\"mondomain/rdfvocabulary#Locations\">\n   "
    rdfscheme += "<rdfs:label xml:lang=\"en\">Locations</rdfs:label>\n       "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">Localisation d'une adresse </rdfs:comment>\n    "
    rdfscheme += "</rdfs:Class>\n        <rdfs:Class rdf:about=\"mondomain/rdfvocabulary#coordonnees_geo\">\n  "
    rdfscheme += "<rdfs:label xml:lang=\"fr\">coordonnees_geo</rdfs:label>\n   "
    rdfscheme += "<rdfs:comment xml:lang=\"fr\">Les coordonnées géographique d'une adresse </rdfs:comment>\n "
    rdfscheme += "</rdfs:Class>"

    return rdfscheme
}



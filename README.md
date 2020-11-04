# Projet Open Data

Cours : V3FMI5 - Open Data et Web des données SHS

Professeur : Antoine Seilles : https://github.com/natoine

Membres du groupe: BOBO Florian, BOUJEMAOUI Ali,
Canetti Axel-Bryan, CORROËNNE Théophile, PLA-COMES Marine, RANDRIANJANAHARY Sariaka



GitHubPages: https://acanetti.github.io/BalanceTonJson/

Page Heroku: https://balance-ton-json.herokuapp.com/

## Description du Projet

On a choisi d’utiliser les données des vélibs dans la ville de Paris ainsi que celle des monuments. 
On fait des requêtes pour récupérer tout les monuments et dans le cas des vélos nous ne récupérons que les stations concernées par la localisation renseignée par l’utilisateur afin d’avoir les données en temps réel.
Les deux sources de données sont liées entre elles à l’aide de leur proximité géographique.
L’utilisateur a le choix du format des données retournées par le serveur que ça soit Json ou Rdf/Xml grâce à la négociation de contenu.

Vélib in Paris: https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=139&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes


Justification: Cette source est choisie car elle offre plusieurs avantages. En effet, elle est strcuturée d'une manière cohérente mettant en lumère plusieurs attributs en temps réel. Parmi ces attributs: 
-les coordonnées geo de la station velib: lattitude et longitude
-"capacity" et "numberofbikesavailable" qui sont respectivement la capacité totale de la station et le nombre de velib disponibles. Parmi ceux ci, les attributs "ebike" et "mechanical" donne le nombre de velib electrique et mécaniques disponibles. 
-"numberdockavailables" rend compte de la disponibilités des lieux de restitution des velib. 
-"is_installed", "is_renting" et "is_returning" booléens rendant compte de l'existence de la station velib, sa capacité à preter en temps réel et à recevoir des velibs. 




Monuments à Paris: https://geoweb.iau-idf.fr/agsmap1/rest/services/OPENDATA/OpendataDRAC/MapServer/4/query?where=1%3D1&outFields=*&outSR=4326&f=json

Justification: 

## URL permettent de récupérer les données

https://balance-ton-json.herokuapp.com/api?lat=48.858370&lon=2.294481&radial=900

- Requête pour récuperer les monuments de Paris:
    GET /monuments
- Requête pour récuperer les stations de vélibs à Paris ainsi que les données les concernant:
    GET /velib
- Requête pour récuperer l'ensemble des Stations de Vélibs et des Monuments parisiens:
    GET /api
- Requête pour récuperer données selon certains paramêtres:
    GET /api?parameter (minbike,maxbike,lon,lat,radial,monument,arrondissement)

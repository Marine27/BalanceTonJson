# Projet Open Data : Le Vélotour Culturel Parisien (à modifier avec vrai titre)


### Les membres de l'équipe:
- BOBO Florian
- BOUJEMAOUI Ali
- Canetti Axel-Bryan
- CORROËNNE Théophile
- PLA-COMES Marine
- RANDRIANJANAHARY Sariaka

### Encadrant:
-Antoine Seilles : https://github.com/natoine
* V3FMI5 - Open Data et Web des données SHS

## Page du site "Le Vélotour Culturel Parisien":

* Page Heroku: https://balance-ton-json.herokuapp.com/

## API du "Vélotour Culturel Parisien":


"""
- Requête pour récuperer les monuments de Paris:  
    GET /monuments
 - Requête pour récuperer les stations de vélibs à Paris ainsi que les données les concernant:  
     GET /velibstations
 - Requête pour récuperer l'ensemble des Stations de Vélibs et des Monuments parisiens, peut-être utilisé également avec des paramétres afin d'obtenir les données souhaitées (minbike,maxbike,lon,lat,radial,monument,arrondissement):  
     GET /locations
 """

* Requête sur la première source de données:
`Exemple: `

Format Json: 

Format Xml:

Requête pour récuperer les monuments de Paris

* Requête sur la deuxième source de données:
`Exemple: `

Format Json: 

Format Xml:

Requête pour récuperer les stations de vélibs à Paris ainsi que les données les concernant

* Requête sur les deux sources de données:
`Exemple: https://balance-ton-json.herokuapp.com/velibstations?lat=48.858370&lon=2.294481&radial=900`

Format Json: https://balance-ton-json.herokuapp.com/locations?lat=48.858370&lon=2.294481&radial=900

Format Xml:

Requête pour récuperer l'ensemble des Stations de Vélibs et des Monuments parisiens, peut-être utilisé également avec des paramétres afin d'obtenir les données souhaitées (minbike,maxbike,lon,lat,radial,monument,arrondissement)

Explication pour une requête: GET /velib renvoie la collection des stations velib à l'aide d'un fetch en respectant les options CORS. Le serveur renvoie les données au format json. La requête utilise apiVelib. __apiVelib__ exécutent plusieurs filtres sur les données.

## Description du Projet

### Source de nos données
* Vélib in Paris: https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=139&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes

* Monuments à Paris: https://geoweb.iau-idf.fr/agsmap1/rest/services/OPENDATA/OpendataDRAC/MapServer/4/query?where=1%3D1&outFields=*&outSR=4326&f=json

### Vélib In Paris

API regroupant les informations concerant l'ensemble des stations de Vélibs de la ville de Paris. Cette source est choisie car elle est strcuturée d'une manière cohérente mettant en lumère plusieurs attributs en temps réel. Parmi ces attributs: 

-les coordonnées geo de la station velib: lattitude et longitude

-"capacity" et "numberofbikesavailable" qui sont respectivement la capacité totale de la station et le nombre de velib disponibles. Parmi ceux ci, les attributs "ebike" et "mechanical" donne le nombre de velib electrique et mécaniques disponibles. 

-"numberdockavailables" rend compte de la disponibilités des lieux de restitution des velib. 

-"is_installed", "is_renting" et "is_returning" booléens rendant compte de l'existence de la station velib, sa capacité à preter en temps réel et à recevoir des velibs. 

### Monuments à Paris

API regroupant l'ensemble des monuments de Paris. Elle permet d'acceder à un ensemble de données concernant les monuments ainsi qu'à leur localisation. Voici quelques un des attributs disponibles:

- AJOUTER LES ATTRIBUTS

## Nos choix de données

#### L'application, ses objectifs, vos balades

Dans le contexte actuel, qu'on se place d'un point de vue écologique ou d'un point de vue sanitaire, il faut d'un coté limité les interactions socials tout en évitant au maximum d'utiliser les vehicules à moteur. Si il n'y a pas de confinement, c'est le moment pour vous d'aller visiter la capital de la France, une des trois villes les plus visitées chaque année dans le monde que vous ne connaissez probablement pas aussi bien que vous le croyez. Nous avons pensé notre application afin de minimiser tant que possible votre empreinte carbone lors de vos visite, de vous éviter au maximum les interactions socials et le tout en faisant faire de l'exercice. En effet grâce à notre application vous pourrez connaitre l'emplacement des stations de vélibs, la quantité de Vélos disponibles et bien évidemment l'ensemble des monuments parisiens afin que vous ne ratiez pas une miette de ce musée taille réel qu'est Paris. 

#### La cohérence des données

On voulait réaliser un projet cohérent avec l'epoque actuelle, c'est pour cela que nous nous sommes tournés vers les velib. Nous avons décidé de croiser ces données avec celle des monuments de Paris car la culture est quelque chose qui doit se cultiver en tout temps. L'avantage de nos deux sources de données c'est qu'elles utilisent toute les deux des données géographiques ce qui nous permet de les croiser à l'aide d'un carte afin qu'elles s'enrichissent mutuellement.

## Méthodes utilisées

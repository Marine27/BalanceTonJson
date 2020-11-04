# Projet Open Data

Cours : V3FMI5 - Open Data et Web des données SHS

Professeur : Antoine Seilles : https://github.com/natoine

Membres du groupe: BOBO Florian, BOUJEMAOUI Ali,
Canetti Axel-Bryan, CORROËNNE Théophile, PLA-COMES Marine, RANDRIANJANAHARY Sariaka



GitHubPages: https://acanetti.github.io/BalanceTonJson/

Page Heroku: https://balance-ton-json.herokuapp.com/

Lien du trello: https://trello.com/invite/b/IOkV5OEf/187981e70f1efdc390e5afad2e006dc0/balancetonjson

Lien du Scrumblr (tableau des tâches à réaliser): http://scrumblr.ca/OpenData%20la%20team%20

## Description du Projet

On a choisi d’utiliser les données des vélibs dans la ville de Paris ainsi que celle des monuments. 
On fait des requêtes pour récupérer tout les monuments et dans le cas des vélos nous ne récupérons que les stations concernées par la localisation renseignée par l’utilisateur afin d’avoir les données en temps réel.
Les deux sources de données sont liées entre elles à l’aide de leur proximité géographique.

Vélib in Paris: https://opendata.paris.fr/api/records/1.0/search/?dataset=velib-disponibilite-en-temps-reel&q=&rows=139&facet=name&facet=is_installed&facet=is_renting&facet=is_returning&facet=nom_arrondissement_communes

Monuments à Paris: https://geoweb.iau-idf.fr/agsmap1/rest/services/OPENDATA/OpendataDRAC/MapServer/4/query?where=1%3D1&outFields=*&outSR=4326&f=json

## URL permettent de récupérer les données

https://balance-ton-json.herokuapp.com/api?lat=48.858370&lon=2.294481&radial=900

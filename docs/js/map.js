// Création de la map
class LeafLeatMap {

    constructor(init) {
            this.map = null
            this.bounds = []
            this.init = init
        }
        // Init de la map, utilisation d'openStreetMap
    async load(element) {
            return new Promise((resolve, reject) => {
                $script('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', () => {
                    this.map = L.map(element).setView(this.init, 11)
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        zoom: 1
                    }).addTo(this.map)
                    resolve()
                })
            })

        }
        // Ajout de station sur la map, appel de la classe leafLetMarker
    addMarker(point, txt, id, className) {
            this.bounds.push(point)
            return new leafLetMarker(point, txt, this.map, id, className)
        }
        // Centrage de la map sur les marqueurs ajoutées
    center() {
        this.map.fitBounds(this.bounds)
    }
}






// Marqueurs leafLeft
class leafLetMarker {
    constructor(point, txt, map, id, className) {

            var popup = L.popup({
                    autoClose: false,
                    closeOnEscapeKey: false,
                    closeOnClick: false,
                    className: className,
                    maxWidth: 400
                })
                .setLatLng(point)
                .setContent(txt)
                .openOn(map)

        }
        // Fonction d'activation de la popup en cas de mouseover
    setActive() {
            this.popup.getElement().classList.add('is-active')
        }
        // Repasser la popup en mode normal aprés le mouseover
    unsetActive() {
        this.popup.getElement().classList.remove('is-active')
    }
    addEventListener(event, cv) {
        this.popup.addEventListener('add', () => {
            this.popup.getElement().addEventListener(event, cb)
        })
    }
    setContent(text) {
        this.popup.setContent(text)
        this.popup.update()
    }
}
// fct d'initialisation de la map
const initMap = async function(point) {
    let hoverMarker = null
    map = new LeafLeatMap(point); // Création variable map
    await map.load($map) // Chargement de la map depuis openstreetmap sur la var map

    //console.log(data)


    //console.log(station)
    //let stations = Array.from(document.querySelectorAll('.markers'))
    /*
    console.log('Stations : ')
    console.log(stations)
    //stations.forEach((item) => {
    item.addEventListener('mouseover',function(event){
        if(hoverMarker != null){
            hoverMarker.unsetActive();
        }
        item.setActive()
        hoverMarker = item
    })
     */
    //})

}

// Fcts de créations de popups en fct des données
function importMarkers(data) {
    $('.leaflet-popup-pane').empty(); //reset des popups
    dataVelib = data.station_velib
        //console.log('Velibs : ')
        //console.log(dataVelib[0])
    dataMonum = data.monuments
        //console.log('Monums : ')
        //console.log(dataMonum[0])

    dataVelib.forEach((item) => {
        //console.log(item.fields.name)
        let station = map.addMarker(item.coordonnees_geo,
            item.name,
            item.stationcode,
            'markersStation')
    })

    dataMonum.forEach((item) => {
        //console.log(item.attributes.type_archi.concat(item.attributes.immeuble))
        var coord = item.geometry.rings[0][0] // à definir
        coords = [coord[1],coord[0]]
        //console.log(coords)
        let station = map.addMarker(coords,
            item.attributes.type_archi.concat(item.attributes.immeuble),
            item.attributes.stationcode,
            'MarkersMonum')
    })
    map.center() // Centrage de la map sur les points créés
}
// Si map non existante, lancement de la map

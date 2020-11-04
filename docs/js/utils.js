
const dayDate = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'] ;
var minbike = 0 ;
var monument ;
var radial = 0 ;
const classdiv=['rayon','custom-test']
function displayDate() {


    setTimeout('showDate()', 1000);
}
    function showDate(){
        let date = new Date(), h = date.getHours(), m = date.getMinutes(), day = dayDate[date.getDay()];

        if (h < 10){ h = '0' + h ;}
        if (m <10 ){m = '0' + m ;}
        document.getElementById('timeDisplay').innerHTML = day + '. ' + h + ':' + m

    }


displayDate()


const set_radial = (x) => { radial = x } ;
function displayDiv(classname){
    console.log(classname) ;
    function collapse(x){

        if (x === classname) {
            document.getElementById(x).style.display = 'inline';
        } else {
            document.getElementById(x).style.display = 'none';
        }

    }
        classdiv.forEach(collapse)


                        }
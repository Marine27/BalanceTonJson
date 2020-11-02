
const dayDate = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'] ;

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
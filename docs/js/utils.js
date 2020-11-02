var banniere = document.getElementById('banner');
var texte = banniere.firstElementChild;
var tailleTexte = banniere.scrollWidth;


function defile(){
    var pos = texte.style.marginLeft.replace('px','');
    pos -= 10;
    texte.style.marginLeft = pos+"px";
    setTimeout(defile, 100);

    if(pos < -tailleTexte){
        pos = 200;
    }
}

defile();
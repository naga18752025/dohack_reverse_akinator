function gameStart(){
    document.getElementById("loading3").style.display = "flex";
    localStorage.setItem("reload", "none");
    window.location.href = "game.html";
}

function checkLog(){
    document.getElementById("loading3").style.display = "flex";
    window.location.href = "log.html";
}
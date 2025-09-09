function gameStart(){
    document.getElementById("loading3").style.display = "flex";
    localStorage.setItem("reload", "none");
    window.location.href = "game.html";
}

function checkLog(){
    document.getElementById("loading3").style.display = "flex";
    window.location.href = "log.html";
}

function accountCheck(){
    document.getElementById("loading3").style.display = "flex";
    window.location.href = "account.html";
}

function loginCheck(){
    if(localStorage.getItem("account")){
        document.getElementById("account").textContent = localStorage.getItem("account");
    }
}

loginCheck();
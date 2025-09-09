let loadingTimeout = null;

function startLoading() {
    document.getElementById("loading3").style.display = "flex";
    // 10秒後に「お待ちください」メッセージを表示
    loadingTimeout = setTimeout(() => {
        document.getElementById("long-loading").style.display = "block";
        document.getElementById("mole-game-container").style.display = "flex";
    }, 4000);
}

function stopLoading() {
    // タイマー解除（途中で終わっても表示されないように）
    clearTimeout(loadingTimeout);
    loadingTimeout = null;

    document.getElementById("loading3").style.display = "none";
    document.getElementById("long-loading").style.display = "none";
    document.getElementById("mole-game-container").style.display = "none";
}

function accountCheck(){
    if(localStorage.getItem("account")){
        document.getElementById("no-account").style.display = "none";
        document.getElementById("has-account").style.display = "flex";
        document.getElementById("user-name").textContent = localStorage.getItem("account");
        updateStatus();
    }
}

accountCheck();

function toSignIn(){
    document.getElementById("selection").children[0].classList.add("active");
    document.getElementById("selection").children[1].classList.remove("active");
    document.getElementById("signin-button").style.display = "flex";
    document.getElementById("signup-button").style.display = "none";
}   

function toSignUp(){
    document.getElementById("selection").children[0].classList.remove("active");
    document.getElementById("selection").children[1].classList.add("active");
    document.getElementById("signin-button").style.display = "none";
    document.getElementById("signup-button").style.display = "flex";
}

function toInfo(){
    document.getElementById("selection2").children[0].classList.add("active");
    document.getElementById("selection2").children[1].classList.remove("active");
    document.getElementById("user-status").style.display = "flex";
    document.getElementById("user-setting").style.display = "none";
    document.getElementById("signout-button").style.display = "flex";
}   

function toSetting(){
    document.getElementById("selection2").children[0].classList.remove("active");
    document.getElementById("selection2").children[1].classList.add("active");
    document.getElementById("user-status").style.display = "none";
    document.getElementById("user-setting").style.display = "flex";
    document.getElementById("signout-button").style.display = "none";
}

function updateStatus(){
    const playCount = parseInt(localStorage.getItem("playCount"));
    const correctCount = parseInt(localStorage.getItem("correctCount"));
    document.getElementById("play-count").textContent = playCount;
    document.getElementById("correct-count").textContent = correctCount;
    if(playCount > 0){
        const accuracy = Math.round((correctCount / playCount) * 1000) / 10;
        document.getElementById("correct-rate").textContent = accuracy;
    }
    updateLevel();
}

function updateLevel(){
    if(parseInt(localStorage.getItem("correctCount")) <= 2){
        document.getElementById("level").textContent = "Lv.1 見習い質問者";
    }else if(parseInt(localStorage.getItem("correctCount")) <= 4){
        document.getElementById("level").textContent = "Lv.2 ひよっこ推理家";
    }else if(parseInt(localStorage.getItem("correctCount")) <= 9){
        document.getElementById("level").textContent = "Lv.3 質問の旅人";
    }else if(parseInt(localStorage.getItem("correctCount")) <= 19){
        document.getElementById("level").textContent = "Lv.4 熟考の探求者";
    }else if(parseInt(localStorage.getItem("correctCount")) <= 34){
        document.getElementById("level").textContent = "Lv.5 推理の達人";
    }else if(parseInt(localStorage.getItem("correctCount")) <= 49){
        document.getElementById("level").textContent = "Lv.6 言葉の探偵";
    }else if(parseInt(localStorage.getItem("correctCount")) <= 74){
        document.getElementById("level").textContent = "Lv.7 質問の達人";
    }else if(parseInt(localStorage.getItem("correctCount")) <= 99){
        document.getElementById("level").textContent = "Lv.8 真理を見抜く者";
    }else if(parseInt(localStorage.getItem("correctCount")) <= 149){
        document.getElementById("level").textContent = "Lv.9 真理の探究王";
    }else if(parseInt(localStorage.getItem("correctCount")) >= 150){
        document.getElementById("level").textContent = "Lv.10 逆アキネーター超越者";
    }
}

// 汎用リトライ関数
async function retryOperation(operation, retries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            // リトライしても無駄なエラーは即中断
            if (error === "不正" || error === "使用済") {
                throw error;
            }
            if (attempt === retries) {
                throw error; // 最大試行回数で失敗なら投げる
            }
            await new Promise(resolve => setTimeout(resolve, delay)); // 待機して再試行
        }
    }
}

async function checkSignIn(){
    const name = document.getElementById("username-input").value.trim();
    const pass = document.getElementById("password-input").value.trim();
    
    if(confirm("ログインしますか？")){
        startLoading();
        try {
            const result = await retryOperation(() => signIn(name, pass));
            localStorage.setItem("id", result.id);
            localStorage.setItem("account", result.user_name);
            localStorage.setItem("playCount", result.play_count);
            localStorage.setItem("correctCount", result.correct_count);
            window.location.reload();
        } catch(error) {
            if(error === "不正"){
                alert("ユーザー名かパスワードが違います。");
            }else{
                alert("ログインに失敗しました。");
            }
            stopLoading();
            return;
        }
    }
}

async function checkSignUp(){
    const name = document.getElementById("username-input").value.trim();
    const pass = document.getElementById("password-input").value.trim();
    
    if(confirm("新規登録しますか？")){
        startLoading();
        try {
            const result = await retryOperation(() => signUp(name, pass));
            localStorage.setItem("id", result.id);
            localStorage.setItem("account", result.user_name);
            localStorage.setItem("playCount", result.play_count);
            localStorage.setItem("correctCount", result.correct_count);
            window.location.reload();
        } catch(error) {
            if(error === "使用済"){
                alert("このユーザー名は使用できません。");
            }else{
                alert("新規登録に失敗しました。");
            }
            stopLoading();
            return;
        }
    }
}

function signOut(){
    if(confirm("ログアウトしますか？")){
        startLoading();
        localStorage.removeItem("id");
        localStorage.removeItem("account");
        localStorage.removeItem("playCount");
        localStorage.removeItem("correctCount");
        window.location.reload();
    }
}

async function changeName(){
    const newName = document.getElementById("new-username-input").value.trim();
    if(newName.length === 0){
        alert("新しいユーザー名を入力してください。");
        return;
    }
    if(newName === localStorage.getItem("account")){
        alert("現在のユーザー名と同じです。");
        return;
    }
    
    if(confirm(`本当にユーザー名を『${document.getElementById("new-username-input").value}』に変更しますか`)){
        startLoading();
        try {
            const result = await retryOperation(() => updateUsername(localStorage.getItem("id"), newName));
            localStorage.setItem("account", result.user_name);
            alert("ユーザー名を変更しました。");
            window.location.reload();
        } catch (error) {
            if(error === "使用済"){
                alert("このユーザー名は使用できません。");
            }else{
                alert("ユーザー名の変更に失敗しました。");
            }
            stopLoading();
            return;
        }
    }
}

async function changePassword(){
    const newPassword = document.getElementById("new-password-input").value.trim();
    if(newPassword.length === 0){
        alert("新しいパスワードを入力してください。");
        return;
    }
    if(confirm(`本当にパスワードを変更しますか`)){
        startLoading();
        try {
            await retryOperation(() => updatePassword(localStorage.getItem("id"), newPassword));
            alert("パスワードを変更しました。");
            window.location.reload();
        } catch (error) {
            alert("パスワードの変更に失敗しました。");
            stopLoading();
            return;
        }
    }
}

async function deleteAccountOrNot(){
    if(confirm("アカウントを削除しますか？")){
        if(confirm("本当にアカウントを削除しますか？\nアカウントを削除するとこれまでのプレイ履歴も全て削除されます。")){
            startLoading();
            try {
                await retryOperation(() => deleteAccount(localStorage.getItem("id")));
                localStorage.removeItem("id");
                localStorage.removeItem("account");
                localStorage.removeItem("playCount");
                localStorage.removeItem("correctCount");
                alert("アカウントを削除しました。");
                window.location.reload();
            } catch (error) {
                alert("アカウントの削除に失敗しました。");
                stopLoading();
                return;
            }
        }
    }
}

function topBack(){
    startLoading();
    window.location.href = "index.html";
}
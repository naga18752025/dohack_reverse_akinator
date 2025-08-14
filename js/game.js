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

function back(){
    document.getElementById("loading3").style.display = "flex";
    window.location.href = "index.html";
}

let theme = null;
let sessionId = null;
let question = null;
let response = null;

async function fetchTheme(maxRetries = 10, retryInterval = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`テーマ取得 試行${attempt}回目`);
            const { character: theme } = await startGame();
            if (theme) {
                console.log("テーマ取得成功:", theme);
                return theme;
            }
        } catch (err) {
            console.warn(`接続失敗 (${attempt}回目):`, err);
        }
        // 最終試行でなければ待機
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
    }
    return null; // 全部失敗
}

async function main() {
    startLoading(); // ローディング開始

    if(localStorage.getItem("reload") === "none"){
        localStorage.setItem("reload", "done");
    }else{
        alert("不正な操作を検知しました。");
        window.location.href = "index.html";
        return;
    }

    theme = await fetchTheme(10, 2000); // ←ここでPromiseを「開封」！
    if (!theme) {
        alert("ゲーム開始に失敗しました。もう一度試してください。");
        window.location.href = "index.html";
    }else{
        stopLoading(); // ローディング終了
        startTimer(); // タイマーを開始
        try {
            const session = await createSession(theme);
            sessionId = session.id;
        } catch {
        };
    }
}
main();

// ゲームの中断
function gameQuit(){
    const result = confirm("本当にゲームを中断しますか？");
    if(result){
        document.getElementById("loading3").style.display = "flex";
        window.location.href = "index.html";
    }
}

// 質問の入力画面を表示する
function questionFormOpen(){

    // 質問の残り回数があるかを確認
    if(questionNokori <0){
        return;
    }
    document.getElementById("buttons").style.display = "none";
    document.getElementById("question-form").style.display = "flex";
}

// 質問の入力画面を閉じる
function questionFormClose(){
    document.getElementById("buttons").style.display = "flex";
    document.getElementById("question-form").style.display = "none";
}

// 解答の入力画面を表示する
function answerFormOpen(){
    document.getElementById("buttons").style.display = "none";
    document.getElementById("answer-form").style.display = "flex";
}

// 解答の入力画面を閉じる
function answerFormClose(){
    document.getElementById("buttons").style.display = "flex";
    document.getElementById("answer-form").style.display = "none";
}

// 質問追加工程
function questionAdd(){
    const question = document.getElementById("question-input");

    // 質問が入力されているか確認
    if(question.value === ""){
        alert("質問を入力してください")
        return;
    }

    // 本当にこの質問でいいか確認
    const result = confirm("本当にこの内容で質問しますか？");
    if (!result) {
        return;
    }

    //質問のコメントを作成してコメント欄に追加
    const newComment = document.createElement("div");
    const comment = question.value;
    newComment.textContent = comment;
    newComment.classList.add("question");
    document.getElementById("comments").appendChild(newComment);

    questionCounter();

    questionFormClose();
    document.getElementById("buttons").style.display = "none";

    responseAdd();
}

let questionNokori = 20; // 残り質問可能回数の初期値

// 質問回数を管理
function questionCounter(){

    // 残りの質問可能回数を減少させる
    document.getElementById("question-remain").textContent = questionNokori;
    questionNokori --;

    // 残り回数がなくなったら質問ボタンの見た目を変更する
    if(questionNokori < 0){
        document.getElementById("question-button").style.backgroundColor = "gray";
        document.getElementById("question-button").textContent = "質問終了";
    }
}
//　残り質問可能回数の初期値を設定
questionCounter();

// AIの回答追加の前工程
function responseAdd(){

    // 考え中の状態のコメントを作成してコメント欄に追加
    const newComment = document.createElement("div");
    const comment = document.createElement("span");
    comment.textContent = "・";
    newComment.classList.add("response");
    newComment.classList.add("loading");
    for (let i = 0; i < 5; i++) {
        const clone = comment.cloneNode(true);
        newComment.appendChild(clone);
    }
    const comments = document.getElementById("comments");
    comments.appendChild(newComment);
    comments.scrollTop = document.getElementById("comments").scrollHeight; // コメント欄の一番下まで移動させる

    questionCheck();
}

// AIの回答を実際に追加
async function questionCheck(){
    const { answer: response } = await askQuestion(document.getElementById("question-input").value);
    const lastComment = document.querySelector("#comments .response:last-child");
    lastComment.innerHTML = "";
    lastComment.textContent = response;
    question = document.getElementById("question-input").value;
    try {
        await addQuestion(sessionId, question, response);
    } catch{
    }
    document.getElementById("buttons").style.display = "flex";
    document.getElementById("question-input").value = ""; 
}

// 解答の決定工程
async function answerCheck(){
    const re = /^[\p{Script=Hiragana}\u30FC]+$/u;
    if(!re.test(document.getElementById("answer-input").value.trim())){
        alert("解答はひらがなで入力してください");
        return;
    }

    // 本当にこの解答でいいのかを確認
    const result = confirm("本当にこの内容で解答しますか？");
    if (!result) {
        return;
    }

    stopTimer(); // タイマーを止める

    // コメント欄の質問とAI回答を非表示にする
    document.querySelectorAll(".question").forEach(Q => {
        Q.style.display = "none";
    })
    document.querySelectorAll(".response").forEach(R => {
        R.style.display = "none";
    })

    // 解答確認中の画面を作成して表示
    const newComment = document.createElement("div");
    newComment.id = "answer-checking";
    newComment.textContent = "解答確認中";
    const comment = document.createElement("span");
    comment.textContent = ".";
    newComment.classList.add("loading2");
    for (let i = 0; i < 3; i++) {
        const clone = comment.cloneNode(true);
        newComment.appendChild(clone);
    }
    const comments = document.getElementById("comments");
    comments.style.justifyContent = "center";
    comments.appendChild(newComment);
    comments.scrollTop = document.getElementById("comments").scrollHeight; // コメント欄の一番下まで移動させる

    // 利用者の解答をhtmlに追加しておく
    document.getElementById("checked-answer").textContent = document.getElementById("answer-input").value.trim();

    answerFormClose();
    document.getElementById("buttons").style.display = "none";

    setTimeout(() => {
        if(theme === document.getElementById("answer-input").value.trim()){
            correctAnswer();
        }else{
            wrongAnswer();
        };
    }, 1500);

    try {
        await updateSession(sessionId, document.getElementById("answer-input").value, stopTimer());
    } catch{
    }
}

// 解答が正しかった場合
function correctAnswer(){

    // 解答確認中の画面を非表示にする
    document.getElementById("answer-checking").style.display = "none";

    document.getElementById("check-answer-box").style.display = "flex";
    document.getElementById("result").style.display = "flex";
    document.getElementById("SorF").textContent = "🎊大正解🎊";

    // フクロウの状態を正解した時のものにする
    const images = ["images/responser.png", "images/smiler.png"];
    let currentIndex = 1;
    document.getElementById("main-owl").src = images[1];
    setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length; 
        document.getElementById("main-owl").src = images[currentIndex];
    }, 1500);
}

//解答が間違っていた場合
function wrongAnswer(){

    // 解答確認中の画面を非表示にする
    document.getElementById("answer-checking").style.display = "none";

    document.getElementById("check-answer-box").style.display = "flex";
    document.getElementById("result").style.display = "flex";
    document.getElementById("SorF").textContent = "残念...不正解";

    // フクロウの状態を間違えた時のものにする
    const images = ["images/responser.png", "images/sadder.png"];
    let currentIndex = 1;
    document.getElementById("main-owl").src = images[1];
    const Interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length; 
        document.getElementById("main-owl").src = images[currentIndex];
    }, 1500);
    setTimeout(() => {
        clearInterval(Interval);
    }, 6000);
}

function finishGame(){
    document.getElementById("loading3").style.display = "flex";
    window.location.href = "index.html";
}



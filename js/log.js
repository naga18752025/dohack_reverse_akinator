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

let log = [];
let loadCount = 1;
const pageSize = 15;
let lastFetchedAt = null;

function renderHistory(sessions) {
    const container = document.getElementById("log-list");

    sessions.forEach((session) => {
        const card = document.createElement("div");
        card.classList.add("session-card");

        const sessionInfo = document.createElement("div");
        sessionInfo.classList.add("session-info");
        if(session.hint){
            sessionInfo.innerHTML = `
                <p>ユーザーの解答: <span class="user-answer">${session.final_guess}</span></p>
                <p>正解: <span class="correct-answer">${session.correct_answer}</span></p>
                <p>質問回数: ${session.questions.length}回（ヒントあり）</p>
                <p>プレイ所要時間: ${session.play_time}</p>
            `;
        }else{
            sessionInfo.innerHTML = `
                <p>ユーザーの解答: <span class="user-answer">${session.final_guess}</span></p>
                <p>正解: <span class="correct-answer">${session.correct_answer}</span></p>
                <p>質問回数: ${session.questions.length}回（ヒントなし）</p>
                <p>プレイ所要時間: ${session.play_time}</p>
            `;
        }

        const questionButton = document.createElement("button");
        questionButton.textContent = "質問を見る";
        questionButton.onclick = () => modalOpen(session.id);
        questionButton.classList.add("question-button");

        card.appendChild(sessionInfo);
        card.appendChild(questionButton);
        container.appendChild(card);
        container.appendChild(document.createElement("hr"));

        if(document.getElementById("load-more-button")) {
            document.getElementById("load-more-button").remove();
        }
        if(loadCount === pageSize) {
            const loadMoreButton = document.createElement("button");
            loadMoreButton.textContent = "もっと見る";
            loadMoreButton.id = "load-more-button";
            loadMoreButton.onclick = loadMoreHistory;
            container.appendChild(loadMoreButton);
            loadCount = 0;
        }

        loadCount++;
    });
}

function renderHistory2(sessions) {
    const container2 = document.getElementById("log-list2");

    let ranking = 1;
    sessions.forEach((session) => {
        const card = document.createElement("div");
        card.classList.add("session-card");

        const sessionInfo = document.createElement("div");
        sessionInfo.classList.add("session-info");
        sessionInfo.innerHTML = `
            <p>${ranking}位: <span class="theme">${session.correct_answer}</span></p>
            <p>出題回数: ${session.answer_count}</p>
        `;
        ranking++;

        card.appendChild(sessionInfo);
        container2.appendChild(card);
        container2.appendChild(document.createElement("hr"));
    });
}

// 初回読み込み
async function loadInitialHistory(maxRetries = 5, retryInterval = 2000) {
    startLoading();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`履歴取得 試行${attempt}回目`);
            const sessions = await getRecentSessionsWithQuestions(lastFetchedAt, pageSize);
            const sessions2 = await getPopularAnswers(null);

            if (sessions && sessions.length > 0 && sessions2 && sessions2.length > 0) {
                log = log.concat(sessions);
                renderHistory(sessions);
                lastFetchedAt = sessions[sessions.length - 1].created_at;
                renderHistory2(sessions2);
                console.log("履歴取得成功");
                stopLoading();
                return; // 成功したら終了
            } else {
                console.warn(`履歴なし (${attempt}回目)`);
            }

        } catch (error) {
            console.error(`履歴取得エラー (${attempt}回目):`, error);
        }

        // 最終試行でなければ待機
        if (attempt < maxRetries) {
            console.log(`${retryInterval}ms 待機して再試行...`);
            await new Promise(resolve => setTimeout(resolve, retryInterval));
        }
    }

    alert("履歴の取得に失敗しました。");
    stopLoading();
}

// 「もっと見る」ボタン処理
async function loadMoreHistory() {
    startLoading();
    try {
        const sessions = await getRecentSessionsWithQuestions(lastFetchedAt, pageSize);

        if (!sessions || sessions.length === 0) {
            alert("これ以上の履歴はありません。");
            document.getElementById("load-more-button").disabled = true;
            return;
        }

        log = log.concat(sessions);
        
        // 最後に取得したセッションの日時を更新
        lastFetchedAt = sessions[sessions.length - 1].created_at;

        renderHistory(sessions);

    } catch (error) {
        console.error("履歴追加取得エラー:", error);
        alert("履歴の読み込み中にエラーが発生しました。");
    } finally {
        stopLoading();
        if(filterOn) {
            logFilterOn();
        }
    }
}

const modal = document.getElementById("modal");

function modalOpen(targetId) {
    const session = log.find(s => s.id === targetId);
    const content = document.getElementById("modal-content");
    content.innerHTML = "";
    if ((!session.questions || session.questions.length === 0) && !session.hint) {
        content.innerHTML = "<p>なし</p>";
    } else {
        let order = 1;
        if((session.questions.length === 0) && (session.hintPosition === 1)){
                const p = document.createElement("p");
                p.innerHTML = `
                ヒントを使用：${session.hint}
                `;
                p.style.color = "red";
                content.appendChild(p);
        }
        session.questions.forEach(q => {

            if(parseInt(session.hintPosition) === order){
                const p = document.createElement("p");
                p.innerHTML = `
                ヒントを使用：${session.hint}
                `;
                p.style.color = "red";
                content.appendChild(p);
            }

            const p = document.createElement("p");
            p.innerHTML = `
                Q${order}: ${q.question}<br>
                A: ${q.response}
            `;
            content.appendChild(p);
            order++;
        });
    }
    modal.classList.add('is-active');
}

function modalClose() {
    modal.classList.remove('is-active');
}

function checkLog(){
    document.getElementById("log-list").style.display = "flex";
    document.getElementById("log-list2").style.display = "none";
    const selection = document.getElementById("selection");
    selection.children[0].classList.add("active-log");
    selection.children[1].classList.remove("active-log"); 
}

function checkLog2(){
    document.getElementById("log-list").style.display = "none";
    document.getElementById("log-list2").style.display = "flex";
    const selection = document.getElementById("selection");
    selection.children[0].classList.remove("active-log");
    selection.children[1].classList.add("active-log"); 
}

function searchAnswer() {
    const query = document.getElementById("search-input").value.trim();
    const cards = document.querySelectorAll("#log-list2 .session-card");
    let firstMatch = null;

    cards.forEach(card => {
        const answer = card.querySelector(".theme").textContent;
        if ((answer === query) && (query !== "")) {
            card.style.backgroundColor = "#ffff99";
            firstMatch = card; 
        } else {
            card.style.backgroundColor = "";
        }
    });

    if (firstMatch) {
        firstMatch.scrollIntoView({ behavior: "smooth", block: "center" });
    }else{
        document.getElementById("search-input").value = "該当なし";
    }
}

let filterOn = false;

function logFilterOn() {
    filterOn = true;
    document.getElementById("log-filter").children[0].classList.remove("active-filter");
    document.getElementById("log-filter").children[1].classList.add("active-filter");
    const cards = document.querySelectorAll("#log-list .session-card");

    cards.forEach(card => {
        if (card.querySelector(".user-answer").textContent === "----") {
            card.classList.add("veiled");
        }
    });
}

function logFilterOff() {
    filterOn = false;
    document.getElementById("log-filter").children[0].classList.add("active-filter");
    document.getElementById("log-filter").children[1].classList.remove("active-filter");
    const cards = document.querySelectorAll("#log-list .session-card");

    cards.forEach(card => {
        card.classList.remove("veiled");
    });
}

function scrollTopLogList() {
    forceHide = true;
    const list = document.getElementById("log-list");
    document.getElementById("scroll-top-log-list").classList.remove("show");
    list.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollTopLogList2() {
    forceHide2 = true;
    const list2 = document.getElementById("log-list2");
    document.getElementById("scroll-top-log-list2").classList.remove("show");
    list2.scrollTo({ top: 0, behavior: "smooth" });
}

let scrollTimer;
let forceHide = false;
let lastScrollTop = 0;

function updateScrollButton(listId, btnId) {
    const list = document.getElementById(listId);
    const btn = document.getElementById(btnId);

    function update() {
        const scrollTop = list.scrollTop;

        if (scrollTop > lastScrollTop) {
            forceHide = false;
        }
        lastScrollTop = scrollTop;

        if (forceHide) return;

        btn.style.transform = `translateY(${scrollTop}px)`;

        btn.classList.remove("show");

        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            btn.classList.add("show");
        }, 100);
    }

    update();
    list.addEventListener("scroll", update);
}

let scrollTimer2;
let forceHide2 = false;
let lastScrollTop2 = 0;

function updateScrollButton2(listId, btnId) {
    const list = document.getElementById(listId);
    const btn = document.getElementById(btnId);

    function update() {
        const scrollTop = list.scrollTop;

        if (scrollTop > lastScrollTop2) {
            forceHide2 = false;
        }
        lastScrollTop2 = scrollTop;

        if (forceHide2) return;

        btn.style.transform = `translateY(${scrollTop}px)`;

        btn.classList.remove("show");

        clearTimeout(scrollTimer2);
        scrollTimer2 = setTimeout(() => {
            btn.classList.add("show");
        }, 100);
    }

    update();
    list.addEventListener("scroll", update);
}

updateScrollButton("log-list", "scroll-top-log-list");
updateScrollButton2("log-list2", "scroll-top-log-list2");

function reload(){
    document.querySelectorAll(".session-card").forEach(card => {
        card.remove();
    });
    document.querySelectorAll("hr").forEach(hr => {
        hr.remove();
    })
    document.getElementById("load-more-button").remove();
    log = [];
    loadCount = 1;
    lastFetchedAt = null;
    logFilterOff();
    document.getElementById("reload-inner").classList.add("reload-inner");
    loadInitialHistory();
    setTimeout(() => {
        document.getElementById("reload-inner").classList.remove("reload-inner");
    }, 500);
    scrollTopLogList();
    scrollTopLogList2();
}

// 初回実行
loadInitialHistory();

function loginCheck(){
    if(localStorage.getItem("account")){
        document.getElementById("account").textContent = localStorage.getItem("account");
    }
}

loginCheck();
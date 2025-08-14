let loadingTimeout = null;

function startLoading() {
    document.getElementById("loading3").style.display = "flex";
    // 10秒後に「お待ちください」メッセージを表示
    loadingTimeout = setTimeout(() => {
        document.getElementById("long-loading").style.display = "block";
        document.getElementById("mole-game-container").style.display = "block";
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
const pageSize = 5;
let lastFetchedAt = null;

function renderHistory(sessions) {
    const container = document.getElementById("log-list");

    sessions.forEach((session) => {
        const card = document.createElement("div");
        card.classList.add("session-card");

        const sessionInfo = document.createElement("div");
        sessionInfo.classList.add("session-info");
        sessionInfo.innerHTML = `
            <p>最終解答: ${session.final_guess}</p>
            <p>正解: ${session.correct_answer}</p>
            <p>プレイ時間: ${session.play_time}</p>
            <p>${new Date(session.created_at).toLocaleString()}</p>
        `;

        const questionButton = document.createElement("button");
        questionButton.textContent = "質問一覧";
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

// 初回読み込み
async function loadInitialHistory(maxRetries = 5, retryInterval = 2000) {
    startLoading();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`履歴取得 試行${attempt}回目`);
            const sessions = await getRecentSessionsWithQuestions(lastFetchedAt, pageSize);

            if (sessions && sessions.length > 0) {
                log = log.concat(sessions);
                renderHistory(sessions);
                lastFetchedAt = sessions[sessions.length - 1].created_at;
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
    }
}

const modal = document.getElementById("modal");

function modalOpen(targetId) {
    const session = log.find(s => s.id === targetId);
    const content = document.getElementById("modal-content");
    content.innerHTML = "";
    if (!session.questions || session.questions.length === 0) {
        content.innerHTML = "<p>なし</p>";
    } else {
        let order = 1;
        session.questions.forEach(q => {
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

// 初回実行
loadInitialHistory();

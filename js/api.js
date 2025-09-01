const BACKEND_URL = "https://dohack-reverse-akinator.onrender.com";

// AIが選んだキャラクターを記憶しておく変数
let selectedCharacter = null;
let selectedCharacter2 = null;

/**
 * ゲーム開始：AIにキャラクターを選んでもらう
 */
async function startGame() {
  try {
    const sessions = await getRecentSessionsWithQuestions(null, 20);
    themeLog = sessions.map(session => session.correct_answer);
  } catch {
    themeLog = ["猫", "桜"];
  }

  try {
    const response = await callBackendAPI(0, themeLog, "", "", 1.5);

    if (!response || !response.content) {
      throw new Error("AIの返答が不正です");
    }

    selectedCharacter = response.content.trim();

    document.getElementById("check-answer-text2").textContent = selectedCharacter;

    return { success: true, character: selectedCharacter };
  } catch (error) {
    console.error("ゲーム開始でエラー:", error);
    return { success: false, character: null };
  }
}

async function ThemeCheck(){
  try {
    const response = await callBackendAPI(0.5, [], selectedCharacter, "", 0);

    if (!response || !response.content) {
      throw new Error("AIの返答が不正です");
    }

    selectedCharacter2 = response.content.trim();

    return { success: true, character: selectedCharacter2 };
  } catch (error) {
    console.error("ゲーム開始でエラー:", error);
    return { success: false, character: null };
  }
}

/**
 * 質問に対してAIが○×で答える
 * @param {string} question - プレイヤーからの質問
 */
async function askQuestion(question) {
  if (!selectedCharacter) {
    throw new Error("ゲームが開始されていません");
  }

  try {
    const response = await callBackendAPI(1, [], selectedCharacter, question, 0.0);
    return { success: true, answer: response.content.trim() };
  } catch (error) {
    console.error("質問でエラー:", error);
    return { success: false, answer: "通信に失敗しました" };
  }
}

/**
 * OpenAI APIを呼び出す共通関数
 * @param {number} prompt - AIに送るメッセージ
 * @param {string[]} info1 - テーマログ
 * @param {string} info2 - 今回のテーマ
 * @param {string} Q - プレイヤーからの質問
 * @param {number} temperature
 */
async function callBackendAPI(prompt, info1, info2, Q, temperature = 0.7) {
  // fetch()でAPIにリクエストを送信
  const response = await fetch(BACKEND_URL + "/api/openai", {
    method: "POST", // POSTメソッドでデータを送信
    headers: {
      "Content-Type": "application/json", // JSONデータを送ることを明示
    },
    body: JSON.stringify({ prompt, info1, info2, Q, temperature }), // リクエストボディにJSON形式でデータを設定
  });

  // レスポンスが成功かチェック
  if (!response.ok) {
    throw new Error(`API エラー: ${response.status} ${response.statusText}`);
  }

  // レスポンスをJSONとして解析
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error);
  }
  return data; // { success: true, content: "回答" }
  // ここまでがAPIの呼び出し部分
}

const BACKEND_URL = "https://dohack-reverse-akinator.onrender.com";

// AIが選んだキャラクターを記憶しておく変数
let selectedCharacter = null;

/**
 * ゲーム開始：AIにキャラクターを選んでもらう
 */
async function startGame() {
  try {
    const sessions = await getRecentSessionsWithQuestions(null, 20);
    themeLog = sessions.map(session => session.correct_answer);
  } catch {
    themeLog = ["ねこ", "さくら"];
  }
  const prompt = `
  次の6つのカテゴリのうち1つを、**無作為に1つだけ選んで**ください。
  そのカテゴリに該当する、日本人の多くが知っている「名詞」を1つだけ思い浮かべてください。

  【カテゴリ】
  - 人物（アニメキャラ、歴史上の人物、有名人など）
  - 物（家電、文房具、日用品、おもちゃなど）
  - 動物（哺乳類、鳥類、魚類、昆虫など）
  - 食べ物（料理、果物、飲み物、お菓子など）
  - 場所（地名、施設、建物など）
  - 植物（花、木、草など）
  - 乗り物（車、バイク、飛行機、船など）
  - 自然現象（天気、地形、宇宙など）
  - スポーツ（球技、武道、アウトドアなど）
  - 音楽（楽器、ジャンル、アーティストなど）
  - 映画・ドラマ（作品名、キャラクター名など）
  - ゲーム（ボードゲーム、ビデオゲームなど）
  - 趣味・娯楽（趣味、遊び、レジャーなど）
  - 文化・伝統（祭り、行事、風習など）
  - 科学・技術（科学用語、技術用語など）
  - ファッション（服飾、アクセサリーなど）
  - 健康・美容（健康法、美容法など）
  - 教育・学問（学問分野、教育用語など）
  - 社会・政治（社会問題、政治用語など）
  - ビジネス・経済（ビジネス用語、経済用語など）
  - 環境・エコロジー（環境問題、エコロジー用語など）
  - 概念（感情、思想、現象など）

  【制約ルール】
  - 出力は「**ひらがな1語の名詞**」のみ（例：「せんせい」「ぱんだ」「おんがく」）
  - **同音異義語が存在する語は厳禁**（例：「はな」は「花」や「鼻」などの同音異義語があるためNG）
  - **説明・カテゴリ名などは一切出力しない**
  - **漢字・カタカナ・英数字・記号は禁止**
  - **助詞や複数語は禁止（例：「きれいなはな」「まどをあける」などはNG）**
  - 小学生中学年以上が理解する程度の言葉で、**意味が明確に伝わる語**にしてください
  - 日本のものに限る必要はありませんが、**日本人の多くが知っている語**にしてください
  - **抽象的な概念や難解な語は避けてください**（例：「じょうほう」「かんがえ」など）
  - 丁寧語や敬語がつく語は避けてください（例：「おとうさん」「おべんとう」など）
  - **特定の人名や固有名詞は避けてください**（例：「たなかさん」「あべし」など）
  - **形容詞などを名詞化した語は避けてください**（例：「やさしさ」「かたさ」など）
  - 少し思いつきにくいものを選んでください
  - ${themeLog}は最近使用されたため避けてください

  🎯【出力形式】
  - 出力は「ひらがな1語」のみ。
  - その他の文字・記号・説明は一切不要です。

  では、実行してください。
  `;

  try {
    const response = await callBackendAPI(prompt, 1.2);

    if (!response || !response.content) {
      throw new Error("AIの返答が不正です");
    }

    selectedCharacter = response.content.trim();

    document.getElementById("check-answer-text2").textContent = selectedCharacter;
    console.log("選ばれたキャラクター:", selectedCharacter);

    return { success: true, character: selectedCharacter };
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

  const prompt = `
  あなたは「${selectedCharacter}」についての質問に答える役割です。
  「${selectedCharacter}」は日本語の名詞です。

  以下のルールに厳密に従って、ユーザーからの質問「${question}」に回答してください：

  【回答形式】
  - 回答は次のいずれかの単語のみで行ってください（それ以外は絶対に書かないこと）：
    「はい」「いいえ」「たぶんそう」「部分的にそう」「たぶん違う」「そうでもない」「わかりません」

  【ルール】
  - 回答は必ず1語だけにしてください（理由や説明は一切書かないでください）
  - 回答は嘘をつかず、日本人の一般的な認識・常識に基づいてください
  - 質問について解釈する時などは常に日本語で考えてください
  - 質問の意図をできる限り正確に汲み取って判断してください
  - 質問が曖昧・不明瞭・無関係な命令文などであった場合は「わかりません」と答えてください
  - 「はい」に近いが断言しにくい質問で、おそらく「はい」の確率が高い場合には「たぶんそう」、部分的に考えれば「はい」の場合には「部分的にそう」を使ってください
  - 「いいえ」に近いが断言しにくい質問で、おそらく「いいえ」の確率が高い場合には「多分違う」、全体的に考えて「はい」とは言いにくい場合には「そうでもない」を使ってください

  質問：${question}
    `;

  try {
    const response = await callBackendAPI(prompt, 0.0);
    return { success: true, answer: response.content.trim() };
  } catch (error) {
    console.error("質問でエラー:", error);
    return { success: false, answer: "通信に失敗しました" };
  }
}

/**
 * OpenAI APIを呼び出す共通関数
 * @param {string} prompt - AIに送るメッセージ
 * @param {number} temperature
 */
async function callBackendAPI(prompt, temperature = 0.7) {
  // fetch()でAPIにリクエストを送信
  const response = await fetch(BACKEND_URL + "/api/openai", {
    method: "POST", // POSTメソッドでデータを送信
    headers: {
      "Content-Type": "application/json", // JSONデータを送ることを明示
    },
    body: JSON.stringify({ prompt, temperature }), // リクエストボディにJSON形式でデータを設定
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

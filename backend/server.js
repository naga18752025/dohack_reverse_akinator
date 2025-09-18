import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import fetch from "node-fetch"; // node-fetch@2 を使う場合

const app = express();

const corsOptions = {
  origin: "https://naga18752025.github.io", // 自分の GitHub Pages だけ許可
  methods: ["POST"],
};

app.use(cors(corsOptions));

app.use(express.json());

// 環境変数から読み込む（RenderのDashboardで設定）
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // ← サーバー用の安全なキー
);

app.post("/api/openai", async (req, res) => {
  try {
    const { prompt, info1, info2, info3, Q, temperature } = req.body;
    let realPrompt = null;
    console.log(temperature);

    if(prompt === 0){
      const themeLog = info1;

      const rand = Math.random(); // 0以上1未満の乱数
      const typeOfPrompt = rand < 0.45 ? 1 : rand < 0.90 ? 2 : 3;

      if(typeOfPrompt === 1){
        realPrompt = `
        次のカテゴリのうちの1つを、**無作為に選んで**ください。
        そのカテゴリに該当する、日本人の多くが知っている「名詞」を1つだけ思い浮かべてください。（例示しているものである必要はありません）
  
        【カテゴリ】
        - 歴史上の人物（例：「織田信長」「坂本龍馬」「紫式部」）
        - 有名人・国民的キャラクター（例：「ドラえもん」「ピカチュウ」「イチロー」）
        - 職業・役割（例：「医者」「教師」「警察官」「大工」）
        - 日用品・身の回り品（例：「椅子」「傘」「財布」「スマートフォン」）
        - 家電・機械・道具（例：「冷蔵庫」「パソコン」「望遠鏡」「掃除機」）
        - 乗り物
          - 陸（例：「自動車」「自転車」「バス」）
          - 海（例：「船」「ヨット」「潜水艦」）
          - 空（例：「飛行機」「ヘリコプター」「気球」）
        - 動物（例：「犬」「ゾウ」「カンガルー」）
        - 鳥類（例：「スズメ」「カラス」「フクロウ」）
        - 昆虫（例：「カブトムシ」「チョウ」「トンボ」）
        - 海の生き物（例：「イルカ」「サメ」「タコ」「クジラ」）
        - 植物・花（例：「桜」「ひまわり」「松」「竹」）
        - 食べ物（例：「寿司」「ラーメン」「カレー」「おにぎり」）
        - 果物（例：「りんご」「みかん」「バナナ」「スイカ」）
        - 飲み物（例：「お茶」「コーヒー」「ジュース」「コーラ」）
        - 国・地域（例：「日本」「アメリカ」「フランス」）
        - 都市・地名（例：「東京」「大阪」「京都」「ニューヨーク」）
        - 有名な建物・人工物（例：「東京タワー」「金閣寺」「エッフェル塔」）
        - 自然の場所・地形（例：「山」「川」「森」「海」）
        - 伝統文化・年中行事（例：「着物」「歌舞伎」「正月」「盆踊り」）
        - スポーツ・競技（例：「野球」「サッカー」「剣道」「卓球」）
        - 音楽・芸能（例：「ピアノ」「ギター」「太鼓」「オーケストラ」）
        - 映画・アニメ・ゲーム作品（例：「ジブリ」「鬼滅の刃」「ポケモン」）
        - 趣味・娯楽（例：「旅行」「読書」「釣り」「キャンプ」）
        - 学問・科目（例：「数学」「物理」「歴史」「化学」）
        - 天体・自然現象（例：「太陽」「月」「星」「台風」「地震」）
        - 有名ブランド・製品（例：「任天堂」「ユニクロ」「レゴ」）
        - その他：日本人が一般的に知っているその他の名詞
  
        【制約ルール】
        - 出力は「**1語の名詞**」のみ（例：「先生」「パンダ」「音楽」）
        - **説明・カテゴリ名などは一切出力しない**
        - **英数字・記号は禁止**
        - **助詞や複数語は禁止（例：「綺麗な花」「窓を開ける」などはNG）**
        - 日本にあるものに限る必要はありませんが、**日本人の多くが知っている語**にしてください
        - **抽象的な概念や難解な語は避けてください**（例：「情報」「考え」）
        - 丁寧語や敬語がつく語は避けてください（例：「お父さん」「お弁当」）
        - **個人レベルの固有名詞は厳禁**（例：「田中さん」「山田くん」「近所のスーパー」）
        - **極端にマイナーで知られていない作品名や地名は厳禁**（例：「無名の地方キャラ」「小さな村の名前」）
        - **意味が曖昧で連想できない語は厳禁**（例：「存在」「もの」「こと」など）
        - **形容詞などを名詞化した語は避けてください**（例：「やさしさ」「かたさ」）
        - 漢字・ひらがな・カタカナの一般的表記にしてください
        - ${themeLog}は最近使用されたため避けてください
        - 最近使用された${themeLog}と同一カテゴリまたは似たジャンルは出来るだけ避けてください
        - 一般的な日本人が理解する程度の言葉ならなんでもいいですが、**意味が明確に伝わる語**にしてください
  
        🎯【出力形式】
        - 出力は「名詞1語」のみ。
        - その他の文字・記号・説明は一切禁止です。
  
        では、実行してください。
        `;
      }else if(typeOfPrompt === 3){
        realPrompt = `
        あなたの役割：以下の条件に厳密に従い、"名詞を1語だけ" 出力してください。
        目的：逆アキネーターゲームのお題（日本人の全員に知られているが、お題としては思い浮かびにくい名詞）を**無作為に1つ選ぶ**こと。
        
        1) 出力ルール（絶対遵守）
        - 出力は**「名詞1語」だけ**（改行も含め、それ以外の文字を一切出力しない）。
        - 先頭・末尾に空白を入れないこと。
        - 英数字、記号、括弧、引用符、句点・読点（。、）、空白は一切禁止。
        - 使用できる文字は日本語および伸ばし棒（ー）のみとする。
        - **名詞として意味が一つに定まる語**とする。
        - 漢字表記される名詞は必ず標準的な漢字表記で出力する。
        - 固有名詞やカタカナ語はそのままカタカナ/ひらがなでよい。
        - 複合語・句（空白や助詞でつながったもの）は禁止。
        - 敬称（〜さん、〜くん等）や接頭辞（お〜）はつけない。
        - 出力は必ず**単語（名詞）として意味の通る語**とする。
        
        2) 許容／不許容の例（参考）
        - 【許容】「換気扇」「将棋」「サンタクロース」「高速道路」「カーテン」  
        - 【不許容】「こと」「存在」「ドラえもん。」（句点あり）「テレビ 2台」（数字・空白）「らい」（漢字の音読みのみ）
        
        3) 固有名詞について
        - 歴史上の人物、有名人・国民的キャラクター・有名作品名・有名地名・広く知られたブランド等は許容する。
        - 一般人や個人レベルの固有名詞、ローカル/マイナーな固有名詞は出さない。
        - 「有名かどうか」が判断に迷う場合は出力を控える。
        
        4) 意味・抽象度の制約
        - 抽象的・概念的すぎる語（例：「情報」「概念」「存在」など）は避ける。
        - 具体的に想像できる「物・人物・場所・事象・生物・作品名・技術・伝統文化など」を選ぶ。
        - 思い浮かべにくい語を選ぶにあたって、**専門的な知識などが必要な難しい語を選ぶことは禁止**。
        
        5) recent avoidance（直近採用回避）
        - 変数 ${themeLog} に含まれる語（直近30件）は**避ける**。
        - なるべく直近ログ ${themeLog} と**カテゴリが異なる**ものを選ぶよう努める。
        
        以上の条件に従って、**無作為に1語の名詞（日本人全員が知っているがお題としては思い浮かべにくいやつ）**だけを出力してください。`;
      }else{
        realPrompt = `
        あなたの役割：以下の条件に厳密に従い、"名詞を1語だけ" 出力してください。
        目的：逆アキネーターゲームのお題（日本人に広く知られている名詞）を**無作為に1つ選ぶ**こと。
  
        1) 出力ルール（絶対遵守）
        - 出力は**「名詞1語」だけ**（改行も含め、それ以外の文字を一切出力しない）。
        - 先頭・末尾に空白を入れないこと。
        - 英数字、記号、括弧、引用符、句点・読点（。、）、空白は一切禁止。
        - 使用できる文字は日本語および伸ばし棒（ー）のみとする。
        - **名詞として意味が一つに定まる語**とする。
        - 一般的に漢字表記される名詞は必ず標準的な漢字表記で出力する。
        - 固有名詞やカタカナ語など通常ひらがな・カタカナで書かれる語はそのままカタカナ/ひらがなでよい。
        - 複合語・句（空白や助詞でつながったもの）は禁止（例：「きれいな花」「窓を開ける」はNG）。
        - 敬称（〜さん、〜くん等）や接頭辞（お〜）はつけない。
        - 出力は必ず**単語（名詞）として意味の通る語**とする。
  
        2) 許容／不許容の例（参考）
        - 【許容】「猫」「ピカチュウ」「東京」「リンゴ」「音楽」  
        - 【不許容】「おとうさん」「たなかさん」「ドラえもん。」（句点あり）「テレビ 2台」（数字・空白）「存在」「こと」（抽象的すぎる）「らい」(漢字の音読みなど部分読みのみ)
  
        3) 固有名詞について
        - 歴史上の人物、有名人・国民的キャラクター・有名作品名・有名地名・広く知られたブランド等は許容する（例：「織田信長」「ドラえもん」「東京」「ポケモン」）。
        - 一般人や個人レベルの固有名詞、極端にローカル/マイナーな固有名詞は出さない（例：「田中さん」「○○商店」などはNG）。
        - 「有名かどうか」が判断に迷う場合は出力を控える（＝無理にマイナー語を出さない）。
  
        4) 意味・抽象度の制約
        - 抽象的・概念的すぎる語（例：「存在」「こと」「情報」など）は避ける。
        - 具体的に想像できる「物・人物・場所・事象・生物・作品名など」を選ぶ。
  
        5) recent avoidance（直近採用回避）
        - 変数 ${themeLog} に含まれる語（直近の30件）は**避ける**こと。  
        - なるべく直近ログ ${themeLog} と**カテゴリが異なる**ものを選ぶよう努めよ（完全に別カテゴリにできない場合は語自体を避ける）。
  
        以上の条件に従って、**無作為に1語の名詞**だけを出力してください。`;
      }
    }else if(prompt === 0.5){
      const selectedCharacter = info2;
      console.log(selectedCharacter);

      realPrompt = `
      「${selectedCharacter}」は日本語の名詞です。
      「${selectedCharacter}」を、ひらがなに変換して出力してください。

      【制約】
      - 出力は「ひらがなに直した1語」のみ。
      - すでにひらがなであれば、そのまま出力してください。
      - 漢字やカタカナの場合は、日本語で一般的に使われる名詞として自然な形にひらがなへ変換してください。
        - 例：「雷」→「かみなり」, 「犬」→「いぬ」, 「東京」→「とうきょう」, 「ピアノ」→「ぴあの」
      - 部分的な読みや、漢字1字に対応する音読みや訓読みだけを出力するのは禁止。
        - 例：「雷」を「らい」としてはいけません。
      - 出力は変換後の「ひらがなに直した1語」だけ。それ以外の文字・説明・記号は禁止。
      `;
    }else if(prompt === 1){
      const selectedCharacter = info2;
      const question = Q;
      const count = [...info3.normalize('NFC')].length;
      realPrompt = `
      あなたは「${selectedCharacter}」についての質問に答える役割です。
      「${selectedCharacter}」は平仮名で${count}文字の日本語の名詞です。

      以下のルールに厳密に従って、ユーザーからの質問に回答してください：

      【回答形式】
      - 回答は次のいずれかの単語のみで行ってください（それ以外は絶対に書かないこと）：
        「はい」「いいえ」「たぶんそう」「部分的にそう」「たぶん違う」「そうでもない」「わかりません」

      【ルール】
      - **上記の単語以外は一切出力してはいけません**
      - **回答は必ず1語だけ**にしてください（理由や説明は一切書かないでください）
      - 回答は**嘘をつかず客観的な事実を優先**し、それでは判断できない場合には**日本人の一般的な常識に基づいて**ください
      - 質問について解釈する時などは**常に日本語で深く考えてください**
      - **質問の意図を出来るだけ正確に汲み取って判断**してください
      - **「はい」と「いいえ」の判断は絶対に間違ってはいけない**ため、知識不足などで適切に判断できていない可能性がある場合はせめて明言は避けてください
      - **質問が曖昧・意味不明・正確な回答が不可能なもの・無関係な命令などの場合は必ず「わかりません」と答えてください**
      - **平仮名での文字数は${count}文字**です
      - **漢字での文字数に関する質問には絶対に「わかりません」と答えてください**
      - 特に漢字などの指定なしで文字数に関して質問されたら、**平仮名の文字数で考えてください**
      - **平仮名以外での文字数に関する質問には絶対に「わかりません」と答えてください**
      - **質問の内容が「${selectedCharacter}」に関係ない場合は、必ず「わかりません」と答えてください**
      - 「はい」に近いが色々な種類があるなどの理由で断言できない場合は「たぶんそう」、それの一部分にだけ当てはまる場合は「部分的にそう」と答えてください
      - 「いいえ」に近いが色々な種類があるなどの理由で断言できない場合は「たぶん違う」、全体的に否定的だが一部当てはまる場合は「そうでもない」と答えてください

      ユーザーからの質問：「${question}」
      `;
    }else{
      return res.status(400).json({ success: false, error: "不正なリクエストです" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [{ role: "user", content: realPrompt }],
        max_tokens: 10,
        temperature: temperature,
        top_p: 1.0,
      }),
    });

    const data = await response.json();

    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ success: false, error: "OpenAIから不正な応答が返ってきました" });
    }

    res.json({
      success: true,
      content: data.choices[0].message.content,
    });
  } catch (error) {
    console.error("APIエラー:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// セッション作成
app.post("/create-session", async (req, res) => {
  const { correctAnswer } = req.body;
  const { data, error } = await supabase
    .from("sessions")
    .insert([{ correct_answer: correctAnswer }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// セッション更新
app.post("/update-session", async (req, res) => {
  const { sessionId, finalGuess, playTime } = req.body;
  const { error } = await supabase
    .from("sessions")
    .update({ final_guess: finalGuess, play_time: playTime })
    .eq("id", sessionId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// 質問追加
app.post("/add-question", async (req, res) => {
  const { sessionId, questionText, responseText } = req.body;
  const { data, error } = await supabase
    .from("questions")
    .insert([{ session_id: sessionId, question: questionText, response: responseText }]);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 履歴取得（ページネーション）
app.get("/get-recent-sessions", async (req, res) => {
  const size = parseInt(req.query.size || "15");
  const after = req.query.after; // ISO8601形式の日時文字列を期待

  // ✅ select から created_at を外す
  let query = supabase
    .from("sessions")
    .select(`
      id,
      final_guess,
      correct_answer,
      play_time,
      questions (
        question,
        response
      )
    `) // ← sessionsテーブルの created_at は指定していない
    .order("created_at", { ascending: false }) // 並び替えには使う
    .order("created_at", { foreignTable: "questions", ascending: true }); // 質問の並び替え

  if (after) {
    // after より古い（小さい）sessions.created_at を取得
    query = query.lt("created_at", after);
  }

  const { data, error } = await query.limit(size);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data); // ← sessions.created_at は返らない
});

// 人気のお題を取得
app.get("/get-popular-answers", async (req, res) => {
  const { data, error } = await supabase.rpc("get_popular_answers");

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// アカウント作成
app.post("/create-account", async (req, res) => {
  const { user_name, password } = req.body;

  // 入力チェック
  if (!user_name || !password) {
    return res.status(400).json({ error: "user_name と password は必須です" });
  }

  // 既存ユーザー確認
  const { data: existingUser, error: selectError } = await supabase
    .from("account")
    .select("id")
    .eq("user_name", user_name)
    .maybeSingle();

  if (selectError) {
    return res.status(500).json({ error: "登録エラー" });
  }

  if (existingUser) {
    return res.status(400).json({ error: "使用済" });
  }

  try {
    // パスワードをハッシュ化（ソルトラウンドは10）
    const hashedPassword = await bcrypt.hash(password, 10);

    // 新規ユーザー追加
    const { data: user, error } = await supabase
      .from("account")
      .insert([{ user_name, password: hashedPassword }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "登録エラー" });
    }

    res.json({ id: user.id, user_name: user.user_name, play_count: user.play_count, correct_count: user.correct_count });

  } catch (err) {
    res.status(500).json({ error: "登録エラー" });
  }
});

// ログイン
app.post("/login", async (req, res) => {
  const { user_name, password } = req.body;

  // 入力チェック
  if (!user_name || !password) {
    return res.status(400).json({ error: "user_name と password は必須です" });
  }

  // ユーザー取得
  const { data: user, error: selectError } = await supabase
    .from("account")
    .select("id, user_name, password, play_count, correct_count") // ← ハッシュ済みパスワードも取得
    .eq("user_name", user_name)
    .maybeSingle();

  if (selectError) {
    return res.status(500).json({ error: selectError.message });
  }

  if (!user) {
    return res.status(400).json({ error: "不正" });
  }

  try {
    // 入力された password とハッシュを照合
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "不正" });
    }

    // 認証成功
    res.json({ id: user.id, user_name: user.user_name, play_count: user.play_count, correct_count: user.correct_count });

  } catch (err) {
    res.status(500).json({ error: "認証エラー" });
  }
});

// プレイ回数を1増やす
app.post("/increment-play-count", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId は必須です" });

  try {
    const { data: user, error: fetchError } = await supabase
      .from("account")
      .select("play_count")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) return res.status(500).json({ error: fetchError.message });
    if (!user) return res.status(404).json({ error: "更新エラー" });

    const newPlayCount = (parseInt(user.play_count) || 0) + 1;

    const { data, error: updateError } = await supabase
      .from("account")
      .update({ play_count: newPlayCount })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) return res.status(500).json({ error: "更新エラー"});
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "更新エラー " });
  }
});

// 正解回数を1増やす
app.post("/increment-correct-count", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "userId は必須です" });

  try {
    const { data: user, error: fetchError } = await supabase
      .from("account")
      .select("correct_count")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError) return res.status(500).json({ error: fetchError.message });
    if (!user) return res.status(404).json({ error: "更新エラー" });

    const newCorrectCount = (parseInt(user.correct_count) || 0) + 1;

    const { data, error: updateError } = await supabase
      .from("account")
      .update({ correct_count: newCorrectCount })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) return res.status(500).json({ error: "更新エラー" });
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "更新エラー " });
  }
});

// ユーザー名更新
app.post("/update-name", async (req, res) => {
  const { userId, new_user_name } = req.body;
  if (!userId) return res.status(400).json({ error: "userId は必須です" });
  if (!new_user_name) return res.status(400).json({ error: "new_user_name は必須です" });

  // 既存ユーザー確認
  const { data: existingUser, error: selectError } = await supabase
    .from("account")
    .select("id")
    .eq("user_name", new_user_name)
    .maybeSingle();

  if (selectError) {
    return res.status(500).json({ error: "更新エラー" });
  }

  if (existingUser) {
    return res.status(400).json({ error: "使用済" });
  }

  try {
    const { data, error: updateError } = await supabase
      .from("account")
      .update({ user_name: new_user_name })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) return res.status(500).json({ error: "更新エラー" });
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "更新エラー " });
  }
});

// パスワード更新
app.post("/update-password", async (req, res) => {
  const { userId, new_password } = req.body;
  if (!userId) return res.status(400).json({ error: "userId は必須です" });
  if (!new_password) return res.status(400).json({ error: "new_password は必須です" });

  const hashedPassword = await bcrypt.hash(new_password, 10);
  try {
    const { data, error: updateError } = await supabase
      .from("account")
      .update({ password: hashedPassword })
      .eq("id", userId)
      .select()
      .single();

    if (updateError) return res.status(500).json({ error: "更新エラー"});
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: "更新エラー " });
  }
});

app.post("/delete-account", async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ error: "id が必要です" });

  const { data, error } = await supabase
    .from("account")
    .delete()
    .eq("id", id)
    .select(); // 削除した行を返す

  if (error) {
    return res.status(500).json({ error: "削除エラー" });
  }

  if (!data.length) {
    return res.status(404).json({ error: "削除エラー" });
  }

  res.json({ success: true });
});

app.listen(process.env.PORT || 3001, () => console.log("サーバー起動"));
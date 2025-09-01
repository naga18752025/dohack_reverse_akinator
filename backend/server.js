let realPrompt = null;

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const fetch = require("node-fetch"); // node-fetch@2 を使ってください！

const app = express();

const corsOptions = {
  origin: "https://naga18752025.github.io", // 自分の GitHub Pages だけ許可
  methods: ["POST"],
};
app.use(cors(corsOptions));

app.use(express.json());

app.post("/api/openai", async (req, res) => {
  try {
    const { prompt, info1, info2, Q, temperature } = req.body;
    console.log(temperature);

    if(prompt === 0){
      const themeLog = info1;
      realPrompt = `
      次の6つのカテゴリのうち1つを、**無作為に1つだけ選んで**ください。
      そのカテゴリに該当する、日本人の多くが知っている「名詞」を1つだけ思い浮かべてください。

      【カテゴリ】
      - 人物（例：「ドラえもん」「織田信長」「先生」「警察」など）
      - 物（例：「テレビ」「筆」「タブレット」「シーソー」など）
      - 動物（例：「カバ」「カブトムシ」「シマウマ」「白鳥」など）
      - 食べ物（例：「ハンバーグ」「みかん」「コーラ」「ポテトチップス」など）
      - 場所（例：「東京」「図書館」「ロシア」「太平洋」など）
      - 植物（例：「向日葵」「たんぽぽ」「桜」「朝顔」など）
      - 乗り物（例：「車」「バイク」「飛行機」「船」など）
      - 自然現象（例：「台風」「オーロラ」「津波」など）
      - スポーツ（例：「卓球」「サッカー」「将棋」「チェス」など）
      - 音楽（例：「ピアノ」「フルート」「楽譜」「口笛」など）
      - 映画・ドラマ（例：「進撃の巨人」「クレヨンしんちゃん」「アベンジャーズ」など）
      - 趣味・娯楽（例：「かくれんぼ」「読書」「カラオケ」「旅行」など）
      - 文化・伝統（例：「アニメ」「着物」「盆踊り」「忍者」など）
      - 教育・学問（例：「音楽」「数学」「体育」「化学」など）
      - その他有名なもの

      【制約ルール】
      - 出力は「**1語の名詞**」のみ（例：「先生」「パンダ」「音楽」）
      - **説明・カテゴリ名などは一切出力しない**
      - **英数字・記号は禁止**
      - **助詞や複数語は禁止（例：「綺麗な花」「窓を開ける」などはNG）**
      - 中学年以上が理解する程度の言葉ならなんでもいいですが、**意味が明確に伝わる語**にしてください
      - **具体的に何かを思い浮かべることができる語**にしてください
      - 日本にあるものに限る必要はありませんが、**日本人の多くが知っている語**にしてください
      - **抽象的な概念や難解な語は避けてください**（例：「情報」「考え」など）
      - 丁寧語や敬語がつく語は避けてください（例：「お父さん」「お弁当」など）
      - **特定の人名や固有名詞は避けてください**（例：「田中さん」「安倍氏」など）
      - **形容詞などを名詞化した語は避けてください**（例：「やさしさ」「かたさ」など）
      - ${themeLog}は最近使用されたため避けてください
      - 最近使用された${themeLog}とできるだけ違うカテゴリのものにしてください

      🎯【出力形式】
      - 出力は「名詞1語」のみ。
      - その他の文字・記号・説明は一切不要です。

      では、実行してください。
      `;
    }else if(prompt === 0.5){
      const selectedCharacter = info2;

      realPrompt = `
      「${selectedCharacter}」を全てひらがなに変換したものだけを出力ください。
      すでにひらがなになっている場合はそのままその語だけを出力してください。
      その他のものは一切出力してはいけません。
      `;
    }else if(prompt === 1){
      const selectedCharacter = info2;
      const question = Q;
      const count = [...info2.normalize('NFC')].length;
      realPrompt = `
      あなたは「${selectedCharacter}」についての質問に答える役割です。
      「${selectedCharacter}」は平仮名で${count}文字の日本語の名詞です。

      以下のルールに厳密に従って、ユーザーからの質問「${question}」に回答してください：

      【回答形式】
      - 回答は次のいずれかの単語のみで行ってください（それ以外は絶対に書かないこと）：
        「はい」「いいえ」「たぶんそう」「部分的にそう」「たぶん違う」「そうでもない」「わかりません」

      【ルール】
      - **上記の単語以外は一切出力してはいけません**
      - **回答は必ず1語だけ**にしてください（理由や説明は一切書かないでください）
      - 回答は**嘘をつかず客観的な事実を優先**し、それでは判断できない場合には**日本人の一般的な常識に基づいて**ください
      - 質問について解釈する時などは**常に日本語で深く考えてください**
      - **質問の意図を正確に汲み取って判断**してください
      - **質問が曖昧・意味不明・無関係な命令の場合は必ず「わかりません」と答えてください**
      - **とにかく「はい」か「いいえ」の判断を間違えそうだったら、必ず「わかりません」と答えてください**
      - 質問の意味がわからなかったら正直に「わかりません」と答えてください
      - **平仮名での文字数は${count}文字**です
      - **漢字での文字数に関する質問には絶対に「わかりません」と答えてください**
      - 文字数を数える際は、**平仮名の文字数を数えてください**
      - **平仮名以外での文字数に関する質問には絶対に「わかりません」と答えてください**
      - **質問の内容が「${selectedCharacter}」に関係ない場合は、必ず「わかりません」と答えてください**
      - **質問の内容が「${selectedCharacter}」に関するものであっても、回答できない場合は「わかりません」と答えてください**
      - 「はい」に近いが色々な種類があるなどの理由で断言できない場合は「たぶんそう」、それの一部分にだけ当てはまる場合は「部分的にそう」と答えてください
      - 「いいえ」に近いが色々な種類があるなどの理由で断言できない場合は「たぶん違う」、全体的に否定的だが一部当てはまる場合は「そうでもない」と答えてください

      質問：${question}
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
        max_tokens: 100,
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

app.listen(process.env.PORT || 3001, () => console.log("サーバー起動"));

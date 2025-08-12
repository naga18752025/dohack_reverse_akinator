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
      - 人物（例：「どらえもん」「おだのぶなが」「せんせい」「けいさつ」など）
      - 物（例：「てれび」「ふで」「たぶれっと」「しーそー」など）
      - 動物（例：「かば」「かぶとむし」「しまうま」「はくちょう」など）
      - 食べ物（例：「はんばーぐ」「みかん」「こーら」「ぽてとちっぷす」など）
      - 場所（例：「とうきょう」「としょかん」「ろしあ」「たいへいよう」など）
      - 植物（例：「ひまわり」「たんぽぽ」「さくら」「あさがお」など）
      - 乗り物（例：「くるま」「ばいく」「ひこうき」「ふね」など）
      - 自然現象（例：「たいふう」「おーろら」「つなみ」など）
      - スポーツ（例：「たっきゅう」「さっかー」「しょうぎ」「ちぇす」など）
      - 音楽（例：「ぴあの」「もーつぁると」「がくふ」「くちぶえ」など）
      - 映画・ドラマ（例：「しんげきのきょじん」「くれよんしんちゃん」「ちびまるこちゃん」「あべんじゃーず」など）
      - 趣味・娯楽（例：「かくれんぼ」「どくしょ」「からおけ」「りょこう」など）
      - 文化・伝統（例：「あにめ」「きもの」「ぼんおどり」「にんじゃ」など）
      - 教育・学問（例：「おんがく」「すうがく」「たいいく」「かがく」など）
      - その他有名なもの

      【制約ルール】
      - 出力は「**ひらがな1語の名詞**」のみ（例：「せんせい」「ぱんだ」「おんがく」）
      - **同音異義語が存在する語は厳禁**（例：「はな」は「花」や「鼻」などの同音異義語があるためNG）
      - **説明・カテゴリ名などは一切出力しない**
      - **漢字・カタカナ・英数字・記号は禁止**
      - **助詞や複数語は禁止（例：「きれいなはな」「まどをあける」などはNG）**
      - 中学年以上が理解する程度の言葉で、**意味が明確に伝わる語**にしてください
      - **具体的に何かを思い浮かべることができる語**にしてください
      - 日本にあるものに限る必要はありませんが、**日本人の多くが知っている語**にしてください
      - **抽象的な概念や難解な語は避けてください**（例：「じょうほう」「かんがえ」など）
      - 丁寧語や敬語がつく語は避けてください（例：「おとうさん」「おべんとう」など）
      - **特定の人名や固有名詞は避けてください**（例：「たなかさん」「あべし」など）
      - **形容詞などを名詞化した語は避けてください**（例：「やさしさ」「かたさ」など）
      - ${themeLog}は最近使用されたため避けてください

      🎯【出力形式】
      - 出力は「ひらがな1語」のみ。
      - その他の文字・記号・説明は一切不要です。

      では、実行してください。
      `;
    }else if(prompt === 1){
      const selectedCharacter = info2;
      const question = Q;
      realPrompt = `
      あなたは「${selectedCharacter}」についての質問に答える役割です。
      「${selectedCharacter}」は日本語の名詞です。

      以下のルールに厳密に従って、ユーザーからの質問「${question}」に回答してください：

      【回答形式】
      - 回答は次のいずれかの単語のみで行ってください（それ以外は絶対に書かないこと）：
        「はい」「いいえ」「たぶんそう」「部分的にそう」「たぶん違う」「そうでもない」「わかりません」

      【ルール】
      - 上記の単語以外は一切出力してはいけません
      - **回答は必ず1語だけ**にしてください（理由や説明は一切書かないでください）
      - 嘘はつかず、客観的な事実を優先し、それで判断できない場合は日本人の一般的な常識に基づいてください
      - 質問について解釈する時などは常に日本語で考えてください
      - 質問の意図を正確に汲み取って判断してください
      - 質問が曖昧・不明瞭・無関係な命令文などであった場合は「わかりません」と答えてください
      - 質問の意味がわからなかったら正直に「わかりません」と答えてください
      - 「はい」と「いいえ」の判断は絶対に間違ってはいけません
      - 「はい」に近いが断言できない場合は「たぶんそう」、部分的に当てはまる場合は「部分的にそう」と答えてください
      - 「いいえ」に近いが断言できない場合は「たぶん違う」、全体的に否定的だが一部当てはまる場合は「そうでもない」と答えてください

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

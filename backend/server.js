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
      - **同音異義語が存在する語は厳禁**（例：「はな」は「花」や「鼻」などの同音異義語、「かみ」は「神」や「髪」などの同音異義語、「くも」は「雲」や「蜘蛛」などの同音異義語「はし」は「橋」や「箸」などの同音異義語、「あめ」は「雨」や「飴」などの同音異義語、「いし」は「石」や「医師」などの同音異義語があるため厳禁）
      - ${themeLog}は最近使用されたため避けてください
      - 最近使用された${themeLog}とできるだけ違うカテゴリのものにしてください

      🎯【出力形式】
      - 出力は「ひらがな1語」のみ。
      - その他の文字・記号・説明は一切不要です。

      では、実行してください。
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

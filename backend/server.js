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
    const { prompt, temperature } = req.body;
    console.log(temperature);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5-2025-08-07",
        messages: [{ role: "user", content: prompt }],
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

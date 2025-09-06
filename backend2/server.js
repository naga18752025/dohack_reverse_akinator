import 'dotenv/config';
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();

const corsOptions = {
  origin: "https://naga18752025.github.io",
  methods: ["GET", "POST"],
};

app.use(cors(corsOptions));

app.use(express.json());

// 環境変数から読み込む（RenderのDashboardで設定）
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY // ← サーバー用の安全なキー
);

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

  let query = supabase
    .from("sessions")
    .select(`
      id,
      final_guess,
      correct_answer,
      play_time,
      created_at,
      questions (
        question,
        response,
        created_at
      )
    `)
    .order("created_at", { ascending: false }) // 新しい順

  if (after) {
    // afterより**古い**（小さい）created_atを取得
    query = query.lt("created_at", after);
  }

  const { data, error } = await query.limit(size);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 人気のお題を取得
app.get("/get-popular-answers", async (req, res) => {
  const { data, error } = await supabase.rpc("get_popular_answers");

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

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

import bcrypt from "bcrypt";

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

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

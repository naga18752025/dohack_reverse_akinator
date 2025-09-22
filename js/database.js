const API_URL = "https://dohack-reverse-akinator.onrender.com";

// 関数名・返り値はそのままにして中身をAPI呼び出しに置き換え
async function createSession(correctAnswer) {
  const res = await fetch(`${API_URL}/create-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ correctAnswer })
  });
  if (!res.ok) return null;
  return await res.json();
}

async function updateSession(sessionId, finalGuess, playTime) {
  const res = await fetch(`${API_URL}/update-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, finalGuess, playTime })
  });
  return res.ok;
}

async function addHint(sessionId,hintNumber, hintText) {
  const res = await fetch(`${API_URL}/add-hint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, hintNumber, hintText })
  });
  if (!res.ok) return null;
  return await res.json();
}

async function addQuestion(sessionId, questionText, responseText) {
  const res = await fetch(`${API_URL}/add-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, questionText, responseText })
  });
  if (!res.ok) return null;
  return await res.json();
}

async function getRecentSessionsWithQuestions(after = null, size = 15) {
  const url = after 
    ? `${API_URL}/get-recent-sessions?after=${encodeURIComponent(after)}&size=${size}`
    : `${API_URL}/get-recent-sessions?size=${size}`;
  
  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

async function getPopularAnswers(limit = null) {
  const url = limit 
    ? `${API_URL}/get-popular-answers?limit=${limit}`
    : `${API_URL}/get-popular-answers`;

  const res = await fetch(url);
  if (!res.ok) return null;
  return await res.json();
}

async function signUp(user_name, password) {
  const res = await fetch(`${API_URL}/create-account`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_name, password })
  });

  const result = await res.json();

  if (!res.ok) {
    throw result.error; // サーバーの error メッセージを throw
  }

  return result; // 成功時は新規ユーザー情報
}

async function signIn(user_name, password) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_name, password })
  });

  const result = await res.json();

  if (!res.ok) {
    throw result.error; // サーバーの error メッセージを throw
  }
  return result;
}

async function updatePlayCounts(userId) {
  const res = await fetch(`${API_URL}/increment-play-count`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });

  const result = await res.json();

  if (!res.ok) {
    throw result.error; // サーバーの error メッセージを throw
  }
  return result;
}

async function updateCorrectCounts(userId) {
  const res = await fetch(`${API_URL}/increment-correct-count`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  });

  const result = await res.json();

  if (!res.ok) {
    throw result.error; // サーバーの error メッセージを throw
  }
  return result;
}

async function updateUsername(userId, new_user_name) {
  const res = await fetch(`${API_URL}/update-name`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, new_user_name })
  });

  const result = await res.json();

  if (!res.ok) {
    throw result.error; // サーバーの error メッセージを throw
  }
  return result;
}

async function updatePassword(userId, new_password) {
  const res = await fetch(`${API_URL}/update-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, new_password })
  });

  const result = await res.json();

  if (!res.ok) {
    throw result.error; // サーバーの error メッセージを throw
  }
  return result;
}

async function deleteAccount(id){
    const res = await fetch(`${API_URL}/delete-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });

    const result = await res.json();

    if (!res.ok) {
        throw result.error; // サーバーの error メッセージを throw
    }
    return result;
}
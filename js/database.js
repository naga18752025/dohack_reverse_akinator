const API_URL = "http://localhost:3002"; 

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

async function addQuestion(sessionId, questionText, responseText) {
  const res = await fetch(`${API_URL}/add-question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, questionText, responseText })
  });
  if (!res.ok) return null;
  return await res.json();
}

async function getRecentSessionsWithQuestions(page = 1, size = 15) {
  const res = await fetch(`${API_URL}/get-recent-sessions?page=${page}&size=${size}`);
  if (!res.ok) return null;
  return await res.json();
}

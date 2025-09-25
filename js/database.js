const API_URL = "https://dohack-reverse-akinator.onrender.com";

async function updateSession(sessionId, finalGuess, playTime) {
  const res = await fetch(`${API_URL}/update-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, finalGuess, playTime })
  });
  if (!res.ok) return null;
  return await res.json();
}

async function addHint(sessionId, hintNumber) {
  try {
    const res = await fetch(`${API_URL}/add-hint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, hintNumber })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("addHint error:", errorData.error || res.statusText);
      return { success: false, error: errorData.error || "通信エラー" };
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("addHint fetch exception:", err);
    return { success: false, error: err.message };
  }
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
    throw result.error;
  }

  return result;
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
    throw result.error;
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
    throw result.error;
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
    throw result.error;
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
    throw result.error;
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
        throw result.error;
    }
    return result;
}
const supabase = window.supabase.createClient("https://yakoqhrycusjrwhejmnt.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlha29xaHJ5Y3VzanJ3aGVqbW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1Njk2NTgsImV4cCI6MjA3MDE0NTY1OH0.eJW-DppQEUEdDEPNGaXbvmqR23O4bAHS5qpIbp00UcQ");

async function createSession(correctAnswer) {
    const { data, error } = await supabase
        .from('sessions')
        .insert([
        {
            correct_answer: correctAnswer,
        }
        ])
        .select() // ← IDを取得するため必須

    if (error) {
        console.error('セッション作成エラー:', error)
        return null
    }

    return data[0]  // セッションのIDなどを含む
}

async function updateSession(sessionId, finalGuess, playTime) {
    const { error } = await supabase
        .from('sessions')
        .update({
        final_guess: finalGuess,
        play_time: playTime,
        })
        .eq('id', sessionId)

    if (error) {
        console.error('セッション更新エラー:', error)
        return false
    }

    return true
}

async function addQuestion(sessionId, questionText, responseText) {
    const { data, error } = await supabase
        .from('questions')
        .insert([
        {
            session_id: sessionId,
            question: questionText,
            response: responseText,
        }
        ])

    if (error) {
        console.error('質問追加エラー:', error)
        return null
    }

    return data  // ← 成功したらOK（データが必要なければ戻り値なしでもOK）
}


// ページネーション対応関数
async function getRecentSessionsWithQuestions(page = 1, size = 15) {
    const from = (page - 1) * size;
    const to = from + size - 1;

    const { data, error } = await supabase
        .from('sessions')
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
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        console.error("履歴の取得中にエラー:", error.message);
        return null;
    }

    return data;
}

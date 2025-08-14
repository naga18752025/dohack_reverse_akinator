const cells = document.querySelectorAll(".mole-cell");
const scoreDisplay = document.getElementById("score-display");
let score = 0;

// モグラ出現関数
function spawnMole() {
  // すべてのモグラを削除
  document.querySelectorAll(".mole").forEach(m => m.remove());

  // ランダムなセルを選ぶ
  const index = Math.floor(Math.random() * cells.length);
  const mole = document.createElement("div");
  mole.classList.add("mole");

  mole.onclick = () => {
    score++;
    scoreDisplay.textContent = "スコア: " + score;
    mole.remove(); // クリックで消える
  };

  cells[index].appendChild(mole);

  // 次のモグラ出現までのランダム時間
  const nextTime = Math.random() * 500 + Math.random() * 900 + 100; // 0.5～1.5秒
  setTimeout(spawnMole, nextTime);
}

// ゲーム開始
spawnMole();
let allQuizData = [];
let quizData = [];

// 初期ロード
loadCSV("csv/sheet1.csv");

// シート切替
document.getElementById("sheetSelect").addEventListener("change", e => {
  // ▼ テーマ切替
  const theme = e.target.selectedOptions[0].dataset.theme;
  document.body.className = theme;

  loadCSV(e.target.value);
});


// CSV読み込み
function loadCSV(path) {
  fetch(path)
    .then(res => res.text())
    .then(text => {
      allQuizData = parseCSV(text);
      applyLimit();
    });
}

// CSV解析（空問題・列ズレ完全排除）
function parseCSV(text) {
  const lines = text
    .replace(/\uFEFF/g, "")       // BOM除去
    .split(/\r?\n/)
    .slice(1);

  const data = [];

  lines.forEach(line => {
    if (!line.trim()) return; // 完全な空行除外

    const cols = line.split(",").map(v => v.trim());

    const question = cols[0] || "";
    const rawChoices = cols.slice(1, 5);
    const answer = cols[5] || "";

    // 選択肢整理（空除外）
    const choices = rawChoices.filter(c => c !== "");

    // 条件を満たさない行は使わない
    if (
      question === "" ||
      choices.length < 2 ||
      answer === "" ||
      !choices.includes(answer)
    ) {
      return;
    }

    data.push({
      question,
      choices,
      answer
    });
  });

  return data;
}

// 出題数＋ランダム
function applyLimit() {
  const limit = parseInt(
    document.getElementById("questionLimit").value,
    10
  );

  quizData = [...allQuizData]
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);

  renderQuiz();
  document.getElementById("score").textContent = "";
}

// 描画
function renderQuiz() {
  const quiz = document.getElementById("quiz");
  quiz.innerHTML = "";

  quizData.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "question";

    div.innerHTML = `
      <p>${i + 1}. ${q.question}</p>
      ${q.choices.map(c => `
        <label>
          <input type="radio" name="q${i}" value="${c}">
          ${c}
        </label><br>
      `).join("")}
      <div class="result" id="result${i}"></div>
    `;

    quiz.appendChild(div);
  });
}

// 正誤判定＋点数
function checkAnswers() {
  let correct = 0;

  quizData.forEach((q, i) => {
    const selected = document.querySelector(
      `input[name="q${i}"]:checked`
    );
    const result = document.getElementById(`result${i}`);

    if (!selected) {
      result.textContent = "未回答";
      result.style.color = "orange";
      return;
    }

    if (selected.value === q.answer) {
      result.textContent = "正解！";
      result.style.color = "green";
      correct++;
    } else {
      result.textContent = `不正解（正解：${q.answer}）`;
      result.style.color = "red";
    }
  });

  const total = quizData.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  const resultText =
    `正答数：${correct} / ${total}\n点数：${score} / 100`;

  // ▼ 画面下に表示
  document.getElementById("score").textContent =
    resultText.replace("\n", " ｜ ");

  // ▼ アラートは1つだけ
  alert(resultText);
}

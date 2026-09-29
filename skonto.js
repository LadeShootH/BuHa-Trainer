(function () {
  "use strict";

  var CATEGORY_LABELS = {
    abziehen: "Skonto abziehen",
    aufschlagen: "Skonto aufschlagen",
    nutzen: "Skonto nutzen?",
    gewaehren: "Skonto gewähren?",
    gemischt: "Gemischt"
  };

  var state = {
    category: "abziehen",
    pool: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    attemptedCurrent: false,
    categoryComplete: false
  };

  // ---- DOM refs ----
  var textEl = document.getElementById("skonto-text");
  var headingEl = document.getElementById("skonto-heading");
  var scoreEl = document.getElementById("skonto-score");
  var streakEl = document.getElementById("skonto-streak");
  var inputAreaEl = document.getElementById("skonto-input-area");
  var formEl = document.getElementById("skonto-form");
  var checkBtn = document.getElementById("skonto-check-btn");
  var nextBtn = document.getElementById("skonto-next-btn");
  var feedbackEl = document.getElementById("skonto-feedback");
  var feedbackTextEl = document.getElementById("skonto-feedback-text");
  var explainBtn = document.getElementById("skonto-explain-btn");
  var explainModal = document.getElementById("skonto-explain-modal");
  var explainBody = document.getElementById("skonto-explain-body");
  var explainCloseBtn = document.getElementById("skonto-explain-close-btn");

  // ---- helpers ----
  function poolForCategory(cat) {
    var list = cat === "gemischt" ? skontoTasks.slice() : skontoTasks.filter(function (t) { return t.cat === cat; });
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }

  function parseNum(str) {
    if (typeof str !== "string") return NaN;
    var s = str.trim().replace(/[€%\s]/g, "");
    if (s.indexOf(",") !== -1 && s.indexOf(".") !== -1) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else if (s.indexOf(",") !== -1) {
      s = s.replace(",", ".");
    }
    return parseFloat(s);
  }

  function fmtEuro(n) {
    return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  }

  function effektiverJahreszins(skontoPct, skontoTage, zielTage) {
    return (skontoPct / (100 - skontoPct)) * (360 / (zielTage - skontoTage)) * 100;
  }

  // ---- input area rendering ----
  function renderInputArea(task) {
    if (task.cat === "abziehen" || task.cat === "aufschlagen") {
      var label = task.cat === "abziehen" ? "Zahlbetrag (€)" : "Rechnungsbetrag (€)";
      inputAreaEl.innerHTML =
        '<div class="skonto-field">' +
        '<label for="skonto-answer-amount">' + label + '</label>' +
        '<input type="text" inputmode="decimal" id="skonto-answer-amount" autocomplete="off" placeholder="z. B. 1960,00" />' +
        '</div>';
    } else {
      var decisionOptions = task.cat === "nutzen"
        ? '<option value="">Bitte wählen…</option><option value="nutzen">Skonto nutzen (per Dispo finanzieren)</option><option value="nicht_nutzen">Skonto nicht nutzen (Zahlungsziel abwarten)</option>'
        : '<option value="">Bitte wählen…</option><option value="gewaehren">Skonto gewähren</option><option value="nicht_gewaehren">Skonto nicht gewähren</option>';
      inputAreaEl.innerHTML =
        '<div class="skonto-field">' +
        '<label for="skonto-answer-rate">Effektiver Jahreszins des Skontos (%)</label>' +
        '<input type="text" inputmode="decimal" id="skonto-answer-rate" autocomplete="off" placeholder="z. B. 36,73" />' +
        '</div>' +
        '<div class="skonto-field">' +
        '<label for="skonto-answer-decision">Entscheidung</label>' +
        '<select id="skonto-answer-decision">' + decisionOptions + '</select>' +
        '</div>';
    }
  }

  function readAndCheck(task) {
    if (task.cat === "abziehen" || task.cat === "aufschlagen") {
      var amountInput = document.getElementById("skonto-answer-amount");
      var val = parseNum(amountInput.value);
      var correct = task.cat === "abziehen"
        ? task.brutto * (1 - task.skontoPct / 100)
        : task.ziel / (1 - task.skontoPct / 100);
      var ok = !isNaN(val) && Math.abs(val - correct) <= 0.02;
      return { ok: ok };
    }
    var rateInput = document.getElementById("skonto-answer-rate");
    var decisionSelect = document.getElementById("skonto-answer-decision");
    var rateVal = parseNum(rateInput.value);
    var rate = effektiverJahreszins(task.skontoPct, task.skontoTage, task.zielTage);
    var correctDecision = task.cat === "nutzen"
      ? (rate > task.dispoZins ? "nutzen" : "nicht_nutzen")
      : (rate < task.kontokorrentZins ? "gewaehren" : "nicht_gewaehren");
    var rateOk = !isNaN(rateVal) && Math.abs(rateVal - rate) <= 0.5;
    var decisionOk = decisionSelect.value === correctDecision;
    return { ok: rateOk && decisionOk, rateOk: rateOk, decisionOk: decisionOk };
  }

  function feedbackTextFor(task, result) {
    if (result.ok) return "Richtig.";
    if (task.cat === "abziehen" || task.cat === "aufschlagen") {
      return "Noch nicht korrekt. Prüfe deine Rechnung.";
    }
    if (!result.decisionOk && !result.rateOk) return "Noch nicht korrekt. Prüfe sowohl den Zinssatz als auch die Entscheidung.";
    if (!result.decisionOk) return "Der Zinssatz stimmt, die Entscheidung noch nicht.";
    return "Die Entscheidung stimmt, der Zinssatz noch nicht.";
  }

  function buildExplanation(task) {
    if (task.cat === "abziehen") {
      var correctA = task.brutto * (1 - task.skontoPct / 100);
      return "Zahlbetrag = Brutto × (1 − Skontosatz/100) = " + fmtEuro(task.brutto) + " × (1 − " + task.skontoPct + "/100) = " + fmtEuro(correctA) + ".";
    }
    if (task.cat === "aufschlagen") {
      var correctB = task.ziel / (1 - task.skontoPct / 100);
      return "Rechnungsbetrag = Zielbetrag ÷ (1 − Skontosatz/100) = " + fmtEuro(task.ziel) + " ÷ (1 − " + task.skontoPct + "/100) = " + fmtEuro(correctB) + ".";
    }
    var rate = effektiverJahreszins(task.skontoPct, task.skontoTage, task.zielTage);
    var formel = "Effektiver Jahreszins = (" + task.skontoPct + " ÷ (100 − " + task.skontoPct + ")) × (360 ÷ (" +
      task.zielTage + " − " + task.skontoTage + ")) × 100 = " + rate.toFixed(2) + " % p.a.";
    var schluss;
    if (task.cat === "nutzen") {
      schluss = rate > task.dispoZins
        ? "Der Skontozins (" + rate.toFixed(2) + " % p.a.) liegt über dem Dispozins (" + task.dispoZins + " % p.a.). Es lohnt sich, das Skonto per Dispo zu finanzieren."
        : "Der Skontozins (" + rate.toFixed(2) + " % p.a.) liegt unter dem Dispozins (" + task.dispoZins + " % p.a.). Dafür einen Dispokredit aufzunehmen, lohnt sich nicht.";
    } else {
      schluss = rate < task.kontokorrentZins
        ? "Der Skontozins (" + rate.toFixed(2) + " % p.a.) liegt unter dem eigenen Kontokorrentzins (" + task.kontokorrentZins + " % p.a.). Das Skonto zu gewähren ist günstiger, als sich selbst über den Kontokorrent zu finanzieren."
        : "Der Skontozins (" + rate.toFixed(2) + " % p.a.) liegt über dem eigenen Kontokorrentzins (" + task.kontokorrentZins + " % p.a.). Das Skonto zu gewähren wäre teurer, als sich selbst über den Kontokorrent zu finanzieren.";
    }
    return formel + " " + schluss;
  }

  // ---- flow ----
  function loadTask() {
    if (state.currentIndex >= state.pool.length) {
      showCategoryComplete();
      return;
    }
    var t = state.pool[state.currentIndex];
    textEl.textContent = t.text;
    headingEl.textContent = "Aufgabe " + (state.currentIndex + 1) + " / " + state.pool.length;
    renderInputArea(t);
    feedbackEl.className = "feedback";
    feedbackTextEl.textContent = "";
    explainBtn.hidden = true;
    checkBtn.disabled = false;
    nextBtn.disabled = true;
    nextBtn.textContent = "Nächste Aufgabe →";
    state.attemptedCurrent = false;
    state.categoryComplete = false;
  }

  function showCategoryComplete() {
    var label = CATEGORY_LABELS[state.category] || state.category;
    textEl.textContent = "";
    headingEl.textContent = "Kategorie geschafft";
    inputAreaEl.innerHTML = "";
    checkBtn.disabled = true;
    nextBtn.disabled = false;
    nextBtn.textContent = "Neue Runde starten";
    explainBtn.hidden = true;
    feedbackEl.className = "feedback is-correct";
    feedbackTextEl.textContent = "Geschafft: Du hast alle Aufgaben in „" + label + "“ einmal durchgespielt. Probier dich doch mal an den anderen Bereichen.";
    state.categoryComplete = true;
  }

  function handleCheck(e) {
    e.preventDefault();
    var t = state.pool[state.currentIndex];
    var result = readAndCheck(t);
    feedbackEl.className = "feedback " + (result.ok ? "is-correct" : "is-wrong");
    feedbackTextEl.textContent = feedbackTextFor(t, result);
    explainBtn.hidden = false;
    explainBtn.dataset.taskIndex = state.currentIndex;
    if (result.ok) {
      if (!state.attemptedCurrent) { state.score++; state.streak++; }
      scoreEl.textContent = state.score;
      streakEl.textContent = state.streak;
      checkBtn.disabled = true;
      nextBtn.disabled = false;
    } else {
      state.attemptedCurrent = true;
      state.streak = 0;
      streakEl.textContent = state.streak;
    }
  }

  function handleNext() {
    if (state.categoryComplete) {
      state.pool = poolForCategory(state.category);
      state.currentIndex = 0;
    } else {
      state.currentIndex++;
    }
    loadTask();
  }

  function showExplanation() {
    var t = state.pool[state.currentIndex];
    explainBody.innerHTML = "<p>" + buildExplanation(t) + "</p>";
    explainModal.hidden = false;
  }

  // ---- wiring ----
  document.querySelectorAll(".cat-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".cat-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.category = btn.dataset.cat;
      state.pool = poolForCategory(state.category);
      state.currentIndex = 0;
      loadTask();
    });
  });

  formEl.addEventListener("submit", handleCheck);
  nextBtn.addEventListener("click", handleNext);
  explainBtn.addEventListener("click", showExplanation);
  explainCloseBtn.addEventListener("click", function () { explainModal.hidden = true; });
  explainModal.addEventListener("click", function (e) { if (e.target === explainModal) explainModal.hidden = true; });

  state.pool = poolForCategory(state.category);
  loadTask();
})();

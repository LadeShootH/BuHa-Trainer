(function () {
  "use strict";

  var CATEGORY_LABELS = {
    linear: "Lineare AfA",
    zeitanteilig: "AfA im Anschaffungsjahr",
    restbuchwert: "Restbuchwert",
    degressiv: "Degressive AfA",
    gwg: "GWG",
    gemischt: "Gemischt"
  };

  var GWG_OPTIONS = [
    { value: "aufwand", label: "Sofort als Aufwand buchen (bis 250 €)" },
    { value: "gwg", label: "GWG: im Anschaffungsjahr voll abschreiben (250,01 bis 800 €)" },
    { value: "sammelposten", label: "Sammelposten: über 5 Jahre auflösen (800,01 bis 1.000 €)" },
    { value: "planmaessig", label: "Aktivieren und planmäßig über die Nutzungsdauer abschreiben (über 1.000 €)" }
  ];

  var state = {
    category: "linear",
    pool: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    attemptedCurrent: false,
    categoryComplete: false
  };

  // ---- DOM refs ----
  var textEl = document.getElementById("afa-text");
  var headingEl = document.getElementById("afa-heading");
  var scoreEl = document.getElementById("afa-score");
  var streakEl = document.getElementById("afa-streak");
  var inputAreaEl = document.getElementById("afa-input-area");
  var formEl = document.getElementById("afa-form");
  var checkBtn = document.getElementById("afa-check-btn");
  var nextBtn = document.getElementById("afa-next-btn");
  var feedbackEl = document.getElementById("afa-feedback");
  var feedbackTextEl = document.getElementById("afa-feedback-text");
  var explainBtn = document.getElementById("afa-explain-btn");
  var explainModal = document.getElementById("afa-explain-modal");
  var explainBody = document.getElementById("afa-explain-body");
  var explainCloseBtn = document.getElementById("afa-explain-close-btn");

  // ---- helpers ----
  function poolForCategory(cat) {
    var list = cat === "gemischt" ? afaTasks.slice() : afaTasks.filter(function (t) { return t.cat === cat; });
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

  function fmtNum(n) {
    return n.toLocaleString("de-DE", { maximumFractionDigits: 2 });
  }

  function degressivRestbuchwert(ak, satz, jahre) {
    return ak * Math.pow(1 - satz / 100, jahre);
  }

  function correctAmount(task) {
    switch (task.cat) {
      case "linear": return task.ak / task.nd;
      case "zeitanteilig": return task.ak / task.nd * task.monate / 12;
      case "restbuchwert": return task.ak - task.ak / task.nd * task.jahre;
      case "degressiv": return degressivRestbuchwert(task.ak, task.satz, task.jahr - 1) * task.satz / 100;
    }
    return NaN;
  }

  function correctGwg(netto) {
    if (netto <= 250) return "aufwand";
    if (netto <= 800) return "gwg";
    if (netto <= 1000) return "sammelposten";
    return "planmaessig";
  }

  function amountLabel(task) {
    switch (task.cat) {
      case "linear": return "Jährlicher AfA-Betrag (€)";
      case "zeitanteilig": return "AfA im Anschaffungsjahr (€)";
      case "restbuchwert": return "Restbuchwert (€)";
      case "degressiv": return "AfA-Betrag im " + task.jahr + ". Jahr (€)";
    }
    return "";
  }

  // ---- input area rendering ----
  function renderInputArea(task) {
    if (task.cat === "gwg") {
      var opts = '<option value="">Bitte wählen…</option>' + GWG_OPTIONS.map(function (o) {
        return '<option value="' + o.value + '">' + o.label + '</option>';
      }).join("");
      inputAreaEl.innerHTML =
        '<div class="skonto-field">' +
        '<label for="afa-answer-gwg">Behandlung</label>' +
        '<select id="afa-answer-gwg">' + opts + '</select>' +
        '</div>';
    } else {
      inputAreaEl.innerHTML =
        '<div class="skonto-field">' +
        '<label for="afa-answer-amount">' + amountLabel(task) + '</label>' +
        '<input type="text" inputmode="decimal" id="afa-answer-amount" autocomplete="off" placeholder="z. B. 6000,00" />' +
        '</div>';
    }
  }

  function readAndCheck(task) {
    if (task.cat === "gwg") {
      return { ok: document.getElementById("afa-answer-gwg").value === correctGwg(task.netto) };
    }
    var val = parseNum(document.getElementById("afa-answer-amount").value);
    return { ok: !isNaN(val) && Math.abs(val - correctAmount(task)) <= 0.02 };
  }

  function feedbackTextFor(task, result) {
    if (result.ok) return "Richtig.";
    return task.cat === "gwg" ? "Noch nicht korrekt. Prüfe die Wertgrenzen." : "Noch nicht korrekt. Prüfe deine Rechnung.";
  }

  function buildExplanation(task) {
    var linear;
    switch (task.cat) {
      case "linear":
        return "AfA = Anschaffungskosten ÷ Nutzungsdauer = " + fmtEuro(task.ak) + " ÷ " + task.nd + " = " + fmtEuro(correctAmount(task)) + " pro Jahr.";
      case "zeitanteilig":
        linear = task.ak / task.nd;
        return "Jahres-AfA = " + fmtEuro(task.ak) + " ÷ " + task.nd + " = " + fmtEuro(linear) + ". Im Anschaffungsjahr wird nur anteilig abgeschrieben, der Anschaffungsmonat zählt voll: " +
          fmtEuro(linear) + " × " + task.monate + " ÷ 12 = " + fmtEuro(correctAmount(task)) + ".";
      case "restbuchwert":
        linear = task.ak / task.nd;
        return "Jahres-AfA = " + fmtEuro(task.ak) + " ÷ " + task.nd + " = " + fmtEuro(linear) + ". Restbuchwert = Anschaffungskosten − AfA × Jahre = " +
          fmtEuro(task.ak) + " − " + fmtEuro(linear) + " × " + task.jahre + " = " + fmtEuro(correctAmount(task)) + ".";
      case "degressiv":
        var parts = [];
        for (var y = 1; y <= task.jahr; y++) {
          var rbw = degressivRestbuchwert(task.ak, task.satz, y - 1);
          parts.push(y + ". Jahr: " + fmtEuro(rbw) + " × " + fmtNum(task.satz) + " % = " + fmtEuro(rbw * task.satz / 100));
        }
        return "Bei der degressiven AfA gilt der Prozentsatz immer für den Restbuchwert zu Jahresbeginn, deshalb sinkt der AfA-Betrag jedes Jahr. " +
          parts.join("; ") + ". Gesucht: " + fmtEuro(correctAmount(task)) + ".";
      case "gwg":
        var n = task.netto;
        var kind = correctGwg(n);
        var head = "Maßgeblich sind die Netto-Anschaffungskosten (" + fmtEuro(n) + "), weil die Vorsteuer nicht zu den Anschaffungskosten zählt. ";
        if (kind === "aufwand") return head + "Bis 250 € netto wird der Gegenstand nicht aktiviert, sondern sofort als Aufwand (z. B. Bürobedarf) gebucht.";
        if (kind === "gwg") return head + "Zwischen 250,01 € und 800 € netto ist es ein geringwertiges Wirtschaftsgut (GWG): Es wird aktiviert und im Anschaffungsjahr voll abgeschrieben. Voraussetzung ist ein abnutzbares, selbstständig nutzbares, bewegliches Wirtschaftsgut.";
        if (kind === "sammelposten") return head + "Über 800 € bis 1.000 € netto kommt nur der Sammelposten in Frage: Alle Güter dieses Bereichs eines Jahres werden zusammen aktiviert und gleichmäßig über 5 Jahre abgeschrieben (je 20 % pro Jahr).";
        return head + "Über 1.000 € netto wird das Wirtschaftsgut aktiviert und planmäßig über die betriebsgewöhnliche Nutzungsdauer abgeschrieben.";
    }
    return "";
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

(function () {
  "use strict";

  // Konten, Eröffnungsbilanz, Übungsfälle und Abschluss-Szenario stehen in
  // cases.js (muss vor dieser Datei per <script> geladen werden). Hier folgt
  // nur die Anwendungslogik: Formular, Prüfung, Live-Bilanz, Erklär-Modal.

  function buildAbschlussPhases() {
    var aufwandSumme = abschlussSzenario.aufwand.reduce(function (s, l) { return s + l.b; }, 0);
    var ertragSumme = abschlussSzenario.ertrag.reduce(function (s, l) { return s + l.b; }, 0);
    var gewinn = ertragSumme - aufwandSumme;

    var phase1 = [];
    abschlussSzenario.aufwand.forEach(function (l) {
      phase1.push({
        text: "Schließe das Konto " + accounts[l.a].label + " ab (Saldo " + fmt(l.b) + " € im Soll).",
        soll: [{ a: "GuV", b: l.b }], haben: [{ a: l.a, b: l.b }]
      });
    });
    abschlussSzenario.ertrag.forEach(function (l) {
      phase1.push({
        text: "Schließe das Konto " + accounts[l.a].label + " ab (Saldo " + fmt(l.b) + " € im Haben).",
        soll: [{ a: l.a, b: l.b }], haben: [{ a: "GuV", b: l.b }]
      });
    });

    var phase2 = [{
      text: gewinn >= 0
        ? "Der Saldo des GuV-Kontos (Gewinn: " + fmt(gewinn) + " €) wird auf das Eigenkapitalkonto übertragen."
        : "Der Saldo des GuV-Kontos (Verlust: " + fmt(Math.abs(gewinn)) + " €) wird auf das Eigenkapitalkonto übertragen.",
      soll: gewinn >= 0 ? [{ a: "GuV", b: gewinn }] : [{ a: "Eigenkapital", b: Math.abs(gewinn) }],
      haben: gewinn >= 0 ? [{ a: "Eigenkapital", b: gewinn }] : [{ a: "GuV", b: Math.abs(gewinn) }]
    }];

    var passivaNachGewinn = abschlussSzenario.passiva.map(function (l) {
      return l.a === "Eigenkapital" ? { a: l.a, b: l.b + gewinn } : l;
    });

    var phase3 = [];
    abschlussSzenario.aktiva.forEach(function (l) {
      phase3.push({
        text: "Schließe das Konto " + accounts[l.a].label + " ab (Saldo " + fmt(l.b) + " € im Soll).",
        soll: [{ a: "SBK", b: l.b }], haben: [{ a: l.a, b: l.b }]
      });
    });
    passivaNachGewinn.forEach(function (l) {
      phase3.push({
        text: "Schließe das Konto " + accounts[l.a].label + " ab (Saldo " + fmt(l.b) + " € im Haben).",
        soll: [{ a: l.a, b: l.b }], haben: [{ a: "SBK", b: l.b }]
      });
    });

    var phase4 = [];
    abschlussSzenario.aktiva.forEach(function (l) {
      phase4.push({
        text: "Eröffne das Konto " + accounts[l.a].label + " mit einem Anfangsbestand von " + fmt(l.b) + " € (im Soll).",
        soll: [{ a: l.a, b: l.b }], haben: [{ a: "EBK", b: l.b }]
      });
    });
    passivaNachGewinn.forEach(function (l) {
      phase4.push({
        text: "Eröffne das Konto " + accounts[l.a].label + " mit einem Anfangsbestand von " + fmt(l.b) + " € (im Haben).",
        soll: [{ a: "EBK", b: l.b }], haben: [{ a: l.a, b: l.b }]
      });
    });

    return { 1: phase1, 2: phase2, 3: phase3, 4: phase4 };
  }

  var abschlussState = null;

  function collectorForPhase(phase) {
    if (phase === 1 || phase === 2) return "GuV";
    if (phase === 3) return "SBK";
    return "EBK";
  }

  function startAbschluss() {
    abschlussState = { phases: buildAbschlussPhases(), phase: 1, taskIndex: 0, log: [], attempted: false, done: false };
    loadAbschlussTask();
  }

  function loadAbschlussTask() {
    var tasks = abschlussState.phases[abschlussState.phase];
    var task = tasks[abschlussState.taskIndex];
    caseTextEl.textContent = task.text;
    document.getElementById("case-heading").textContent =
      "Phase " + abschlussState.phase + "/4 – " + PHASE_NAMES[abschlussState.phase] +
      " · Aufgabe " + (abschlussState.taskIndex + 1) + "/" + tasks.length;
    resetRows();
    feedbackEl.className = "feedback";
    feedbackTextEl.textContent = "";
    explainBtn.hidden = true;
    checkBtn.disabled = false;
    nextBtn.disabled = true;
    nextBtn.textContent = "Nächste Aufgabe →";
    abschlussState.attempted = false;
    renderAbschlussPanel();
  }

  function renderAbschlussPanel() {
    var key = collectorForPhase(abschlussState.phase);
    var sollRows = [], habenRows = [];
    abschlussState.log.forEach(function (entry) {
      if (entry.soll[0].a === key) sollRows.push({ label: accounts[entry.haben[0].a].label, amount: entry.soll[0].b });
      if (entry.haben[0].a === key) habenRows.push({ label: accounts[entry.soll[0].a].label, amount: entry.haben[0].b });
    });

    document.getElementById("bilanz-heading").textContent = "Live: " + accounts[key].label;
    var labels = document.querySelectorAll(".bilanz-col-label");
    labels[0].textContent = "Soll";
    labels[1].textContent = "Haben";

    var sollEl = document.getElementById("aktiva-rows");
    var habenEl = document.getElementById("passiva-rows");
    sollEl.innerHTML = ""; habenEl.innerHTML = "";
    var sollTotal = 0, habenTotal = 0;
    sollRows.forEach(function (r) { sollTotal += r.amount; sollEl.innerHTML += '<div class="bilanz-row"><span>an ' + r.label + "</span><span>" + fmt(r.amount) + "</span></div>"; });
    habenRows.forEach(function (r) { habenTotal += r.amount; habenEl.innerHTML += '<div class="bilanz-row"><span>an ' + r.label + "</span><span>" + fmt(r.amount) + "</span></div>"; });

    document.getElementById("aktiva-total").textContent = "Summe " + fmt(sollTotal);
    document.getElementById("passiva-total").textContent = "Summe " + fmt(habenTotal);

    var checkEl = document.getElementById("balance-check");
    if (sollRows.length === 0 && habenRows.length === 0) {
      checkEl.textContent = "Noch keine Buchung erfasst";
      checkEl.className = "balance-check";
    } else if (Math.round(sollTotal) === Math.round(habenTotal)) {
      checkEl.textContent = "Konto ausgeglichen";
      checkEl.className = "balance-check ok";
    } else {
      checkEl.textContent = "Noch nicht ausgeglichen (Differenz " + fmt(Math.abs(sollTotal - habenTotal)) + " €)";
      checkEl.className = "balance-check off";
    }
  }

  function handleAbschlussCheck(e) {
    e.preventDefault();
    var tasks = abschlussState.phases[abschlussState.phase];
    var task = tasks[abschlussState.taskIndex];
    var sollActual = readRows(sollRowsEl);
    var habenActual = readRows(habenRowsEl);
    var correct = normalizeLines(sollActual) === normalizeLines(task.soll) &&
                  normalizeLines(habenActual) === normalizeLines(task.haben);

    if (correct) {
      var sollText = task.soll.map(function (l) { return accounts[l.a].label + " " + fmt(l.b) + " €"; }).join(" + ");
      var habenText = task.haben.map(function (l) { return accounts[l.a].label; }).join(" + ");
      feedbackTextEl.textContent = "Richtig: " + sollText + " an " + habenText;
      feedbackEl.className = "feedback is-correct";
      explainBtn.hidden = false;
      abschlussState.log.push({ soll: task.soll, haben: task.haben });
      renderAbschlussPanel();
      if (!abschlussState.attempted) { state.score++; state.streak++; }
      scoreEl.textContent = state.score;
      streakEl.textContent = state.streak;
      saveProgress();
      checkBtn.disabled = true;
      nextBtn.disabled = false;
    } else {
      feedbackTextEl.textContent = "Noch nicht korrekt. Prüfe Konten und Soll/Haben-Seite.";
      feedbackEl.className = "feedback is-wrong";
      explainBtn.hidden = false;
      abschlussState.attempted = true;
      state.streak = 0;
      streakEl.textContent = state.streak;
      saveProgress();
    }
  }

  function advanceAbschluss() {
    abschlussState.taskIndex++;
    var tasks = abschlussState.phases[abschlussState.phase];
    if (abschlussState.taskIndex >= tasks.length) {
      if (abschlussState.phase >= 4) {
        abschlussState.done = true;
        showAbschlussComplete();
        return;
      }
      abschlussState.phase++;
      abschlussState.taskIndex = 0;
    }
    loadAbschlussTask();
  }

  function showAbschlussComplete() {
    caseTextEl.textContent = "Geschafft! Der Jahresabschluss ist gebucht und das neue Jahr ist über das EBK eröffnet.";
    document.getElementById("case-heading").textContent = "Abschluss abgeschlossen";
    sollRowsEl.innerHTML = "";
    habenRowsEl.innerHTML = "";
    checkBtn.disabled = true;
    nextBtn.disabled = true;
    feedbackEl.className = "feedback";
    feedbackTextEl.textContent = "";
    explainBtn.hidden = true;
  }

  // ---- state ----
  var STORAGE_KEY = "buhasim_progress_v1";
  var state = {
    category: "grundlagen",
    pool: [],
    currentIndex: 0,
    balances: Object.assign({}, openingBalances),
    score: 0,
    streak: 0,
    attemptedCurrent: false
  };

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        state.score = saved.score || 0;
        state.streak = saved.streak || 0;
      }
    } catch (e) { /* ignore */ }
  }
  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ score: state.score, streak: state.streak }));
    } catch (e) { /* ignore */ }
  }

  function poolForCategory(cat) {
    var list = cat === "gemischt" ? cases.slice() : cases.filter(function (c) { return c.cat === cat; });
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = list[i]; list[i] = list[j]; list[j] = tmp;
    }
    return list;
  }

  function fmt(n) {
    return Math.round(n).toLocaleString("de-DE");
  }

  // ---- DOM refs ----
  var sollRowsEl = document.getElementById("soll-rows");
  var habenRowsEl = document.getElementById("haben-rows");
  var caseTextEl = document.getElementById("case-text");
  var scoreEl = document.getElementById("score");
  var streakEl = document.getElementById("streak");
  var feedbackEl = document.getElementById("feedback");
  var feedbackTextEl = document.getElementById("feedback-text");
  var checkBtn = document.getElementById("check-btn");
  var nextBtn = document.getElementById("next-btn");
  var bilanzToggle = document.getElementById("toggle-bilanz");
  var bilanzPanel = document.getElementById("bilanz-panel");
  var resetBilanzBtn = document.getElementById("reset-bilanz-btn");
  var statCountEl = document.getElementById("stat-count");
  var explainBtn = document.getElementById("explain-btn");
  var explainModal = document.getElementById("explain-modal");
  var explainBody = document.getElementById("explain-body");
  var explainCloseBtn = document.getElementById("explain-close-btn");

  statCountEl.textContent = cases.length;

  function accountOptionsHtml(selected) {
    var groups = { A: "Aktivkonten", P: "Passivkonten", E: "Aufwandskonten", Er: "Ertragskonten" };
    if (state.category === "abschluss") groups.K = "Abschlusskonten";
    var html = '<option value="">– Konto wählen –</option>';
    Object.keys(groups).forEach(function (g) {
      html += '<optgroup label="' + groups[g] + '">';
      Object.keys(accounts).forEach(function (k) {
        if (accounts[k].type === g) {
          html += '<option value="' + k + '"' + (k === selected ? " selected" : "") + ">" + accounts[k].label + "</option>";
        }
      });
      html += "</optgroup>";
    });
    return html;
  }

  function makeRow() {
    var row = document.createElement("div");
    row.className = "posting-row";
    row.innerHTML =
      '<select class="acct-select">' + accountOptionsHtml() + "</select>" +
      '<input type="number" class="amt-input" placeholder="Betrag €" step="1" />';
    return row;
  }

  function addRow(side) {
    var container = side === "soll" ? sollRowsEl : habenRowsEl;
    if (container.children.length >= 3) return;
    container.appendChild(makeRow());
  }

  function resetRows() {
    sollRowsEl.innerHTML = "";
    habenRowsEl.innerHTML = "";
    sollRowsEl.appendChild(makeRow());
    habenRowsEl.appendChild(makeRow());
  }

  document.querySelectorAll(".add-row-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { addRow(btn.dataset.side); });
  });

  function readRows(container) {
    var out = [];
    container.querySelectorAll(".posting-row").forEach(function (row) {
      var acct = row.querySelector(".acct-select").value;
      var amt = parseFloat(row.querySelector(".amt-input").value);
      if (acct && !isNaN(amt) && amt > 0) out.push({ a: acct, b: amt });
    });
    return out;
  }

  function normalizeLines(lines) {
    return lines
      .map(function (l) { return l.a + ":" + Math.round(l.b); })
      .sort()
      .join("|");
  }

  function loadCase() {
    if (state.currentIndex >= state.pool.length) {
      state.pool = poolForCategory(state.category);
      state.currentIndex = 0;
    }
    var c = state.pool[state.currentIndex];
    caseTextEl.textContent = c.text;
    document.getElementById("case-heading").textContent = "Fall " + (state.currentIndex + 1) + " / " + state.pool.length;
    nextBtn.textContent = "Nächster Fall →";
    resetRows();
    feedbackEl.className = "feedback";
    feedbackTextEl.textContent = "";
    explainBtn.hidden = true;
    checkBtn.disabled = false;
    nextBtn.disabled = true;
    state.attemptedCurrent = false;
  }

  function applyBooking(c) {
    c.soll.forEach(function (l) {
      var t = accounts[l.a].type;
      state.balances[l.a] += (t === "A" || t === "E") ? l.b : -l.b;
    });
    c.haben.forEach(function (l) {
      var t = accounts[l.a].type;
      state.balances[l.a] += (t === "A" || t === "E") ? -l.b : l.b;
    });
  }

  function computeGewinn() {
    var gewinn = 0;
    Object.keys(accounts).forEach(function (k) {
      if (accounts[k].type === "Er") gewinn += state.balances[k];
      if (accounts[k].type === "E") gewinn -= state.balances[k];
    });
    return gewinn;
  }

  function renderBilanz() {
    var gewinn = computeGewinn();

    var aktivaEl = document.getElementById("aktiva-rows");
    aktivaEl.innerHTML = "";
    var aktivaTotal = 0;
    AKTIVA_KEYS.forEach(function (k) {
      aktivaTotal += state.balances[k];
      aktivaEl.innerHTML += '<div class="bilanz-row"><span>' + accounts[k].label + "</span><span>" + fmt(state.balances[k]) + "</span></div>";
    });

    var passivaEl = document.getElementById("passiva-rows");
    passivaEl.innerHTML = "";
    var passivaTotal = 0;
    PASSIVA_KEYS.forEach(function (k) {
      var val = state.balances[k];
      var label = accounts[k].label;
      if (k === "Eigenkapital") { val += gewinn; label = accounts[k].label + " (inkl. Gewinn)"; }
      passivaTotal += val;
      passivaEl.innerHTML += '<div class="bilanz-row"><span>' + label + "</span><span>" + fmt(val) + "</span></div>";
    });

    document.getElementById("aktiva-total").textContent = "Summe " + fmt(aktivaTotal);
    document.getElementById("passiva-total").textContent = "Summe " + fmt(passivaTotal);

    var checkEl = document.getElementById("balance-check");
    if (Math.round(aktivaTotal) === Math.round(passivaTotal)) {
      checkEl.textContent = "Bilanz ausgeglichen";
      checkEl.className = "balance-check ok";
    } else {
      checkEl.textContent = "Bilanz weicht ab um " + fmt(Math.abs(aktivaTotal - passivaTotal)) + " €";
      checkEl.className = "balance-check off";
    }
  }

  function handleCheck(e) {
    e.preventDefault();
    var c = state.pool[state.currentIndex];
    var sollActual = readRows(sollRowsEl);
    var habenActual = readRows(habenRowsEl);
    var correct = normalizeLines(sollActual) === normalizeLines(c.soll) &&
                  normalizeLines(habenActual) === normalizeLines(c.haben);

    if (correct) {
      var sollText = c.soll.map(function (l) { return accounts[l.a].label + " " + fmt(l.b) + " €"; }).join(" + ");
      var habenText = c.haben.map(function (l) { return accounts[l.a].label; }).join(" + ");
      feedbackTextEl.textContent = "Richtig: " + sollText + " an " + habenText;
      feedbackEl.className = "feedback is-correct";
      explainBtn.hidden = false;
      applyBooking(c);
      renderBilanz();
      if (!state.attemptedCurrent) { state.score++; state.streak++; }
      scoreEl.textContent = state.score;
      streakEl.textContent = state.streak;
      saveProgress();
      checkBtn.disabled = true;
      nextBtn.disabled = false;
    } else {
      feedbackTextEl.textContent = "Noch nicht korrekt. Prüfe Konten, Soll/Haben-Seite und Beträge.";
      feedbackEl.className = "feedback is-wrong";
      explainBtn.hidden = false;
      state.attemptedCurrent = true;
      state.streak = 0;
      streakEl.textContent = state.streak;
      saveProgress();
    }
  }

  var ABSCHLUSS_NOTES = {
    GuV: "Das GuV-Konto (9300) sammelt am Jahresende alle Erfolgskonten und ermittelt daraus Gewinn oder Verlust der Periode.",
    SBK: "Das Schlussbilanzkonto (9400) übernimmt am Jahresende die Salden aller Bestandskonten und schließt sie ab.",
    EBK: "Das Eröffnungsbilanzkonto (9100) eröffnet zu Beginn der neuen Periode die Bestandskonten mit den Salden aus dem Vorjahr."
  };

  var SEITE_REGELN = {
    A_soll: "Zugang auf einem Aktivkonto — Aktivkonten werden im Soll gebucht, wenn sie zunehmen.",
    A_haben: "Abgang auf einem Aktivkonto — Aktivkonten werden im Haben gebucht, wenn sie abnehmen.",
    P_soll: "Abgang auf einem Passivkonto — Passivkonten werden im Soll gebucht, wenn sie abnehmen.",
    P_haben: "Zugang auf einem Passivkonto — Passivkonten werden im Haben gebucht, wenn sie zunehmen.",
    E_soll: "Ein Aufwand entsteht bzw. erhöht sich — Aufwandskonten werden wie Aktivkonten im Soll gebucht.",
    E_haben: "Ein bereits gebuchter Aufwand wird gemindert (z. B. durch Rücksendung, Nachlass oder Skonto) — deshalb steht das Konto hier ausnahmsweise im Haben.",
    Er_soll: "Ein bereits gebuchter Ertrag wird gemindert (z. B. durch Rücksendung, Nachlass oder Skonto) — deshalb steht das Konto hier ausnahmsweise im Soll.",
    Er_haben: "Ein Ertrag entsteht bzw. erhöht sich — Ertragskonten werden wie Passivkonten im Haben gebucht."
  };

  function explainLineHtml(line, seite) {
    var acc = accounts[line.a];
    var reason = acc.type === "K" ? (ABSCHLUSS_NOTES[line.a] || "") : SEITE_REGELN[acc.type + "_" + seite];
    return '<p class="explain-line"><strong>' + acc.label + "</strong> (" + fmt(line.b) + " €) steht im " +
      (seite === "soll" ? "Soll" : "Haben") + ": " + reason + "</p>";
  }

  function showExplanationFor(task) {
    var html = "";
    task.soll.forEach(function (l) { html += explainLineHtml(l, "soll"); });
    task.haben.forEach(function (l) { html += explainLineHtml(l, "haben"); });
    var sollText = task.soll.map(function (l) { return accounts[l.a].label; }).join(" + ");
    var habenText = task.haben.map(function (l) { return accounts[l.a].label; }).join(" + ");
    html += '<p class="explain-summary">Buchungssatz: ' + sollText + " an " + habenText + "</p>";
    explainBody.innerHTML = html;
    explainModal.hidden = false;
  }

  explainBtn.addEventListener("click", function () {
    var task;
    if (state.category === "abschluss") {
      if (!abschlussState || abschlussState.done) return;
      task = abschlussState.phases[abschlussState.phase][abschlussState.taskIndex];
    } else {
      task = state.pool[state.currentIndex];
    }
    if (task) showExplanationFor(task);
  });

  explainCloseBtn.addEventListener("click", function () { explainModal.hidden = true; });
  explainModal.addEventListener("click", function (e) { if (e.target === explainModal) explainModal.hidden = true; });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !explainModal.hidden) explainModal.hidden = true;
  });

  function resetBilanzLabels() {
    document.getElementById("bilanz-heading").textContent = "Live-Bilanz";
    var labels = document.querySelectorAll(".bilanz-col-label");
    labels[0].textContent = "Aktiva";
    labels[1].textContent = "Passiva";
  }

  document.getElementById("booking-form").addEventListener("submit", function (e) {
    if (state.category === "abschluss") { handleAbschlussCheck(e); } else { handleCheck(e); }
  });

  nextBtn.addEventListener("click", function () {
    if (state.category === "abschluss") { advanceAbschluss(); } else { state.currentIndex++; loadCase(); }
  });

  var bilanzToggleWrapperEl = document.querySelector(".bilanz-toggle");
  var bookingFormEl = document.getElementById("booking-form");

  document.querySelectorAll(".cat-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".cat-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.category = btn.dataset.cat;
      bookingFormEl.classList.toggle("is-abschluss", state.category === "abschluss");

      if (state.category === "abschluss") {
        bilanzToggleWrapperEl.style.display = "none";
        bilanzPanel.classList.remove("is-hidden");
        startAbschluss();
      } else {
        bilanzToggleWrapperEl.style.display = "";
        resetBilanzLabels();
        bilanzPanel.classList.toggle("is-hidden", !bilanzToggle.checked);
        state.pool = poolForCategory(state.category);
        state.currentIndex = 0;
        loadCase();
        renderBilanz();
      }
    });
  });

  bilanzToggle.addEventListener("change", function () {
    bilanzPanel.classList.toggle("is-hidden", !bilanzToggle.checked);
  });

  resetBilanzBtn.addEventListener("click", function () {
    if (state.category === "abschluss") {
      startAbschluss();
    } else {
      state.balances = Object.assign({}, openingBalances);
      renderBilanz();
    }
  });

  // ---- init ----
  loadProgress();
  scoreEl.textContent = state.score;
  streakEl.textContent = state.streak;
  state.pool = poolForCategory(state.category);
  renderBilanz();
  loadCase();
  bilanzPanel.classList.toggle("is-hidden", !bilanzToggle.checked);
})();

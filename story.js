(function () {
  "use strict";

  // accounts kommt aus cases.js, storySteps aus story-data.js (beide vor
  // dieser Datei per <script> geladen).

  var state = {
    index: 0,
    balances: {},
    attempted: false,
    done: false
  };
  Object.keys(accounts).forEach(function (k) { state.balances[k] = 0; });

  function fmt(n) {
    return Math.round(n).toLocaleString("de-DE");
  }

  var chapterEl = document.getElementById("story-chapter");
  var dateEl = document.getElementById("story-date");
  var narrativeEl = document.getElementById("story-narrative");
  var taskEl = document.getElementById("story-task");
  var progressEl = document.getElementById("story-progress");
  var sollRowsEl = document.getElementById("story-soll-rows");
  var habenRowsEl = document.getElementById("story-haben-rows");
  var checkBtn = document.getElementById("story-check-btn");
  var nextBtn = document.getElementById("story-next-btn");
  var feedbackEl = document.getElementById("story-feedback");
  var feedbackTextEl = document.getElementById("story-feedback-text");
  var reactionEl = document.getElementById("story-reaction");
  var bankStatEl = document.getElementById("stat-bank");
  var kasseStatEl = document.getElementById("stat-kasse");
  var progressFillEl = document.getElementById("story-progress-fill");

  function accountOptionsHtml() {
    var groups = { A: "Aktivkonten", P: "Passivkonten", E: "Aufwandskonten", Er: "Ertragskonten", K: "Abschlusskonten" };
    var html = '<option value="">– Konto wählen –</option>';
    Object.keys(groups).forEach(function (g) {
      html += '<optgroup label="' + groups[g] + '">';
      Object.keys(accounts).forEach(function (k) {
        if (accounts[k].type === g) {
          html += '<option value="' + k + '">' + accounts[k].label + "</option>";
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

  function resetRows() {
    sollRowsEl.innerHTML = "";
    habenRowsEl.innerHTML = "";
    sollRowsEl.appendChild(makeRow());
    habenRowsEl.appendChild(makeRow());
  }

  function addRow(side) {
    var container = side === "soll" ? sollRowsEl : habenRowsEl;
    if (container.children.length >= 3) return;
    container.appendChild(makeRow());
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
    return lines.map(function (l) { return l.a + ":" + Math.round(l.b); }).sort().join("|");
  }

  function updateStats() {
    bankStatEl.textContent = fmt(state.balances.Bank) + " €";
    kasseStatEl.textContent = fmt(state.balances.Kasse) + " €";
  }

  function loadStep() {
    if (state.index >= storySteps.length) {
      showStoryComplete();
      return;
    }
    var step = storySteps[state.index];
    chapterEl.textContent = step.chapter;
    dateEl.textContent = step.date;
    narrativeEl.textContent = step.narrative;
    taskEl.textContent = step.task;
    progressEl.textContent = "Buchung " + (state.index + 1) + " / " + storySteps.length;
    progressFillEl.style.width = Math.round(((state.index) / storySteps.length) * 100) + "%";
    resetRows();
    feedbackEl.className = "feedback";
    feedbackTextEl.textContent = "";
    reactionEl.hidden = true;
    reactionEl.textContent = "";
    checkBtn.disabled = false;
    nextBtn.disabled = true;
    state.attempted = false;
  }

  function applyBooking(step) {
    step.soll.forEach(function (l) {
      var t = accounts[l.a].type;
      state.balances[l.a] += (t === "A" || t === "E") ? l.b : -l.b;
    });
    step.haben.forEach(function (l) {
      var t = accounts[l.a].type;
      state.balances[l.a] += (t === "A" || t === "E") ? -l.b : l.b;
    });
    updateStats();
  }

  function evaluateReaction(step) {
    var r = step.reaction;
    if (!r) return null;
    if (r.type === "always") return r.text;
    if (r.type === "threshold") {
      var val = state.balances[r.account];
      var hit = false;
      if (r.op === "<") hit = val < r.value;
      else if (r.op === ">") hit = val > r.value;
      else if (r.op === "<=") hit = val <= r.value;
      else if (r.op === ">=") hit = val >= r.value;
      return hit ? r.text : null;
    }
    return null;
  }

  function handleCheck(e) {
    e.preventDefault();
    var step = storySteps[state.index];
    var sollActual = readRows(sollRowsEl);
    var habenActual = readRows(habenRowsEl);
    var correct = normalizeLines(sollActual) === normalizeLines(step.soll) &&
                  normalizeLines(habenActual) === normalizeLines(step.haben);

    if (correct) {
      var sollText = step.soll.map(function (l) { return accounts[l.a].label + " " + fmt(l.b) + " €"; }).join(" + ");
      var habenText = step.haben.map(function (l) { return accounts[l.a].label; }).join(" + ");
      feedbackTextEl.textContent = "Richtig: " + sollText + " an " + habenText;
      feedbackEl.className = "feedback is-correct";
      applyBooking(step);
      var reaction = evaluateReaction(step);
      if (reaction) {
        reactionEl.hidden = false;
        reactionEl.textContent = reaction;
      }
      checkBtn.disabled = true;
      nextBtn.disabled = false;
    } else {
      feedbackTextEl.textContent = "Noch nicht korrekt. Prüfe Konten und Soll/Haben-Seite.";
      feedbackEl.className = "feedback is-wrong";
      state.attempted = true;
    }
  }

  function showStoryComplete() {
    chapterEl.textContent = "Ende";
    dateEl.textContent = "";
    narrativeEl.textContent = "Du hast die Meyer Großhandel GmbH durch ihr komplettes erstes Geschäftsjahr begleitet — von der Gründung bis zum fertigen Jahresabschluss.";
    taskEl.textContent = "";
    progressEl.textContent = "Buchung " + storySteps.length + " / " + storySteps.length;
    progressFillEl.style.width = "100%";
    sollRowsEl.innerHTML = "";
    habenRowsEl.innerHTML = "";
    checkBtn.disabled = true;
    nextBtn.disabled = true;
    feedbackEl.className = "feedback is-correct";
    feedbackTextEl.textContent = "🎉 Story abgeschlossen! Schau doch als Nächstes im normalen Übungsmodus vorbei.";
    reactionEl.hidden = true;
    state.done = true;
  }

  document.getElementById("story-form").addEventListener("submit", handleCheck);

  nextBtn.addEventListener("click", function () {
    state.index++;
    loadStep();
  });

  document.getElementById("story-restart-btn").addEventListener("click", function () {
    state.index = 0;
    state.done = false;
    Object.keys(accounts).forEach(function (k) { state.balances[k] = 0; });
    updateStats();
    loadStep();
  });

  updateStats();
  loadStep();
})();

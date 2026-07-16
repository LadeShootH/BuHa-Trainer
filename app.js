(function () {
  "use strict";

  // ---- account master data ----
  var accounts = {
    Kasse: { type: "A", label: "Kasse" },
    Bank: { type: "A", label: "Bank" },
    Forderungen: { type: "A", label: "Forderungen a. L+L" },
    Waren: { type: "A", label: "Waren" },
    Fuhrpark: { type: "A", label: "Fuhrpark" },
    Vorsteuer: { type: "A", label: "Vorsteuer" },
    Eigenkapital: { type: "P", label: "Eigenkapital" },
    Bankdarlehen: { type: "P", label: "Bankdarlehen" },
    Verbindlichkeiten: { type: "P", label: "Verbindlichkeiten a. L+L" },
    Umsatzsteuer: { type: "P", label: "Umsatzsteuer" },
    Mietaufwand: { type: "E", label: "Mietaufwand" },
    Loehne: { type: "E", label: "Löhne" },
    Buerobedarf: { type: "E", label: "Bürobedarf" },
    Umsatzerloese: { type: "Er", label: "Umsatzerlöse" }
  };

  var openingBalances = {
    Kasse: 5000, Bank: 20000, Waren: 10000, Fuhrpark: 15000,
    Forderungen: 0, Vorsteuer: 0,
    Eigenkapital: 30000, Bankdarlehen: 20000, Verbindlichkeiten: 0, Umsatzsteuer: 0,
    Mietaufwand: 0, Loehne: 0, Buerobedarf: 0, Umsatzerloese: 0
  };

  var AKTIVA_KEYS = ["Kasse", "Bank", "Forderungen", "Waren", "Fuhrpark", "Vorsteuer"];
  var PASSIVA_KEYS = ["Eigenkapital", "Bankdarlehen", "Verbindlichkeiten", "Umsatzsteuer"];

  // ---- case pool ----
  // soll / haben are arrays of {account, amount} so cases can be simple (1:1) or composed (n:1 / 1:n)
  var cases = [
    { cat: "grundlagen", text: "Der Betrieb kauft Waren für 800 € und bezahlt sofort in bar.",
      soll: [{ a: "Waren", b: 800 }], haben: [{ a: "Kasse", b: 800 }] },
    { cat: "grundlagen", text: "Ein Kunde begleicht eine offene Forderung über 1.200 € per Überweisung.",
      soll: [{ a: "Bank", b: 1200 }], haben: [{ a: "Forderungen", b: 1200 }] },
    { cat: "grundlagen", text: "Der Betrieb kauft Waren für 3.000 € auf Ziel (Rechnung).",
      soll: [{ a: "Waren", b: 3000 }], haben: [{ a: "Verbindlichkeiten", b: 3000 }] },
    { cat: "grundlagen", text: "Die Monatsmiete von 900 € wird per Bank bezahlt.",
      soll: [{ a: "Mietaufwand", b: 900 }], haben: [{ a: "Bank", b: 900 }] },
    { cat: "grundlagen", text: "Waren werden für 1.500 € gegen Barzahlung verkauft.",
      soll: [{ a: "Kasse", b: 1500 }], haben: [{ a: "Umsatzerloese", b: 1500 }] },
    { cat: "grundlagen", text: "Die Löhne in Höhe von 2.000 € werden per Bank überwiesen.",
      soll: [{ a: "Loehne", b: 2000 }], haben: [{ a: "Bank", b: 2000 }] },
    { cat: "grundlagen", text: "Waren werden für 2.400 € auf Ziel verkauft.",
      soll: [{ a: "Forderungen", b: 2400 }], haben: [{ a: "Umsatzerloese", b: 2400 }] },
    { cat: "grundlagen", text: "Eine offene Lieferantenrechnung über 1.000 € wird per Bank beglichen.",
      soll: [{ a: "Verbindlichkeiten", b: 1000 }], haben: [{ a: "Bank", b: 1000 }] },
    { cat: "grundlagen", text: "Der Betrieb zahlt 2.000 € bar auf das Bankkonto ein.",
      soll: [{ a: "Bank", b: 2000 }], haben: [{ a: "Kasse", b: 2000 }] },
    { cat: "grundlagen", text: "Ein Firmenfahrzeug wird für 12.000 € per Banküberweisung gekauft.",
      soll: [{ a: "Fuhrpark", b: 12000 }], haben: [{ a: "Bank", b: 12000 }] },
    { cat: "ust", text: "Wareneinkauf auf Ziel, Netto 1.000 €, zzgl. 19% Umsatzsteuer (190 €).",
      soll: [{ a: "Waren", b: 1000 }, { a: "Vorsteuer", b: 190 }], haben: [{ a: "Verbindlichkeiten", b: 1190 }] },
    { cat: "ust", text: "Warenverkauf auf Ziel, Netto 2.000 €, zzgl. 19% Umsatzsteuer (380 €).",
      soll: [{ a: "Forderungen", b: 2380 }], haben: [{ a: "Umsatzerloese", b: 2000 }, { a: "Umsatzsteuer", b: 380 }] },
    { cat: "ust", text: "Kauf von Bürobedarf gegen bar, Netto 100 €, zzgl. 19% Umsatzsteuer (19 €).",
      soll: [{ a: "Buerobedarf", b: 100 }, { a: "Vorsteuer", b: 19 }], haben: [{ a: "Kasse", b: 119 }] },
    { cat: "ust", text: "Barverkauf von Waren, Netto 500 €, zzgl. 19% Umsatzsteuer (95 €).",
      soll: [{ a: "Kasse", b: 595 }], haben: [{ a: "Umsatzerloese", b: 500 }, { a: "Umsatzsteuer", b: 95 }] }
  ];

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
    // shuffle (Fisher-Yates)
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
  var caseNumEl = document.getElementById("case-num");
  var caseTotalEl = document.getElementById("case-total");
  var scoreEl = document.getElementById("score");
  var streakEl = document.getElementById("streak");
  var feedbackEl = document.getElementById("feedback");
  var checkBtn = document.getElementById("check-btn");
  var nextBtn = document.getElementById("next-btn");
  var bilanzToggle = document.getElementById("toggle-bilanz");
  var bilanzPanel = document.getElementById("bilanz-panel");
  var resetBilanzBtn = document.getElementById("reset-bilanz-btn");
  var statCountEl = document.getElementById("stat-count");

  statCountEl.textContent = cases.length;

  function accountOptionsHtml(selected) {
    var groups = { A: "Aktivkonten", P: "Passivkonten", E: "Aufwandskonten", Er: "Ertragskonten" };
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

  function makeRow(side) {
    var row = document.createElement("div");
    row.className = "posting-row";
    row.innerHTML =
      '<select class="acct-select">' + accountOptionsHtml() + "</select>" +
      '<input type="number" class="amt-input" placeholder="Betrag €" step="1" />';
    return row;
  }

  function addRow(side) {
    var container = side === "soll" ? sollRowsEl : habenRowsEl;
    if (container.children.length >= 2) return;
    container.appendChild(makeRow(side));
  }

  function resetRows() {
    sollRowsEl.innerHTML = "";
    habenRowsEl.innerHTML = "";
    sollRowsEl.appendChild(makeRow("soll"));
    habenRowsEl.appendChild(makeRow("haben"));
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
    caseNumEl.textContent = state.currentIndex + 1;
    caseTotalEl.textContent = state.pool.length;
    resetRows();
    feedbackEl.className = "feedback";
    feedbackEl.textContent = "";
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

  function renderBilanz() {
    var gewinn = state.balances.Umsatzerloese - state.balances.Mietaufwand - state.balances.Loehne - state.balances.Buerobedarf;

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
      if (k === "Eigenkapital") { val += gewinn; label = "Eigenkapital (inkl. Gewinn)"; }
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
      feedbackEl.textContent = "Richtig: " + sollText + " an " + habenText;
      feedbackEl.className = "feedback is-correct";
      applyBooking(c);
      renderBilanz();
      if (!state.attemptedCurrent) { state.score++; state.streak++; }
      scoreEl.textContent = state.score;
      streakEl.textContent = state.streak;
      saveProgress();
      checkBtn.disabled = true;
      nextBtn.disabled = false;
    } else {
      feedbackEl.textContent = "Noch nicht korrekt. Prüfe Konten, Soll/Haben-Seite und Beträge.";
      feedbackEl.className = "feedback is-wrong";
      state.attemptedCurrent = true;
      state.streak = 0;
      streakEl.textContent = state.streak;
      saveProgress();
    }
  }

  document.getElementById("booking-form").addEventListener("submit", handleCheck);

  nextBtn.addEventListener("click", function () {
    state.currentIndex++;
    loadCase();
  });

  document.querySelectorAll(".cat-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".cat-btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.category = btn.dataset.cat;
      state.pool = poolForCategory(state.category);
      state.currentIndex = 0;
      loadCase();
    });
  });

  bilanzToggle.addEventListener("change", function () {
    bilanzPanel.classList.toggle("is-hidden", !bilanzToggle.checked);
  });

  resetBilanzBtn.addEventListener("click", function () {
    state.balances = Object.assign({}, openingBalances);
    renderBilanz();
  });

  // ---- init ----
  loadProgress();
  scoreEl.textContent = state.score;
  streakEl.textContent = state.streak;
  state.pool = poolForCategory(state.category);
  renderBilanz();
  loadCase();
})();

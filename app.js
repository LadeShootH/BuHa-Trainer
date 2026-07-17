(function () {
  "use strict";

  // ---- account master data (nach Großhandelskontenrahmen, GKR) ----
  var accounts = {
    Kasse: { type: "A", label: "1510 Kasse" },
    Bank: { type: "A", label: "1310 Bank" },
    Forderungen: { type: "A", label: "1010 Forderungen a. L+L" },
    Vorsteuer: { type: "A", label: "1400 Vorsteuer" },
    Fuhrpark: { type: "A", label: "0340 Fuhrpark" },
    BGA: { type: "A", label: "0330 Betriebs- u. Geschäftsausstattung" },
    Warenbestand: { type: "A", label: "3910 Warenbestände" },

    Eigenkapital: { type: "P", label: "0610 Eigenkapital" },
    VgK: { type: "P", label: "0820 Verbindl. ggü. Kreditinstituten" },
    Verbindlichkeiten: { type: "P", label: "1710 Verbindlichkeiten a. L+L" },
    Umsatzsteuer: { type: "P", label: "1800 Umsatzsteuer" },
    SonstVerbSt: { type: "P", label: "1910 Sonstige Verbindlichkeiten aus Steuern" },
    SonstVerbSV: { type: "P", label: "1920 Sonstige Verbindlichkeiten der sozialen Sicherheit" },

    Wareneingang: { type: "E", label: "3010 Wareneingang" },
    Warenbezugskosten: { type: "E", label: "3020 Warenbezugskosten" },
    RSL: { type: "E", label: "3050 Rücksendungen an Lieferanten" },
    NLL: { type: "E", label: "3060 Nachlässe von Lieferanten" },
    LSK: { type: "E", label: "3080 Liefererskonti" },
    Gehaelter: { type: "E", label: "4020 Gehälter" },
    Miete: { type: "E", label: "4110 Miete" },
    Werbekosten: { type: "E", label: "4400 Werbe- u. Reisekosten" },
    Buerobedarf: { type: "E", label: "4810 Bürobedarf" },
    KGV: { type: "E", label: "4860 Kosten des Geldverkehrs" },
    Zinsaufwendungen: { type: "E", label: "2100 Zinsaufwendungen" },

    Warenverkauf: { type: "Er", label: "8010 Warenverkauf" },
    RSK: { type: "Er", label: "8050 Rücksendungen von Kunden" },
    NLK: { type: "Er", label: "8060 Nachlässe an Kunden" },
    KSK: { type: "Er", label: "8080 Kundenskonti" },
    SonstigeErtraege: { type: "Er", label: "2460 Sonstige Erträge" },

    GuV: { type: "K", label: "9300 Gewinn- und Verlustkonto" },
    SBK: { type: "K", label: "9400 Schlussbilanzkonto" },
    EBK: { type: "K", label: "9100 Eröffnungsbilanzkonto" }
  };

  var openingBalances = {
    Kasse: 5000, Bank: 20000, Forderungen: 0, Vorsteuer: 0, Fuhrpark: 15000, BGA: 0, Warenbestand: 10000,
    Eigenkapital: 30000, VgK: 20000, Verbindlichkeiten: 0, Umsatzsteuer: 0, SonstVerbSt: 0, SonstVerbSV: 0,
    Wareneingang: 0, Warenbezugskosten: 0, RSL: 0, NLL: 0, LSK: 0,
    Gehaelter: 0, Miete: 0, Werbekosten: 0, Buerobedarf: 0, KGV: 0, Zinsaufwendungen: 0,
    Warenverkauf: 0, RSK: 0, NLK: 0, KSK: 0, SonstigeErtraege: 0
  };

  var AKTIVA_KEYS = ["Kasse", "Bank", "Forderungen", "Vorsteuer", "Fuhrpark", "BGA", "Warenbestand"];
  var PASSIVA_KEYS = ["Eigenkapital", "VgK", "Verbindlichkeiten", "Umsatzsteuer", "SonstVerbSt", "SonstVerbSV"];

  // ---- case pool ----
  // soll / haben are arrays of {a: Kontoschlüssel, b: Betrag} — so ein Fall kann
  // einfach (1:1) oder zusammengesetzt (mehrere Konten je Seite) sein.
  var cases = [
    // -- grundlagen: einfache 1:1-Buchungssätze --
    { cat: "grundlagen", text: "Der Großhandel kauft Waren für 800 € und bezahlt sofort in bar.",
      soll: [{ a: "Wareneingang", b: 800 }], haben: [{ a: "Kasse", b: 800 }] },
    { cat: "grundlagen", text: "Ein Kunde begleicht eine offene Forderung über 1.200 € per Überweisung.",
      soll: [{ a: "Bank", b: 1200 }], haben: [{ a: "Forderungen", b: 1200 }] },
    { cat: "grundlagen", text: "Der Großhandel kauft Waren für 3.000 € auf Ziel.",
      soll: [{ a: "Wareneingang", b: 3000 }], haben: [{ a: "Verbindlichkeiten", b: 3000 }] },
    { cat: "grundlagen", text: "Die Monatsmiete von 900 € wird per Bank bezahlt.",
      soll: [{ a: "Miete", b: 900 }], haben: [{ a: "Bank", b: 900 }] },
    { cat: "grundlagen", text: "Waren werden für 1.500 € gegen Barzahlung verkauft.",
      soll: [{ a: "Kasse", b: 1500 }], haben: [{ a: "Warenverkauf", b: 1500 }] },
    { cat: "grundlagen", text: "Die Gehälter in Höhe von 2.000 € werden per Bank überwiesen.",
      soll: [{ a: "Gehaelter", b: 2000 }], haben: [{ a: "Bank", b: 2000 }] },
    { cat: "grundlagen", text: "Waren werden für 2.400 € auf Ziel verkauft.",
      soll: [{ a: "Forderungen", b: 2400 }], haben: [{ a: "Warenverkauf", b: 2400 }] },
    { cat: "grundlagen", text: "Eine offene Lieferantenrechnung über 1.000 € wird per Bank beglichen.",
      soll: [{ a: "Verbindlichkeiten", b: 1000 }], haben: [{ a: "Bank", b: 1000 }] },
    { cat: "grundlagen", text: "Der Großhandel zahlt 2.000 € bar auf das Bankkonto ein.",
      soll: [{ a: "Bank", b: 2000 }], haben: [{ a: "Kasse", b: 2000 }] },
    { cat: "grundlagen", text: "Für eine Wareneinlieferung fallen Frachtkosten (Warenbezugskosten) von 150 € an, die bar bezahlt werden.",
      soll: [{ a: "Warenbezugskosten", b: 150 }], haben: [{ a: "Kasse", b: 150 }] },

    // -- mit umsatzsteuer: zusammengesetzte Buchungssätze mit Vorsteuer/USt --
    { cat: "ust", text: "Wareneinkauf auf Ziel, Netto 1.000 €, zzgl. 19 % Umsatzsteuer (190 €).",
      soll: [{ a: "Wareneingang", b: 1000 }, { a: "Vorsteuer", b: 190 }], haben: [{ a: "Verbindlichkeiten", b: 1190 }] },
    { cat: "ust", text: "Warenverkauf auf Ziel, Netto 2.000 €, zzgl. 19 % Umsatzsteuer (380 €).",
      soll: [{ a: "Forderungen", b: 2380 }], haben: [{ a: "Warenverkauf", b: 2000 }, { a: "Umsatzsteuer", b: 380 }] },
    { cat: "ust", text: "Kauf von Bürobedarf gegen bar, Netto 100 €, zzgl. 19 % Umsatzsteuer (19 €).",
      soll: [{ a: "Buerobedarf", b: 100 }, { a: "Vorsteuer", b: 19 }], haben: [{ a: "Kasse", b: 119 }] },
    { cat: "ust", text: "Barverkauf von Waren, Netto 500 €, zzgl. 19 % Umsatzsteuer (95 €).",
      soll: [{ a: "Kasse", b: 595 }], haben: [{ a: "Warenverkauf", b: 500 }, { a: "Umsatzsteuer", b: 95 }] },
    { cat: "ust", text: "Ein Firmenfahrzeug wird auf Ziel gekauft, Netto 10.000 €, zzgl. 19 % Umsatzsteuer (1.900 €).",
      soll: [{ a: "Fuhrpark", b: 10000 }, { a: "Vorsteuer", b: 1900 }], haben: [{ a: "Verbindlichkeiten", b: 11900 }] },
    { cat: "ust", text: "Werbekosten werden per Bank bezahlt, Netto 300 €, zzgl. 19 % Umsatzsteuer (57 €).",
      soll: [{ a: "Werbekosten", b: 300 }, { a: "Vorsteuer", b: 57 }], haben: [{ a: "Bank", b: 357 }] },

    // -- schwer: Rücksendungen, Nachlässe, Skonto, zusammengesetzte Fälle mit mehreren Konten --
    { cat: "schwer", text: "Der Großhandel schickt mangelhafte Ware im Wert von netto 300 € (zzgl. 19 % USt, 57 €) an den Lieferanten zurück; ursprünglich auf Ziel gekauft.",
      soll: [{ a: "Verbindlichkeiten", b: 357 }], haben: [{ a: "RSL", b: 300 }, { a: "Vorsteuer", b: 57 }] },
    { cat: "schwer", text: "Wegen einer Mängelrüge gewährt ein Lieferant nachträglich einen Nachlass von netto 200 € (zzgl. 19 % USt, 38 €) auf eine offene Rechnung.",
      soll: [{ a: "Verbindlichkeiten", b: 238 }], haben: [{ a: "NLL", b: 200 }, { a: "Vorsteuer", b: 38 }] },
    { cat: "schwer", text: "Ein Kunde schickt Ware im Wert von netto 400 € (zzgl. 19 % USt, 76 €) zurück; ursprünglich auf Ziel verkauft.",
      soll: [{ a: "RSK", b: 400 }, { a: "Umsatzsteuer", b: 76 }], haben: [{ a: "Forderungen", b: 476 }] },
    { cat: "schwer", text: "Wegen einer Mängelrüge gewährt der Großhandel einem Kunden nachträglich einen Nachlass von netto 200 € (zzgl. 19 % USt, 38 €).",
      soll: [{ a: "NLK", b: 200 }, { a: "Umsatzsteuer", b: 38 }], haben: [{ a: "Forderungen", b: 238 }] },
    { cat: "schwer", text: "Eine Verbindlichkeit über 1.000 € wird innerhalb der Skontofrist beglichen: 2 % Skonto (20 €) werden abgezogen, der Restbetrag von 980 € per Bank überwiesen.",
      soll: [{ a: "Verbindlichkeiten", b: 1000 }], haben: [{ a: "Bank", b: 980 }, { a: "LSK", b: 20 }] },
    { cat: "schwer", text: "Ein Kunde begleicht eine Forderung von 2.000 € abzüglich 3 % Kundenskonto (60 €); der Restbetrag von 1.940 € geht per Bank ein.",
      soll: [{ a: "Bank", b: 1940 }, { a: "KSK", b: 60 }], haben: [{ a: "Forderungen", b: 2000 }] },
    { cat: "schwer", text: "Neue Büroausstattung wird auf Ziel gekauft, Netto 1.500 €, zzgl. 19 % Umsatzsteuer (285 €).",
      soll: [{ a: "BGA", b: 1500 }, { a: "Vorsteuer", b: 285 }], haben: [{ a: "Verbindlichkeiten", b: 1785 }] },
    { cat: "schwer", text: "Für ein Darlehen wird per Bank eine Rate von 1.000 € gezahlt: 800 € Tilgung und 200 € Zinsen.",
      soll: [{ a: "VgK", b: 800 }, { a: "Zinsaufwendungen", b: 200 }], haben: [{ a: "Bank", b: 1000 }] },

    // -- realistisch: Fälle mit Kontext, wie sie in echten Belegen vorkommen (mit Angaben, die selbst berechnet werden müssen) --
    { cat: "realistisch", text: "Eingangsrechnung eines Lieferanten (Rechnungs-Nr. 24-3391) über Waren im Wert von netto 2.400 €, zuzüglich der gesetzlichen Umsatzsteuer von 19 %. Zahlungsziel: 30 Tage.",
      soll: [{ a: "Wareneingang", b: 2400 }, { a: "Vorsteuer", b: 456 }], haben: [{ a: "Verbindlichkeiten", b: 2856 }] },
    { cat: "realistisch", text: "Für eine Mitarbeiterin fällt ein Bruttogehalt von 3.200 € an. Einbehalten werden 200 € Lohnsteuer und 400 € Sozialversicherungsbeiträge, die an das Finanzamt bzw. die Sozialversicherungsträger abgeführt werden. Der Restbetrag wird per Bank ausgezahlt.",
      soll: [{ a: "Gehaelter", b: 3200 }], haben: [{ a: "Bank", b: 2600 }, { a: "SonstVerbSt", b: 200 }, { a: "SonstVerbSV", b: 400 }] },
    { cat: "realistisch", text: "Eine Sammelrechnung eines Lieferanten enthält sowohl den Warenwert (netto 1.800 €) als auch separat ausgewiesene Frachtkosten (netto 100 €); beide Positionen zusammen zzgl. 19 % Umsatzsteuer. Bezahlung per Überweisung nach Wareneingang.",
      soll: [{ a: "Wareneingang", b: 1800 }, { a: "Warenbezugskosten", b: 100 }, { a: "Vorsteuer", b: 361 }], haben: [{ a: "Bank", b: 2261 }] },
    { cat: "realistisch", text: "Die Bank belastet das Geschäftskonto mit den vierteljährlichen Kontoführungsgebühren von netto 100 €, zzgl. 19 % Umsatzsteuer, direkt per Lastschrift.",
      soll: [{ a: "KGV", b: 100 }, { a: "Vorsteuer", b: 19 }], haben: [{ a: "Bank", b: 119 }] },
    { cat: "realistisch", text: "Ein Großkunde bestellt Waren im regulären Wert von netto 4.000 €. Wegen der Bestellmenge gewährt der Großhandel einen Rabatt von 10 % direkt auf der Rechnung; in Rechnung gestellt werden daher netto 3.600 € zzgl. 19 % Umsatzsteuer. Verkauf auf Ziel.",
      soll: [{ a: "Forderungen", b: 4284 }], haben: [{ a: "Warenverkauf", b: 3600 }, { a: "Umsatzsteuer", b: 684 }] },
    { cat: "realistisch", text: "Ein Kunde begleicht eine überfällige Rechnung über 1.200 € per Überweisung. Da die Zahlung verspätet erfolgt, berechnet der Großhandel zusätzlich eine Mahngebühr von 15 €, die der Kunde im selben Überweisungsbetrag mitüberweist.",
      soll: [{ a: "Bank", b: 1215 }], haben: [{ a: "Forderungen", b: 1200 }, { a: "SonstigeErtraege", b: 15 }] }
  ];

  // ---- Abschluss-Szenario: fester Jahresabschluss + Neueröffnung ----
  var abschlussSzenario = {
    aktiva: [
      { a: "Kasse", b: 3200 },
      { a: "Bank", b: 21500 },
      { a: "Forderungen", b: 6300 },
      { a: "Vorsteuer", b: 1100 },
      { a: "Fuhrpark", b: 15000 },
      { a: "Warenbestand", b: 12000 }
    ],
    passiva: [
      { a: "Eigenkapital", b: 30000 },
      { a: "Verbindlichkeiten", b: 4100 },
      { a: "VgK", b: 18000 },
      { a: "Umsatzsteuer", b: 4000 }
    ],
    aufwand: [
      { a: "Wareneingang", b: 25000 },
      { a: "Miete", b: 6000 },
      { a: "Gehaelter", b: 12000 }
    ],
    ertrag: [
      { a: "Warenverkauf", b: 46000 }
    ]
  };

  var PHASE_NAMES = {
    1: "Erfolgskonten abschließen",
    2: "Gewinn/Verlust verbuchen",
    3: "Bestandskonten abschließen (SBK)",
    4: "Neues Jahr eröffnen (EBK)"
  };

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

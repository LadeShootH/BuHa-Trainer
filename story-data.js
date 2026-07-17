// ============================================================
// BuHaSim — Story-Modus: Daten
// ------------------------------------------------------------
// Eine feste, chronologische Abfolge von Geschäftsfällen für eine
// fiktive Firma (Meyer Großhandel GmbH), erzählt als kleine
// Geschichte statt als Zufallspool. Nutzt dieselben Konten wie
// cases.js (dort per <script> vor dieser Datei geladen).
//
// Jeder Schritt:
//   {
//     chapter: "Kapitel-Titel",
//     date: "Datum-Flavour-Text",
//     narrative: "Erzähltext vor der Aufgabe",
//     task: "Die eigentliche Buchungsaufgabe",
//     soll / haben: wie in cases.js,
//     reaction: optional — { type: "always"|"threshold", text,
//                             account, op, value }
//       "always": Text wird nach richtiger Buchung immer gezeigt.
//       "threshold": Text wird gezeigt, wenn balances[account] den
//                     Vergleich (op) gegen value erfüllt.
//   }
// ============================================================

var storySteps = [
  // -- Kapitel 1: Gründung --
  {
    chapter: "Gründung",
    date: "3. Januar",
    narrative: "Herr Meyer eröffnet die Meyer Großhandel GmbH. Als Startkapital legt er 40.000 € aus privaten Mitteln auf das neue Geschäftskonto ein.",
    task: "Buche die Kapitaleinlage von 40.000 € auf das Bankkonto.",
    soll: [{ a: "Bank", b: 40000 }], haben: [{ a: "Eigenkapital", b: 40000 }],
    reaction: { type: "always", text: "Glückwunsch zur Gründung! Auf dem Geschäftskonto liegen jetzt 40.000 € Startkapital." }
  },
  {
    chapter: "Gründung",
    date: "5. Januar",
    narrative: "Damit auch für die ersten größeren Anschaffungen genug Geld da ist, nimmt die GmbH zusätzlich ein Bankdarlehen über 20.000 € auf.",
    task: "Buche die Gutschrift des Bankdarlehens über 20.000 €.",
    soll: [{ a: "Bank", b: 20000 }], haben: [{ a: "VgK", b: 20000 }]
  },
  {
    chapter: "Gründung",
    date: "8. Januar",
    narrative: "Für die Auslieferungen an Kunden wird ein gebrauchter Transporter benötigt. Er kostet 12.000 € und wird per Überweisung bezahlt.",
    task: "Buche den Kauf des Transporters für 12.000 € per Überweisung.",
    soll: [{ a: "Fuhrpark", b: 12000 }], haben: [{ a: "Bank", b: 12000 }],
    reaction: { type: "threshold", account: "Bank", op: "<", value: 50000, text: "Die erste größere Investition ist raus — auf der Bank sieht man das schon deutlich." }
  },

  // -- Kapitel 2: Erste Geschäfte --
  {
    chapter: "Erste Geschäfte",
    date: "15. Januar",
    narrative: "Die erste große Warenlieferung trifft ein: Waren im Wert von netto 8.000 €, zuzüglich 19 % Umsatzsteuer (1.520 €), auf Ziel gekauft.",
    task: "Buche den Wareneinkauf auf Ziel: netto 8.000 €, Vorsteuer 1.520 €.",
    soll: [{ a: "Wareneingang", b: 8000 }, { a: "Vorsteuer", b: 1520 }], haben: [{ a: "Verbindlichkeiten", b: 9520 }]
  },
  {
    chapter: "Erste Geschäfte",
    date: "1. Februar",
    narrative: "Die erste Monatsmiete für das kleine Lager wird fällig: 1.200 €, per Überweisung.",
    task: "Buche die Mietzahlung von 1.200 € per Bank.",
    soll: [{ a: "Miete", b: 1200 }], haben: [{ a: "Bank", b: 1200 }]
  },
  {
    chapter: "Erste Geschäfte",
    date: "1. Februar",
    narrative: "Auch die Gehälter für die ersten beiden Mitarbeiter müssen überwiesen werden: 3.500 € insgesamt.",
    task: "Buche die Gehaltszahlung von 3.500 € per Bank.",
    soll: [{ a: "Gehaelter", b: 3500 }], haben: [{ a: "Bank", b: 3500 }]
  },
  {
    chapter: "Erste Geschäfte",
    date: "5. März",
    narrative: "Die Rechnung des Lieferanten aus Januar (9.520 €) wird fällig und pünktlich per Überweisung beglichen.",
    task: "Buche die Bezahlung der Lieferantenrechnung über 9.520 € per Bank.",
    soll: [{ a: "Verbindlichkeiten", b: 9520 }], haben: [{ a: "Bank", b: 9520 }]
  },
  {
    chapter: "Erste Geschäfte",
    date: "20. März",
    narrative: "Der erste große Kundenauftrag: Ein Großkunde bestellt Waren im Wert von netto 7.000 €, zuzüglich 19 % Umsatzsteuer (1.330 €), auf Ziel.",
    task: "Buche den Warenverkauf auf Ziel: netto 7.000 €, Umsatzsteuer 1.330 €.",
    soll: [{ a: "Forderungen", b: 8330 }], haben: [{ a: "Warenverkauf", b: 7000 }, { a: "Umsatzsteuer", b: 1330 }]
  },
  {
    chapter: "Erste Geschäfte",
    date: "2. April",
    narrative: "Der Kunde zahlt seine Rechnung vollständig und pünktlich per Überweisung: 8.330 €.",
    task: "Buche den Zahlungseingang von 8.330 € per Bank.",
    soll: [{ a: "Bank", b: 8330 }], haben: [{ a: "Forderungen", b: 8330 }],
    reaction: { type: "always", text: "Der erste große Zahlungseingang! Die Bank füllt sich wieder." }
  },

  // -- Kapitel 3: Wachstum --
  {
    chapter: "Wachstum",
    date: "18. Juni",
    narrative: "Um kurzfristig Bargeld in der Kasse zu haben, verkauft die GmbH Waren im Wert von netto 11.000 €, zuzüglich 19 % Umsatzsteuer (2.090 €), gegen sofortige Barzahlung.",
    task: "Buche den Barverkauf: netto 11.000 €, Umsatzsteuer 2.090 €, gegen bar.",
    soll: [{ a: "Kasse", b: 13090 }], haben: [{ a: "Warenverkauf", b: 11000 }, { a: "Umsatzsteuer", b: 2090 }],
    reaction: { type: "threshold", account: "Kasse", op: ">", value: 10000, text: "Die Kasse ist auf einmal gut gefüllt — nicht schlecht für einen spontanen Barverkauf." }
  },
  {
    chapter: "Wachstum",
    date: "1. September",
    narrative: "Auch im zweiten Halbjahr müssen die Gehälter weiterlaufen: erneut 3.500 € per Überweisung.",
    task: "Buche die Gehaltszahlung von 3.500 € per Bank.",
    soll: [{ a: "Gehaelter", b: 3500 }], haben: [{ a: "Bank", b: 3500 }]
  },
  {
    chapter: "Wachstum",
    date: "15. November",
    narrative: "Die erste Rate für das Bankdarlehen wird fällig: 2.000 € per Überweisung, davon 1.600 € Tilgung und 400 € Zinsen.",
    task: "Buche die Darlehensrate: 1.600 € Tilgung, 400 € Zinsen, per Bank.",
    soll: [{ a: "VgK", b: 1600 }, { a: "Zinsaufwendungen", b: 400 }], haben: [{ a: "Bank", b: 2000 }],
    reaction: { type: "always", text: "Die erste Darlehensrate ist getilgt — Schritt für Schritt wird die Schuld kleiner." }
  },

  // -- Kapitel 4: Jahresabschluss (verkürzt: nur die tatsächlich bebuchten Konten) --
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Das erste Geschäftsjahr ist vorbei. Bevor die Bücher geschlossen werden, müssen alle Erfolgskonten auf das GuV-Konto übertragen werden — angefangen beim Wareneingang.",
    task: "Schließe das Konto 3010 Wareneingang ab (Saldo 8.000 € im Soll).",
    soll: [{ a: "GuV", b: 8000 }], haben: [{ a: "Wareneingang", b: 8000 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Weiter geht's mit der Miete.",
    task: "Schließe das Konto 4110 Miete ab (Saldo 1.200 € im Soll).",
    soll: [{ a: "GuV", b: 1200 }], haben: [{ a: "Miete", b: 1200 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Auch die Gehälter des ganzen Jahres (zweimal 3.500 €) müssen auf das GuV-Konto.",
    task: "Schließe das Konto 4020 Gehälter ab (Saldo 7.000 € im Soll).",
    soll: [{ a: "GuV", b: 7000 }], haben: [{ a: "Gehaelter", b: 7000 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Die Zinsen aus der Darlehensrate gehören ebenfalls dazu.",
    task: "Schließe das Konto 2100 Zinsaufwendungen ab (Saldo 400 € im Soll).",
    soll: [{ a: "GuV", b: 400 }], haben: [{ a: "Zinsaufwendungen", b: 400 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Jetzt das einzige Ertragskonto: der Warenverkauf, mit einem Jahresumsatz von 18.000 € (netto).",
    task: "Schließe das Konto 8010 Warenverkauf ab (Saldo 18.000 € im Haben).",
    soll: [{ a: "Warenverkauf", b: 18000 }], haben: [{ a: "GuV", b: 18000 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Das GuV-Konto zeigt jetzt einen Überschuss von 1.400 € — die GmbH hat im ersten Jahr Gewinn gemacht! Dieser Gewinn wird auf das Eigenkapital übertragen.",
    task: "Übertrage den Gewinn von 1.400 € vom GuV-Konto auf das Eigenkapital.",
    soll: [{ a: "GuV", b: 1400 }], haben: [{ a: "Eigenkapital", b: 1400 }],
    reaction: { type: "always", text: "Die Firma schreibt im ersten Jahr schwarze Zahlen — ein guter Start!" }
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Jetzt werden noch die Bestandskonten über das Schlussbilanzkonto (SBK) geschlossen — angefangen mit der Kasse.",
    task: "Schließe das Konto 1510 Kasse ab (Saldo 13.090 € im Soll).",
    soll: [{ a: "SBK", b: 13090 }], haben: [{ a: "Kasse", b: 13090 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Weiter mit dem Bankkonto.",
    task: "Schließe das Konto 1310 Bank ab (Saldo 36.610 € im Soll).",
    soll: [{ a: "SBK", b: 36610 }], haben: [{ a: "Bank", b: 36610 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Auch die Vorsteuer aus dem Wareneinkauf gehört zu den Bestandskonten.",
    task: "Schließe das Konto 1400 Vorsteuer ab (Saldo 1.520 € im Soll).",
    soll: [{ a: "SBK", b: 1520 }], haben: [{ a: "Vorsteuer", b: 1520 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Und der Transporter, der das Jahr über treu seinen Dienst getan hat.",
    task: "Schließe das Konto 0340 Fuhrpark ab (Saldo 12.000 € im Soll).",
    soll: [{ a: "SBK", b: 12000 }], haben: [{ a: "Fuhrpark", b: 12000 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Jetzt die Passivseite: das Eigenkapital, inklusive des gerade übertragenen Jahresgewinns.",
    task: "Schließe das Konto 0610 Eigenkapital ab (Saldo 41.400 € im Haben).",
    soll: [{ a: "Eigenkapital", b: 41400 }], haben: [{ a: "SBK", b: 41400 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Auch das restliche Bankdarlehen steht noch offen.",
    task: "Schließe das Konto 0820 Verbindl. ggü. Kreditinstituten ab (Saldo 18.400 € im Haben).",
    soll: [{ a: "VgK", b: 18400 }], haben: [{ a: "SBK", b: 18400 }]
  },
  {
    chapter: "Jahresabschluss",
    date: "31. Dezember",
    narrative: "Und zuletzt die Umsatzsteuer, die die GmbH im nächsten Jahr ans Finanzamt abführen muss.",
    task: "Schließe das Konto 1800 Umsatzsteuer ab (Saldo 3.420 € im Haben).",
    soll: [{ a: "Umsatzsteuer", b: 3420 }], haben: [{ a: "SBK", b: 3420 }],
    reaction: { type: "always", text: "🎉 Geschafft! Das erste Geschäftsjahr der Meyer Großhandel GmbH ist offiziell abgeschlossen — mit einem Gewinn von 1.400 €." }
  }
];

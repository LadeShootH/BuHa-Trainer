// ============================================================
// BuHaSim — Übungsdaten
// ------------------------------------------------------------
// Diese Datei enthält NUR Daten (Konten, Eröffnungsbilanz,
// Übungsfälle, Abschluss-Szenario) — keine Anwendungslogik.
// Neue Übungsfälle einfach unten im `cases`-Array unter der
// passenden Kategorie ergänzen:
//   grundlagen | ust | schwer | realistisch
// (Der Modus "gemischt" zieht automatisch aus allen vier Töpfen,
// der Modus "abschluss" nutzt stattdessen das feste Szenario
// weiter unten und braucht keine neuen `cases`-Einträge.)
//
// Format eines Falls:
//   { cat: "grundlagen", text: "Beschreibung …",
//     soll:  [{ a: "Kontoschlüssel", b: Betrag }],
//     haben: [{ a: "Kontoschlüssel", b: Betrag }] }
// `a` muss ein Schlüssel aus dem `accounts`-Objekt unten sein.
// Mehrzeilige Buchungssätze: einfach weitere {a, b}-Objekte in
// das soll[]- bzw. haben[]-Array einfügen (max. 3 pro Seite).
// ============================================================

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
  { cat: "schwer", text: "Eine Verbindlichkeit über 2.500 € wird innerhalb der Skontofrist beglichen: 3 % Skonto (75 €) werden abgezogen, der Restbetrag von 2.425 € wird per Bank überwiesen.",
    soll: [{ a: "Verbindlichkeiten", b: 2500 }], haben: [{ a: "Bank", b: 2425 }, { a: "LSK", b: 75 }] },
  { cat: "schwer", text: "Ein Kunde begleicht eine Forderung von 1.500 € abzüglich 2 % Kundenskonto (30 €); der Restbetrag von 1.470 € geht per Bank ein.",
    soll: [{ a: "Bank", b: 1470 }, { a: "KSK", b: 30 }], haben: [{ a: "Forderungen", b: 1500 }] },

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
    soll: [{ a: "Bank", b: 1215 }], haben: [{ a: "Forderungen", b: 1200 }, { a: "SonstigeErtraege", b: 15 }] },
  { cat: "realistisch", text: "Eine Verbindlichkeit über 3.570 € (brutto, ursprünglich netto 3.000 € zzgl. 19 % Umsatzsteuer) wird innerhalb der Skontofrist beglichen. Der Lieferant gewährt Skonto in Höhe von netto 100 € zzgl. anteiliger Vorsteuerkorrektur von 19 €; der Restbetrag von 3.451 € wird per Bank überwiesen.",
    soll: [{ a: "Verbindlichkeiten", b: 3570 }], haben: [{ a: "Bank", b: 3451 }, { a: "LSK", b: 100 }, { a: "Vorsteuer", b: 19 }] },
  { cat: "realistisch", text: "Ein Kunde begleicht eine Forderung über 4.760 € (brutto, ursprünglich netto 4.000 € zzgl. 19 % Umsatzsteuer). Es wird ein Kundenskonto von netto 200 € zzgl. anteiliger Umsatzsteuerkorrektur von 38 € gewährt; der Restbetrag von 4.522 € geht per Bank ein.",
    soll: [{ a: "Bank", b: 4522 }, { a: "KSK", b: 200 }, { a: "Umsatzsteuer", b: 38 }], haben: [{ a: "Forderungen", b: 4760 }] }
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

// BuHaSim: Skontorechnung-Daten (reine Zahlen, keine Anwendungslogik).
//
// Vier Aufgabentypen (cat):
//   "abziehen"    Einkauf, reine Rechnung: Zahlbetrag nach Skontoabzug berechnen.
//   "aufschlagen" Verkauf: Rechnungsbetrag so hochrechnen, dass nach Skontoabzug
//                 durch den Kunden ein gewünschter Zielbetrag übrig bleibt.
//   "nutzen"      Einkauf, Kreditvergleich: Effektiven Jahreszins des Skontos
//                 berechnen und mit dem Dispo-/Kontokorrentzins vergleichen,
//                 um zu entscheiden, ob Skonto per Kredit finanziert werden soll.
//   "gewaehren"   Verkauf, Entscheidung: Effektiven Jahreszins der Skontogewährung
//                 berechnen und mit dem eigenen Kontokorrentzins vergleichen, um
//                 zu entscheiden, ob Kundenskonto angeboten werden soll.
//
// Felder je nach cat:
//   abziehen:    { brutto, skontoPct }
//   aufschlagen: { ziel, skontoPct }
//   nutzen:      { skontoPct, skontoTage, zielTage, dispoZins }
//   gewaehren:   { skontoPct, skontoTage, zielTage, kontokorrentZins }

var skontoTasks = [

  // -- Einkauf: Skonto abziehen (reine Rechnung) --
  { cat: "abziehen", text: "Eine Lieferantenrechnung über 2.000 € brutto wird innerhalb der Skontofrist beglichen. Der Lieferant gewährt 2 % Skonto. Wie hoch ist der zu überweisende Zahlbetrag?",
    brutto: 2000, skontoPct: 2 },
  { cat: "abziehen", text: "Eine Eingangsrechnung über 3.500 € brutto berechtigt bei Zahlung innerhalb von 10 Tagen zu 3 % Skonto. Der Großhandel zahlt fristgerecht per Bank. Wie hoch ist der Zahlbetrag?",
    brutto: 3500, skontoPct: 3 },
  { cat: "abziehen", text: "Ein Lieferant stellt 1.250 € brutto in Rechnung und räumt 2 % Skonto bei Zahlung innerhalb von 14 Tagen ein. Die Zahlung erfolgt fristgerecht. Wie hoch ist der Zahlbetrag?",
    brutto: 1250, skontoPct: 2 },
  { cat: "abziehen", text: "Eine Rechnung über 4.800 € brutto wird mit 1,5 % Skonto beglichen, da die Zahlung innerhalb der Skontofrist erfolgt. Wie hoch ist der Zahlbetrag?",
    brutto: 4800, skontoPct: 1.5 },
  { cat: "abziehen", text: "Ein Lieferant gewährt bei einer Rechnung über 960 € brutto 2,5 % Skonto für Zahlung innerhalb von 8 Tagen. Der Großhandel zahlt fristgerecht. Wie hoch ist der Zahlbetrag?",
    brutto: 960, skontoPct: 2.5 },
  { cat: "abziehen", text: "Eine Sammelrechnung über 6.200 € brutto wird innerhalb der Skontofrist beglichen. Vereinbart sind 2 % Skonto. Wie hoch ist der Zahlbetrag?",
    brutto: 6200, skontoPct: 2 },

  // -- Verkauf: Skonto obendrauf rechnen (Rechnungsbetrag hochrechnen) --
  { cat: "aufschlagen", text: "Der Großhandel möchte nach Abzug von 2 % Kundenskonto netto 2.450 € auf dem Geschäftskonto haben. Welchen Rechnungsbetrag muss er dem Kunden in Rechnung stellen, damit nach Skontoabzug genau dieser Betrag übrig bleibt?",
    ziel: 2450, skontoPct: 2 },
  { cat: "aufschlagen", text: "Nach Abzug von 3 % Skonto soll ein Kunde noch 970 € überweisen. Welcher Rechnungsbetrag muss ausgewiesen werden?",
    ziel: 970, skontoPct: 3 },
  { cat: "aufschlagen", text: "Ein Kunde zieht üblicherweise 2 % Skonto. Damit nach Abzug 1.176 € beim Großhandel ankommen, wie hoch muss der Rechnungsbetrag sein?",
    ziel: 1176, skontoPct: 2 },
  { cat: "aufschlagen", text: "Nach 1,5 % Kundenskonto sollen 2.955 € übrig bleiben. Auf welchen Betrag muss die Rechnung lauten?",
    ziel: 2955, skontoPct: 1.5 },
  { cat: "aufschlagen", text: "Der Großhandel kalkuliert mit 3 % Kundenskonto und möchte nach Abzug 1.940 € erhalten. Wie hoch muss der Rechnungsbetrag sein?",
    ziel: 1940, skontoPct: 3 },
  { cat: "aufschlagen", text: "Bei 2,5 % Skonto sollen nach Abzug 1.950 € beim Großhandel eingehen. Welcher Betrag muss in Rechnung gestellt werden?",
    ziel: 1950, skontoPct: 2.5 },

  // -- Einkauf: Skonto nutzen? (Kreditvergleich Skontozins vs. Dispo/Kontokorrentzins) --
  { cat: "nutzen", text: "Ein Lieferant bietet 2 % Skonto bei Zahlung innerhalb von 10 Tagen, das Zahlungsziel beträgt sonst 30 Tage. Der Großhandel müsste den Betrag über den Dispokredit zu 12 % Zinsen p.a. vorfinanzieren, um die Skontofrist einzuhalten. Lohnt es sich, das Skonto per Dispokredit zu finanzieren, statt bis zum Zahlungsziel zu warten?",
    skontoPct: 2, skontoTage: 10, zielTage: 30, dispoZins: 12 },
  { cat: "nutzen", text: "Ein Lieferant räumt 1 % Skonto bei Zahlung innerhalb von 10 Tagen ein, das reguläre Zahlungsziel liegt bei 60 Tagen. Ein Dispokredit würde 10 % Zinsen p.a. kosten. Sollte der Großhandel das Skonto per Dispokredit nutzen?",
    skontoPct: 1, skontoTage: 10, zielTage: 60, dispoZins: 10 },
  { cat: "nutzen", text: "Bei Zahlung innerhalb von 14 Tagen gewährt ein Lieferant 3 % Skonto, das Zahlungsziel beträgt 30 Tage. Der Dispokredit kostet 15 % Zinsen p.a. Lohnt sich die Finanzierung über den Dispo, um das Skonto zu ziehen?",
    skontoPct: 3, skontoTage: 14, zielTage: 30, dispoZins: 15 },
  { cat: "nutzen", text: "Ein Lieferant bietet 1,5 % Skonto bei Zahlung innerhalb von 10 Tagen, das Zahlungsziel beträgt 45 Tage. Der Dispokredit des Großhandels kostet 12 % Zinsen p.a. Sollte das Skonto per Dispokredit finanziert werden?",
    skontoPct: 1.5, skontoTage: 10, zielTage: 45, dispoZins: 12 },
  { cat: "nutzen", text: "Ein Lieferant gewährt 2 % Skonto bei Zahlung innerhalb von 7 Tagen, das Zahlungsziel liegt bei 60 Tagen. Der Dispokredit kostet 14 % Zinsen p.a. Lohnt es sich, das Skonto per Dispo zu finanzieren?",
    skontoPct: 2, skontoTage: 7, zielTage: 60, dispoZins: 14 },
  { cat: "nutzen", text: "Bei Zahlung innerhalb von 10 Tagen gewährt ein Lieferant 1 % Skonto, das Zahlungsziel beträgt 90 Tage. Ein Dispokredit würde 9 % Zinsen p.a. kosten. Sollte das Skonto per Dispo genutzt werden?",
    skontoPct: 1, skontoTage: 10, zielTage: 90, dispoZins: 9 },

  // -- Verkauf: Skonto gewähren? (Entscheidung anhand des eigenen Kontokorrentzinses) --
  { cat: "gewaehren", text: "Der Großhandel überlegt, Kunden 2 % Skonto bei Zahlung innerhalb von 10 Tagen anzubieten, statt des üblichen Zahlungsziels von 30 Tagen. Der eigene Kontokorrentkredit kostet 12 % Zinsen p.a. Lohnt es sich, dieses Skonto zu gewähren?",
    skontoPct: 2, skontoTage: 10, zielTage: 30, kontokorrentZins: 12 },
  { cat: "gewaehren", text: "Der Großhandel plant, 1 % Skonto bei Zahlung innerhalb von 10 Tagen zu gewähren, das Zahlungsziel liegt sonst bei 60 Tagen. Der eigene Kontokorrentkredit kostet 10 % Zinsen p.a. Sollte das Skonto angeboten werden?",
    skontoPct: 1, skontoTage: 10, zielTage: 60, kontokorrentZins: 10 },
  { cat: "gewaehren", text: "Ein Kundenskonto von 1,5 % bei Zahlung innerhalb von 10 Tagen ist im Gespräch, das Zahlungsziel beträgt 45 Tage. Der Kontokorrentkredit des Großhandels kostet 16 % Zinsen p.a. Lohnt sich das Angebot?",
    skontoPct: 1.5, skontoTage: 10, zielTage: 45, kontokorrentZins: 16 },
  { cat: "gewaehren", text: "Der Großhandel erwägt 2 % Skonto bei Zahlung innerhalb von 7 Tagen, das Zahlungsziel liegt bei 60 Tagen. Der eigene Kontokorrentkredit kostet 10 % Zinsen p.a. Sollte das Skonto gewährt werden?",
    skontoPct: 2, skontoTage: 7, zielTage: 60, kontokorrentZins: 10 },
  { cat: "gewaehren", text: "Ein Kundenskonto von 1 % bei Zahlung innerhalb von 10 Tagen steht zur Debatte, das Zahlungsziel beträgt 90 Tage. Der Kontokorrentkredit kostet 6 % Zinsen p.a. Lohnt sich das Angebot?",
    skontoPct: 1, skontoTage: 10, zielTage: 90, kontokorrentZins: 6 },
  { cat: "gewaehren", text: "Der Großhandel überlegt, 3 % Skonto bei Zahlung innerhalb von 14 Tagen anzubieten, das Zahlungsziel liegt bei 30 Tagen. Der eigene Kontokorrentkredit kostet 50 % Zinsen p.a. Lohnt sich dieses Angebot?",
    skontoPct: 3, skontoTage: 14, zielTage: 30, kontokorrentZins: 50 }
];

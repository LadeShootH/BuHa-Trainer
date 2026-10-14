// BuHaSim: Abschreibungen-Daten (reine Zahlen, keine Anwendungslogik).
//
// Fünf Aufgabentypen (cat):
//   "linear"       Jährlichen linearen AfA-Betrag berechnen: AK ÷ Nutzungsdauer.
//   "zeitanteilig" Lineare AfA im Anschaffungsjahr, monatsgenau (Anschaffungsmonat
//                  zählt voll mit): AK ÷ ND × Monate ÷ 12.
//   "restbuchwert" Restbuchwert (Buchwert) nach einer Anzahl voller Jahre bei
//                  linearer Abschreibung: AK − AfA × Jahre.
//   "degressiv"    Degressive AfA im n-ten Jahr: fester Prozentsatz vom jeweiligen
//                  Restbuchwert zu Jahresbeginn. Gefragt ist der AfA-Betrag.
//   "gwg"          Geringwertiges Wirtschaftsgut: Behandlung anhand der Netto-
//                  Anschaffungskosten (bis 250 € sofort Aufwand, bis 800 € Sofort-
//                  abschreibung, bis 1.000 € Sammelposten über 5 Jahre).
//
// Felder je nach cat:
//   linear:       { ak, nd }
//   zeitanteilig: { ak, nd, monate }
//   restbuchwert: { ak, nd, jahre }
//   degressiv:    { ak, satz, jahr }
//   gwg:          { netto }

var afaTasks = [

  // -- Lineare AfA: jährlicher Betrag --
  { cat: "linear", text: "Der Großhandel kauft einen Lieferwagen für 36.000 € netto. Die betriebsgewöhnliche Nutzungsdauer beträgt 6 Jahre, es wird linear abgeschrieben. Wie hoch ist der jährliche AfA-Betrag?",
    ak: 36000, nd: 6 },
  { cat: "linear", text: "Für ein neues Regalsystem fallen Anschaffungskosten von 12.000 € netto an. Die Nutzungsdauer beträgt 10 Jahre (lineare Abschreibung). Wie hoch ist die jährliche Abschreibung?",
    ak: 12000, nd: 10 },
  { cat: "linear", text: "Eine Lagerhalle-Einrichtung wurde für 45.000 € netto angeschafft und wird über 15 Jahre linear abgeschrieben. Wie viel Abschreibung fällt pro Jahr an?",
    ak: 45000, nd: 15 },
  { cat: "linear", text: "Ein Gabelstapler kostet 28.000 € netto, die Nutzungsdauer liegt bei 8 Jahren. Bei linearer AfA: Wie hoch ist der Jahresabschreibungsbetrag?",
    ak: 28000, nd: 8 },
  { cat: "linear", text: "Die Büroausstattung wurde für 9.600 € netto beschafft und soll über 12 Jahre linear abgeschrieben werden. Wie hoch ist die jährliche AfA?",
    ak: 9600, nd: 12 },
  { cat: "linear", text: "Ein Server kostet 7.500 € netto und wird über 5 Jahre linear abgeschrieben. Wie hoch ist der jährliche AfA-Betrag?",
    ak: 7500, nd: 5 },

  // -- Lineare AfA im Anschaffungsjahr (monatsgenau) --
  { cat: "zeitanteilig", text: "Ein Lieferwagen (Anschaffungskosten 36.000 € netto, Nutzungsdauer 6 Jahre, linear) wird am 15. Oktober angeschafft. Der Anschaffungsmonat zählt voll mit. Wie hoch ist die AfA im Anschaffungsjahr?",
    ak: 36000, nd: 6, monate: 3 },
  { cat: "zeitanteilig", text: "Ein Regalsystem (12.000 € netto, Nutzungsdauer 10 Jahre, linear) wird am 1. April in Betrieb genommen. Der Anschaffungsmonat wird voll gerechnet. Wie hoch ist die AfA im ersten Jahr?",
    ak: 12000, nd: 10, monate: 9 },
  { cat: "zeitanteilig", text: "Ein Gabelstapler (28.800 € netto, Nutzungsdauer 8 Jahre, linear) wird am 20. Juli angeschafft. Rechne monatsgenau, der Anschaffungsmonat zählt voll. Wie hoch ist die AfA im Anschaffungsjahr?",
    ak: 28800, nd: 8, monate: 6 },
  { cat: "zeitanteilig", text: "Eine Büroausstattung (10.800 € netto, Nutzungsdauer 12 Jahre, linear) wird am 3. November gekauft. Wie hoch ist die zeitanteilige AfA im Jahr der Anschaffung (Anschaffungsmonat voll)?",
    ak: 10800, nd: 12, monate: 2 },
  { cat: "zeitanteilig", text: "Ein Server (7.500 € netto, Nutzungsdauer 5 Jahre, linear) wird am 10. März angeschafft. Der Anschaffungsmonat zählt voll. Wie hoch ist die AfA im Anschaffungsjahr?",
    ak: 7500, nd: 5, monate: 10 },
  { cat: "zeitanteilig", text: "Ein Kühlfahrzeug (54.000 € netto, Nutzungsdauer 9 Jahre, linear) wird am 28. September angeschafft. Anschaffungsmonat voll gerechnet: Wie hoch ist die AfA im ersten Jahr?",
    ak: 54000, nd: 9, monate: 4 },

  // -- Restbuchwert bei linearer AfA --
  { cat: "restbuchwert", text: "Ein Lieferwagen wurde zu Jahresbeginn für 36.000 € netto angeschafft, Nutzungsdauer 6 Jahre, lineare AfA. Wie hoch ist der Restbuchwert nach 2 vollen Jahren?",
    ak: 36000, nd: 6, jahre: 2 },
  { cat: "restbuchwert", text: "Ein Regalsystem (12.000 € netto, Nutzungsdauer 10 Jahre, linear) wurde zu Jahresbeginn angeschafft. Wie hoch ist der Buchwert am Ende des 4. Jahres?",
    ak: 12000, nd: 10, jahre: 4 },
  { cat: "restbuchwert", text: "Ein Gabelstapler (28.000 € netto, Nutzungsdauer 8 Jahre, linear) wurde zu Jahresbeginn gekauft. Wie hoch ist der Restbuchwert nach 5 Jahren?",
    ak: 28000, nd: 8, jahre: 5 },
  { cat: "restbuchwert", text: "Eine Büroausstattung (9.600 € netto, Nutzungsdauer 12 Jahre, linear) wurde zu Jahresbeginn angeschafft. Wie hoch ist der Restbuchwert nach 3 Jahren?",
    ak: 9600, nd: 12, jahre: 3 },
  { cat: "restbuchwert", text: "Ein Server (7.500 € netto, Nutzungsdauer 5 Jahre, linear) wurde zu Jahresbeginn angeschafft. Wie hoch ist der Restbuchwert am Ende des 4. Jahres?",
    ak: 7500, nd: 5, jahre: 4 },
  { cat: "restbuchwert", text: "Eine Verpackungsanlage (45.000 € netto, Nutzungsdauer 15 Jahre, linear) wurde zu Jahresbeginn angeschafft. Wie hoch ist ihr Buchwert nach 6 Jahren?",
    ak: 45000, nd: 15, jahre: 6 },

  // -- Degressive AfA (fester Prozentsatz vom Restbuchwert) --
  { cat: "degressiv", text: "Ein Lieferwagen (Anschaffungskosten 40.000 € netto) wird zu Jahresbeginn angeschafft und degressiv mit 20 % vom jeweiligen Restbuchwert abgeschrieben. Wie hoch ist die AfA im 1. Jahr?",
    ak: 40000, satz: 20, jahr: 1 },
  { cat: "degressiv", text: "Ein Lieferwagen (40.000 € netto) wird degressiv mit 20 % vom Restbuchwert abgeschrieben, Anschaffung zu Jahresbeginn. Wie hoch ist der AfA-Betrag im 2. Jahr?",
    ak: 40000, satz: 20, jahr: 2 },
  { cat: "degressiv", text: "Eine Maschine (25.000 € netto) wird zu Jahresbeginn gekauft und degressiv mit 25 % vom jeweiligen Buchwert abgeschrieben. Wie hoch ist die AfA im 2. Jahr?",
    ak: 25000, satz: 25, jahr: 2 },
  { cat: "degressiv", text: "Eine Verpackungsanlage (60.000 € netto) wird degressiv mit 30 % vom Restbuchwert abgeschrieben (Anschaffung zu Jahresbeginn). Wie hoch ist die AfA im 3. Jahr?",
    ak: 60000, satz: 30, jahr: 3 },
  { cat: "degressiv", text: "Ein Kühlfahrzeug (80.000 € netto) wird zu Jahresbeginn angeschafft und degressiv mit 20 % vom Restbuchwert abgeschrieben. Wie hoch ist die AfA im 3. Jahr?",
    ak: 80000, satz: 20, jahr: 3 },
  { cat: "degressiv", text: "Ein Gabelstapler (20.000 € netto) wird degressiv mit 10 % vom jeweiligen Restbuchwert abgeschrieben (Anschaffung zu Jahresbeginn). Wie hoch ist die AfA im 2. Jahr?",
    ak: 20000, satz: 10, jahr: 2 },

  // -- GWG: Behandlung anhand der Netto-Anschaffungskosten --
  { cat: "gwg", text: "Der Großhandel kauft einen Taschenrechner für 45 € netto. Wie ist er zu behandeln?",
    netto: 45 },
  { cat: "gwg", text: "Ein Bürostuhl kostet 320 € netto, er ist selbstständig nutzbar. Wie ist er zu behandeln?",
    netto: 320 },
  { cat: "gwg", text: "Ein Aktenschrank wird für 780 € netto angeschafft. Wie ist er steuerlich zu behandeln?",
    netto: 780 },
  { cat: "gwg", text: "Ein Drucker kostet 1.850 € netto. Wie ist die Anschaffung zu behandeln?",
    netto: 1850 },
  { cat: "gwg", text: "Ein Schreibtisch wird für 600 € netto gekauft. Wie ist er zu behandeln (Sofortabschreibung als GWG vs. Sammelposten vs. Sofortaufwand)?",
    netto: 600 },
  { cat: "gwg", text: "Ein Messgerät wird für 890 € netto angeschafft. Wie ist es zu behandeln?",
    netto: 890 },
  { cat: "gwg", text: "Ein Tablet für die Lagerverwaltung kostet 249 € netto. Wie ist es zu behandeln?",
    netto: 249 }
];

# Deployment

Anleitung zum Hosten von BuHaSim. Für eine Projektübersicht siehe [`README.md`](README.md).

## Lokal ausprobieren

Einfach `index.html` im Browser öffnen, oder mit einem lokalen Server:

```
npx serve .
```

## Dateien

```
├── index.html      Seitenstruktur (Übungsmodus)
├── story.html      Seitenstruktur (Story-Modus)
├── styles.css      Design (Ledger-/T-Konto-Optik), von beiden Seiten genutzt
├── fonts.css       Selbst gehostete @font-face-Regeln (kein Google Fonts CDN)
├── fonts/          Die Schriftdateien selbst (.woff2)
├── cases.js        Nur Daten: Konten, Eröffnungsbilanz, Übungsfälle, Abschluss-Szenario
├── app.js          Nur Logik für den Übungsmodus (index.html)
├── story-data.js   Nur Daten: die 25 Schritte des Story-Modus
├── story.js        Nur Logik für den Story-Modus (story.html)
└── impressum.html  Impressum (Pflichtangaben)
```

`cases.js` muss im HTML vor `app.js` bzw. vor `story-data.js`/`story.js` geladen werden (steht schon so in beiden HTML-Dateien), da diese auf die dort global definierten Variablen (`accounts`, `cases`, `openingBalances`, `abschlussSzenario` usw.) zugreifen.

**Schriften**: Bewusst selbst gehostet statt über das Google Fonts CDN eingebunden. Dadurch werden keine Nutzerdaten (IP-Adresse) beim Laden der Seite an Google übertragen, was in Deutschland datenschutzrechtlich wiederholt abgemahnt wurde. Beim Wechsel auf andere Schriften einfach neue `.woff2`-Dateien in `fonts/` legen und `fonts.css` entsprechend anpassen.

## Deployment auf Cloudflare Pages (über GitHub)

1. Repo auf GitHub anlegen und alle Dateien (`index.html`, `styles.css`, `cases.js`, `app.js`, `impressum.html`) sowie diese `README.md` hochladen/pushen.
2. Bei [Cloudflare Pages](https://pages.cloudflare.com/) einloggen → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Das GitHub-Repo auswählen und autorisieren.
4. Build-Einstellungen:
   - **Framework preset:** `None`
   - **Build command:** leer lassen
   - **Build output directory:** `/` (Repo-Root, da die Dateien direkt dort liegen)
5. **Save and Deploy** klicken. Nach ein paar Sekunden ist die Seite unter `<projekt>.pages.dev` erreichbar.
6. Jeder Push auf den verbundenen Branch (z. B. `main`) löst automatisch ein neues Deployment aus.

Optional: eine eigene Domain unter **Custom domains** im Cloudflare-Pages-Projekt hinterlegen.

## Eigene Übungsfälle ergänzen

Alle Fälle stehen als einfache Objekte in `cases.js` im Array `cases`. Ein Fall sieht so aus:

```js
{
  cat: "grundlagen", // grundlagen | ust | schwer | realistisch | eigene Kategorie-ID
  text: "Beschreibung des Geschäftsfalls …",
  soll:  [{ a: "Wareneingang", b: 800 }],
  haben: [{ a: "Kasse", b: 800 }]
}
```

`a` ist der Konto-Schlüssel aus dem `accounts`-Objekt oben in derselben Datei, `b` der Betrag. Mehrzeilige Buchungssätze (z. B. mit Umsatzsteuer) einfach als weitere Einträge im `soll`- oder `haben`-Array angeben (maximal 3 pro Seite).

Um eine neue Kategorie hinzuzufügen: in `index.html` einen weiteren Button im `.category-picker` ergänzen (`data-cat="..."` passend zum `cat`-Feld der Fälle) und in `cases.js` entsprechend getaggte Fälle ergänzen.

Der Modus `abschluss` nutzt kein `cases`-Array, sondern das feste `abschlussSzenario` weiter unten in `cases.js`.

## Umfang

- Grundlagen: einfache Buchungssätze (Aktiv-/Passivkonten, Aufwand/Ertrag)
- Mit Umsatzsteuer: zusammengesetzte Buchungssätze mit Vorsteuer/Umsatzsteuer
- Schwer: Rücksendungen, Nachlässe, Skonto, mehrkontige Fälle
- Realistisch: Fälle mit Kontext und Ablenkungsinfos wie in echten Belegen, Steuer wird nicht vorgerechnet
- Abschluss: kompletter Jahresabschluss (GuV, SBK) mit anschließender Neueröffnung (EBK)
- Live-Bilanz, standardmäßig ausgeblendet, optional einschaltbar, aktualisiert sich mit jeder richtigen Buchung
- "Warum?"-Erklärung nach jeder Eingabe (richtig oder falsch)
- Fortschritt (Punktestand, Serie) wird lokal im Browser gespeichert (`localStorage`), nicht serverseitig

Nicht enthalten (mögliche Erweiterungen): Abschreibungen, Privatentnahme, Rückstellungen, Mehrsprachigkeit.

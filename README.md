# Kontobuch — Buchungssatz-Trainer

Ein kostenloser, interaktiver Trainer für Buchungssätze. Kein Framework, kein Build-Schritt — nur `index.html`, `styles.css` und `app.js`.

## Lokal ausprobieren

Einfach `index.html` im Browser öffnen, oder mit einem lokalen Server:

```
npx serve .
```

## Deployment auf Cloudflare Pages (über GitHub)

1. Repo auf GitHub anlegen und diese drei Dateien (`index.html`, `styles.css`, `app.js`) sowie diese `README.md` hochladen/pushen.
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

Alle Fälle stehen als einfache Objekte in `app.js` im Array `cases`. Ein Fall sieht so aus:

```js
{
  cat: "grundlagen", // "grundlagen" | "ust" | eigene Kategorie-ID
  text: "Beschreibung des Geschäftsfalls …",
  soll:  [{ a: "Waren", b: 800 }],
  haben: [{ a: "Kasse", b: 800 }]
}
```

`a` ist der Konto-Schlüssel aus dem `accounts`-Objekt oben in derselben Datei, `b` der Betrag. Mehrzeilige Buchungssätze (z. B. mit Umsatzsteuer) einfach als mehrere Einträge im `soll`- oder `haben`-Array angeben.

Um eine neue Kategorie hinzuzufügen, in `index.html` einen weiteren Button im `.category-picker` ergänzen (`data-cat="..."` passend zum `cat`-Feld der Fälle).

## Umfang

- Grundlagen: einfache Buchungssätze (Aktiv-/Passivkonten, Aufwand/Ertrag)
- Mit Umsatzsteuer: zusammengesetzte Buchungssätze mit Vorsteuer/Umsatzsteuer
- Live-Bilanz, die sich mit jeder richtigen Buchung aktualisiert (optional ausblendbar)
- Fortschritt (Punktestand, Serie) wird lokal im Browser gespeichert (`localStorage`), nicht serverseitig

Nicht enthalten (mögliche Erweiterungen): Skonto/Rabatt, Abschreibungen, Diverse-Konten, Mehrsprachigkeit.

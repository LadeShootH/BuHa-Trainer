# BuHaSim

**BuHaSim** ist ein kostenloser, interaktiver Trainer für Buchungssätze, für alle, die Rechnungswesen lernen oder unterrichten. Geschäftsfall lesen, Soll- und Haben-Konten sowie Betrag eintragen, sofortiges Feedback bekommen und live sehen, wie sich jede Buchung auswirkt.

🔗 **Live:** [buhasim.pages.dev](https://buhasim.pages.dev) <!-- Link anpassen, sobald das Cloudflare-Pages-Projekt benannt ist -->

## Funktionen

- **Fünf Niveaustufen**: Grundlagen (einfache Buchungssätze), Mit Umsatzsteuer, Schwer (Rücksendungen, Nachlässe, Skonto), ein Abschluss-Modus (kompletter Jahresabschluss über GuV und Schlussbilanzkonto, danach Eröffnung des Folgejahres über das Eröffnungsbilanzkonto) sowie ein gemischter Modus
- **Story-Modus**: Eine durchgehende Geschichte statt Zufallsfällen. Man begleitet eine fiktive Firma chronologisch durch ihr erstes Geschäftsjahr, von der Gründung bis zum Jahresabschluss, inklusive kleiner Reaktionen je nach Kontostand
- **Live-Bilanz**: Aktiva und Passiva aktualisieren sich in Echtzeit mit jeder richtigen Buchung, inklusive laufendem Periodengewinn, optional ausblendbar. Im Abschluss-Modus zeigt derselbe Bereich stattdessen live das jeweils aktive Abschlusskonto (GuV, SBK oder EBK)
- **"Warum?"-Erklärung**: Nach jeder Eingabe lässt sich per Klick einblenden, warum welches Konto im Soll bzw. Haben steht, Zeile für Zeile nach den Grundregeln für Aktiv-, Passiv-, Aufwands- und Ertragskonten
- **T-Konto-Formular**: Eingabe im Soll/Haben-Format, wie im echten Kontenrahmen
- **Fortschritt**: Punktestand und Serie richtiger Buchungen werden lokal im Browser gespeichert. Kein Server, kein Konto nötig
- **Für Handy und Desktop**: Responsives Layout

## Hintergrund

BuHaSim ist als reine Übungshilfe entstanden: kein Lehrbuch-Ersatz, keine verbindliche fachliche Beratung, sondern ein Werkzeug, um die Systematik von Soll und Haben durch Wiederholung zu verinnerlichen. Gedacht für Schülerinnen, Schüler und alle, die Buchungssätze üben wollen. Die verwendeten Konten orientieren sich am Großhandelskontenrahmen (GKR).

## Technik

Reines HTML, CSS und JavaScript, ohne Frameworks oder Build-Schritt. Gehostet über Cloudflare Pages.

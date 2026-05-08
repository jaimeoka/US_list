# Ultrastar Song List PDF Generator

Diese Node.js-Anwendung erzeugt ein PDF mit Songs aus einer Ultrastar-Bibliothek.

## Sprachen

- English: `README.md`
- Español: `README.es.md`
- Deutsch (Standard): diese Datei
- Aenderungsprotokoll: `CHANGELOG.md`

## Ueberblick

Es unterstuetzt zwei Arbeitsweisen:

- Kommandozeilenmodus fuer den urspruenglichen skriptbasierten Workflow
- Browsermodus mit einem statischen HTML-Frontend und einem kleinen Node.js-Backend

## Schnellstart

1. Abhängigkeiten installieren:

```bash
npm install
```

2. Den ursprünglichen Skriptmodus starten:

```bash
npm run cli
```

3. Oder den Browsermodus starten:

```bash
npm run gui
```

Danach öffnen:

```text
http://localhost:3000
```

## Projektstruktur

- `src/index.ts`: Haupt-Entrypoint für CLI
- `src/configuration.ts`: Standard-Konfigurationswerte für CLI und GUI-Backend
- `src/server.ts`: kleiner Node.js-Server für den Browsermodus
- `src/song.ts`: Song-Scan-, Parse- und Sortierlogik
- `src/db.ts`: Laden der Ultrastar-Scores aus SQLite
- `src/jobs.ts`: PDF-Generierungslogik
- `public/index.html`: Markup der Browseroberfläche
- `public/style.css`: Styles der Browseroberfläche
- `public/app.js`: Verhalten der Browseroberfläche

## Was es macht

- Liest Songdaten aus dem in `src/configuration.ts` konfigurierten Ordner
- Erzeugt eine PDF-Songliste
- Unterstützt benutzerdefiniertes Ausgabeformat, Sortierung, Filter und Seitenlayout
- Kann optional Highscores aus `Ultrastar.db` lesen

## Konfiguration

Alle verfügbaren Optionen sind direkt in `src/configuration.ts` dokumentiert.

Konfigurierbar sind:

- Name der Ausgabedatei
- Seitengröße, Ränder und Layout
- Schriftgrößen
- Pfad zum Song-Verzeichnis
- Format pro Songzeile
- Sortier- und Filteroptionen
- Ob Scores aus der Ultrastar-Datenbank gelesen werden sollen
- Datenbankpfad

## Voraussetzungen

- Node.js: https://nodejs.org/en/download/

## Verwendung

### Option 1: Kommandozeilenmodus

Nutze dies, wenn du den ursprünglichen skriptbasierten Workflow möchtest.

1. Bearbeite `src/configuration.ts` und setze die gewünschten Optionen.
2. Ausführen:

```bash
npm run cli
```

Dadurch werden die TypeScript-Dateien aus `src` nach `dist` kompiliert und danach das erzeugte JavaScript ausgeführt.

Das erzeugte PDF wird mit dem in `src/configuration.ts` definierten Dateinamen gespeichert.

### Option 2: Browsermodus

Nutze dies, wenn du Optionen über eine HTML-Seite auswählen möchtest.

1. Ausführen:

```bash
npm run gui
```

2. Diese Adresse im Browser öffnen:

```text
http://localhost:3000
```

Das Frontend wird aus dem Ordner `public` bereitgestellt, und das Node.js-Backend nutzt die bestehende Generierungslogik.

Der Browsermodus ersetzt den Skriptmodus nicht, sondern fügt nur einen zweiten Weg hinzu, dieselben Optionen zu übergeben.

## So funktioniert die Konfiguration

Das Projekt nutzt `src/configuration.ts` als Quelle für Standardwerte.

- Im CLI-Modus werden diese Standardwerte direkt verwendet.
- Im Browsermodus sendet das HTML-Formular die gewählten Optionen an das Backend.
- Das Backend übergibt diese Werte über Umgebungsvariablen an den Generator.

So kannst du sinnvolle Standardwerte in `src/configuration.ts` behalten und sie bei Bedarf im Browser überschreiben.

## Highscores aus Ultrastar.db

Wenn du pro Song den höchsten Score einfügen möchtest, aktiviere die Datenbankprüfung in `src/configuration.ts` und setze den korrekten Pfad zu `Ultrastar.db`.

Unter Windows liegt die Datenbank häufig im Roaming-Profil des Benutzers, zum Beispiel:

```text
C:\Users\<dein-benutzer>\AppData\Roaming\ultrastardx\Ultrastar.db
```

Der genaue Ort kann je nach Betriebssystem und Installation variieren.

## Automatisierte Releases

Dieses Projekt ist fuer automatische semantische Versionierung und GitHub Releases mit `semantic-release` konfiguriert.

### So funktioniert es

- Jeder Push nach `main` oder `master` startet `.github/workflows/release.yml`.
- `semantic-release` liest Commit-Nachrichten seit dem letzten Tag und entscheidet, ob ein neues Release erstellt wird.
- Die Versionierungsregeln folgen Conventional Commits:
	- `fix: ...` -> Patch-Release
	- `feat: ...` -> Minor-Release
	- `feat!: ...` oder `BREAKING CHANGE:` -> Major-Release
- Beim Release aktualisiert die Pipeline:
	- `CHANGELOG.md`
	- `package.json`
	- `package-lock.json`
	- Git-Tag und GitHub-Release-Notizen

### Validierung von Commit-Nachrichten

Pull Requests fuehren `.github/workflows/commitlint.yml` aus, um Commit-Nachrichten gegen Conventional Commits zu pruefen.

### Lokale Befehle

- Dry Run (ohne Veroeffentlichung):

```bash
npm run release:dry
```

- Manueller Release-Lauf (normalerweise ueber CI):

```bash
npm run release
```

### Beispiele fuer Commit-Nachrichten

```text
feat(gui): show app version badge in header
fix(server): return better message when db path is invalid
feat!: drop Node 18 support
```

## Kontakt

Vorschläge: jaimeoka@gmail.com

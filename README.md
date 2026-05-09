# Ultrastar Song List PDF Generator

This Node.js application generates a PDF with songs from an Ultrastar library.

## Languages

- English (default): this file
- Español: `README.es.md`
- Deutsch: `README.de.md`
- Changelog: `CHANGELOG.md`

## Overview

It supports two ways of working:

- Command-line mode for the original script-based workflow
- Browser mode with a static HTML frontend and a small Node.js backend

## Quick Start

1. Install Node.js:
   - Download and install from: https://nodejs.org/en/download/

2. Download this project from GitHub:
	 - Option A (recommended for beginners, no Git needed):
		 1. Open: https://github.com/jaimeoka/US_list
		 2. Click the green `Code` button.
		 3. Click `Download ZIP`.
		 4. Extract the ZIP file to a folder on your computer.
	 - Option B (if you already use Git):

```bash
git clone https://github.com/jaimeoka/US_list.git
cd US_list
```

3. Open the project folder in a terminal.

4. Install dependencies:

```bash
npm install
```

5. Start the browser mode:

```bash
npm run gui
```

Then open:

```text
http://localhost:3000
```

6. Or run the original script mode:

```bash
npm run cli
```

## Project Structure

- `src/index.ts`: main CLI entrypoint
- `src/configuration.ts`: default configuration values used by the CLI and GUI backend
- `src/server.ts`: small Node.js server for the browser mode
- `src/song.ts`: song scanning, parsing, and sorting logic
- `src/db.ts`: Ultrastar SQLite score loading
- `src/jobs.ts`: PDF generation logic
- `public/index.html`: browser UI markup
- `public/style.css`: browser UI styles
- `public/app.js`: browser UI behavior

## What It Does

- Reads song data from the folder configured in `src/configuration.ts`
- Generates a PDF song list
- Supports custom output formatting, sorting, filtering, and page layout
- Can optionally read high scores from `Ultrastar.db`

## Configuration

All available options are documented directly in `src/configuration.ts`.

You can configure:

- Output file name
- Page size, margins, and layout
- Font sizes
- Song directory path
- Song line format
- Sorting and filtering options
- Whether to read scores from the Ultrastar database
- Database path

## Usage

### Option 1: Command-line mode

Use this if you want the original script-based workflow.

1. Edit `src/configuration.ts` and set the options you want.
2. Run:

```bash
npm run cli
```

This compiles the TypeScript files from `src` into `dist` and then runs the generated JavaScript.

The generated PDF will be saved using the output file name defined in `src/configuration.ts`.

This mode uses:

- `src/index.ts` as the entrypoint
- `src/configuration.ts` for all options
- `src/song.ts`, `src/db.ts`, and `src/jobs.ts` for the generation logic

### Option 2: Browser mode

Use this if you want to select the options from an HTML page.

1. Run:

```bash
npm run gui
```

2. Open this address in your browser:

```text
http://localhost:3000
```

The frontend is served from the `public` folder and the Node.js backend runs the existing generation logic.

This mode uses:

- `public/index.html`, `public/style.css`, and `public/app.js` for the UI
- `src/server.ts` to serve the static files and receive the form submission
- `src/index.ts` to run the same PDF generation flow as the CLI mode

The browser mode does not replace the script mode. It only adds a second way to provide the same options.

## How Configuration Works

The project keeps `src/configuration.ts` as the source of the default values.

- In CLI mode, those defaults are used directly
- In browser mode, the HTML form sends the selected values to the backend
- The backend passes those values to the generator through environment variables

This means you can still keep sensible defaults in `src/configuration.ts` while overriding them from the browser when needed.

## High Scores from Ultrastar.db

If you want to include each song's highest score, enable database checking in `src/configuration.ts` and set the correct path to `Ultrastar.db`.

On Windows, the database is commonly located under the user's roaming profile, for example:

```text
C:\Users\<your-user>\AppData\Roaming\ultrastardx\Ultrastar.db
```

The exact location may vary depending on the operating system and installation, so if needed, search for `Ultrastar.db` manually.

## Contact

Suggestions: jaimeoka@gmail.com

## Documentation Strategy

For this project, it is better to use one README file per language instead of putting all languages in a single file.

Why:

- Better readability: users can read one language without scrolling through others.
- Easier maintenance: each translation can be reviewed and updated independently.
- Better collaboration: contributors can work on one language file without merge conflicts in one very large README.
- Better linking: you can link directly to the right language from package pages or shared links.

Use this `README.md` as the source (English), and keep `README.es.md` and `README.de.md` aligned with it.

# Ultrastar Song List PDF Generator

This Node.js application generates a PDF with songs from an Ultrastar library.

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

## Requirements

- Node.js: https://nodejs.org/en/download/

## Setup

1. Clone or download this project.
2. Open the project folder in a terminal.
3. Install dependencies:

```bash
npm install
```

## Usage

1. Edit `src/configuration.ts` and set the options you want.
2. Run the program:

```bash
npm start
```

This compiles the TypeScript files from `src` into `dist` and then runs the generated JavaScript.

The generated PDF will be saved using the output file name defined in `src/configuration.ts`.

## High Scores from Ultrastar.db

If you want to include each song's highest score, enable database checking in `src/configuration.ts` and set the correct path to `Ultrastar.db`.

On Windows, the database is commonly located under the user's roaming profile, for example:

```text
C:\Users\<your-user>\AppData\Roaming\ultrastardx\Ultrastar.db
```

The exact location may vary depending on the operating system and installation, so if needed, search for `Ultrastar.db` manually.

## Contact

Suggestions: jaimeoka@gmail.com

type Layout = 'portrait' | 'landscape'
type JobType = 'printList' | 'noVideos' | 'noMedley' | 'noYear' | 'withDuo' | 'withScore' | 'noScore'

interface Configuration {
  output: string
  margin: number
  layout: Layout
  fontSize: number
  fontSizeSmall: number
  tooLong: number
  size: string
  path: string
  format: string
  options: string
  job: JobType
  checkDb: boolean
  db: string
}

const e = process.env

const configuration: Configuration = {
  // File name
  output: e.US_OUTPUT || 'songs.pdf',
  // Page margin
  margin: e.US_MARGIN ? parseInt(e.US_MARGIN) : 25,
  // Page layout: 'portrait' 'landscape'
  layout: (e.US_LAYOUT as Layout) || 'portrait',
  // Default font
  fontSize: e.US_FONTSIZE ? parseInt(e.US_FONTSIZE) : 12,
  // Font when entry too long
  fontSizeSmall: e.US_FONTSIZE_SMALL ? parseInt(e.US_FONTSIZE_SMALL) : 10,
  // Entries longer than this use small font
  tooLong: e.US_TOO_LONG ? parseInt(e.US_TOO_LONG) : 20,
  // Page size
  size: e.US_SIZE || 'A4',
  // Song directory
  path: e.US_PATH || 'C:\\US\\songs',
  //
  // Format for the song information.
  // Entries are separated by '.'.
  // a: artist
  // t: title
  // l: language
  // y: year
  // g: genre
  // c: creator
  // v: video
  // d: duo
  // m: medley
  // h: high score in the database
  // x: free text
  // b after the format indicates bold.
  //
  // Examples:
  // 'l.x - .a.x - .t' => English - Frank Sinatra - Fly me to the moon
  // 'a.x - .t.x (.y.x) .h' => Frank Sinatra - Fly me to the moon (1963) Singer1(8250)
  format: e.US_FORMAT || 'ab.x - .t.x (.y.x).v.d.hb',
  //
  // Extra options
  // Options are separated by '.'
  // Sort: first character 's', second character is the field:
  //   a: by artist  t: by title  l: by language
  //   y: by year    g: by genre  c: by creator
  // Group: 'ga' => group songs by artist (prints a bold artist header before each group)
  //   Note: combine with 'sa' sort so songs are contiguous per artist.
  options: e.US_OPTIONS !== undefined ? e.US_OPTIONS : 'sa.ga',
  //
  // job:
  // 'printList': List all songs
  // 'noVideos': List songs without videos
  // 'noMedley': List songs without medley
  // 'noYear': List songs without year
  // 'with Duo': List songs with duo
  // 'withScore': List songs with score
  // 'noScore': List songs without score
  job: (e.US_JOB as JobType) || 'printList',
  // check scores in the Database, false if high score is not needed
  checkDb: e.US_CHECK_DB !== undefined ? e.US_CHECK_DB === 'true' : true,
  // Path to Ultrastar DB
  db: e.US_DB || 'C:\\Users\\49172\\AppData\\Roaming\\ultrastardx\\Ultrastar.db'
}

export = configuration
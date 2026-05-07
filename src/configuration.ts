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

const configuration: Configuration = {
  // File name
  output: 'songs.pdf',
  // Page margin
  margin: 25,
  // Page layout: 'portrait' 'landscape'
  layout: 'portrait',
  // Default font
  fontSize: 12,
  // Font when entry too long
  fontSizeSmall: 10,
  // Entries longer than this use small font
  tooLong: 20,
  // Page size
  size: 'A4',
  // Song directory
  path: 'C:\\US\\songs',
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
  format: 'ab.x - .t.x (.y.x).v.d.hb',
  //
  // Extra options
  // Options are separated by '.'
  // Sort: first character 's', second character is the field:
  //   a: by artist  t: by title  l: by language
  //   y: by year    g: by genre  c: by creator
  // Group: 'ga' => group songs by artist (prints a bold artist header before each group)
  //   Note: combine with 'sa' sort so songs are contiguous per artist.
  options: 'sa.ga',
  //
  // job:
  // 'printList': List all songs
  // 'noVideos': List songs without videos
  // 'noMedley': List songs without medley
  // 'noYear': List songs without year
  // 'with Duo': List songs with duo
  // 'withScore': List songs with score
  // 'noScore': List songs without score
  job: 'printList',
  // check scores in the Database, false if high score is not needed
  checkDb: true,
  // Path to Ultrastar DB
  db: 'C:\\Users\\49172\\AppData\\Roaming\\ultrastardx\\Ultrastar.db'
}

export = configuration
import * as fs from 'fs'
import * as path from 'path'
import * as conf from './configuration'

export const songs: Song[] = []
export const songMap: Map<string, Song> = new Map()

interface Score {score: number, player: string, difficulty: number, date: number}

/**
 * Represents a song loaded from an UltraStar TXT definition file.
 */
export class Song {
  dir = ''
  folder = ''
  filename = ''
  title = ''
  artist = ''
  language = ''
  genre = ''
  year = ''
  creator = ''
  mp3 = ''
  cover = ''
  video = ''
  bpm = ''
  gap = ''
  medley = false
  duo = false
  scores: Score[] = []

  /**
   * Creates a song and reads metadata from its source TXT file.
   */
  constructor(dir: string, folder: string, filename: string) {
    this.dir = dir
    this.folder = folder
    this.filename = filename
    this.readfile()
  }

  /**
   * Recursively scans a directory for song TXT files.
   */
  static read(dir: string, folder = '') {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file)
      if (fs.lstatSync(fullPath).isDirectory()) this.read(fullPath, file)
      else if (file.endsWith('.txt')) Song.addSong(dir, folder, file)
    })
  }
  
  /**
   * Adds a song to the collection and marks duo entries when needed.
   */
  static addSong(dir: string, folder: string, filename: string) {
    const song = new Song(dir, folder, filename)
    if (songMap.has(song.index)) {  // Check duo
      const otherSong = songMap.get(song.index) as Song
      if ((song.filename.endsWith('[MULTI].txt') && !otherSong.filename.endsWith('[MULTI].txt')) ||
          (!song.filename.endsWith('[MULTI].txt') && otherSong.filename.endsWith('[MULTI].txt')))
          otherSong.duo = true
          return
    }
    songs.push(song)
    songMap.set(song.index, song)
  }

  /**
   * Sorts songs by a selected metadata field.
   */
  static sort(songs: Song[], sortBy: string) {
    songs.sort((a, b) => {
      switch (sortBy) {
        case 'a': return a.artist.localeCompare(b.artist)
        case 't': return a.title.localeCompare(b.title)
        case 'l': return a.language.localeCompare(b.language)
        case 'g': return a.genre.localeCompare(b.genre)
        case 'y': return a.year.localeCompare(b.year)
        case 'c': return a.creator.localeCompare(b.creator)
        default: return 0
      }
    })
  }

  /**
   * Builds a stable song key based on artist and title.
   */
  private get index(): string { return this.artist + '.' + this.title}

  /**
   * Reads song metadata tags from the TXT file header.
   */
  private readfile() {
    const fullpath = path.join(this.dir, this.filename)
    const contents = fs.readFileSync(fullpath, 'latin1')
    const lines = contents.split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.indexOf('#TITLE:') !== -1) this.title = line.substring(line.indexOf('#TITLE:') + 7).trim()
      if (line.indexOf('#ARTIST:') !== -1) this.artist = line.substring(line.indexOf('#ARTIST:') + 8).trim()
      if (line.indexOf('#LANGUAGE:') !== -1) this.language = line.substring(line.indexOf('#LANGUAGE:') + 10).trim()
      if (line.indexOf('#GENRE:') !== -1) this.genre = line.substring(line.indexOf('#GENRE:') + 7).trim()
      if (line.indexOf('#YEAR:') !== -1) this.year = line.substring(line.indexOf('#YEAR:') + 6).trim()
      if (line.indexOf('#CREATOR:') !== -1) this.creator = line.substring(line.indexOf('#CREATOR:') + 9).trim()
      if (line.indexOf('#MP3:') !== -1) this.mp3 = line.substring(line.indexOf('#MP3:') + 5).trim()
      if (line.indexOf('#COVER:') !== -1) this.cover = line.substring(line.indexOf('#COVER:') + 7).trim()
      if (line.indexOf('#VIDEO:') !== -1) this.video = line.substring(line.indexOf('#VIDEO:') + 7).trim()
      if (line.indexOf('#BPM:') !== -1) this.bpm = line.substring(line.indexOf('#BPM:') + 5).trim()
      if (line.indexOf('#GAP:') !== -1) this.gap = line.substring(line.indexOf('#GAP:') + 5).trim()
      if (line.indexOf('#MEDLEYSTARTBEAT:') !== -1) this.medley = true
      if (line.startsWith(':')) break
    }
  }

  /**
   * Writes song information into a PDF line based on a format descriptor.
   */
  addInfo(pdf: PDFKit.PDFDocument, format: string) {
    const items = format.split('.')
    items.forEach((item, index) => {
      const last = index === items.length - 1
      this.addItem(pdf, item, 'a', this.artist, last)
      this.addItem(pdf, item, 't', this.title, last)
      this.addItem(pdf, item, 'l', this.language, last)
      this.addItem(pdf, item, 'g', this.genre, last)
      this.addItem(pdf, item, 'y', this.year, last)
      this.addItem(pdf, item, 'c', this.creator, last)
      this.addItem(pdf, item, 'v', this.video !== '', last)
      this.addItem(pdf, item, 'd', this.duo, last)
      this.addItem(pdf, item, 'm', this.medley, last)
      this.addItem(pdf, item, 'h', this.highScore, last)
      this.addItem(pdf, item, 'x', item.substring(1), last)
    })
  }

  /**
   * Adds a single formatted field to the current PDF row.
   */
  private addItem(pdf: PDFKit.PDFDocument, item: string, ch: string, s: string | boolean, last: boolean) {
    if (!item.startsWith(ch)) return
    pdf.font(item.endsWith('b') ? 'Courier-Bold' : 'Courier')
    if (typeof s === 'string') this.addText(pdf, s, last)
    if (typeof s === 'boolean') this.addText(pdf,  s ? ch : ' ', last)
  }

  /**
   * Renders a value with fallback sizing for long text.
   */
  private addText(pdf: PDFKit.PDFDocument, text: string, last: boolean) {
    if (text.length > conf.tooLong) pdf.fontSize(conf.fontSizeSmall)
    pdf.text(text, {continued: !last}).fontSize(conf.fontSize)
  }

  /**
   * Returns the top score as "player(score)".
   */
  private get highScore(): string {
    if (this.scores.length === 0) return ' '
    this.scores.sort((a, b) => b.score - a.score)
    const highScore = this.scores[0]
    return `${highScore.player}(${highScore.score})`
  }
}

import * as fs from 'fs'
import * as path from 'path'
import * as PDF from 'pdfkit'
import * as conf from './configuration'
import * as SQL from 'sqlite3'

const songs: Song[] = []
const songMap: Map<string, Song> = new Map()

interface Score {score: number, player: string, difficulty: number, date: number}
class Song {
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

  constructor(dir: string, folder: string, filename: string) {
    this.dir = dir
    this.folder = folder
    this.filename = filename
    this.readfile()
  }

  static read(dir: string, folder = '') {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file)
      if (fs.lstatSync(fullPath).isDirectory()) this.read(fullPath, file)
      else if (file.endsWith('.txt')) Song.addSong(dir, folder, file)
    })
  }
  
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

  private get index(): string { return this.artist + '.' + this.title}

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

  private addItem(pdf: PDFKit.PDFDocument, item: string, ch: string, s: string | boolean, last: boolean) {
    if (!item.startsWith(ch)) return
    pdf.font(item.endsWith('b') ? 'Courier-Bold' : 'Courier')
    if (typeof s === 'string') this.addText(pdf, s, last)
    if (typeof s === 'boolean') this.addText(pdf,  s ? ch : ' ', last)
  }

  private addText(pdf: PDFKit.PDFDocument, text: string, last: boolean) {
    if (text.length > conf.tooLong) pdf.fontSize(conf.fontSizeSmall)
    pdf.text(text, {continued: !last}).fontSize(conf.fontSize)
  }

  private get highScore(): string {
    if (this.scores.length === 0) return ' '
    this.scores.sort((a, b) => b.score - a.score)
    const highScore = this.scores[0]
    return `${highScore.player}(${highScore.score})`
  }
}

interface DbScore {
  Artist: string
  Title: string
  Difficulty: number
  Player: string
  Score: number
  Date: number
}

class Db {
  static read() {
    const db = new SQL.Database(conf.db)
    db.all('select Artist, Title, Player, Score, Date from us_songs s, us_scores r where s.ID = r.SongID', (error: Error, rows: DbScore[]) => {
      rows.forEach(row => {
        const artist = row.Artist
        const title = row.Title
        // The entries in Ultrastar.db have a null a the end, it must be removed
        const key = artist.substring(0, artist.length - 1) + '.' + title.substring(0, title.length - 1)
        const song = songMap.get(key)
        if (song) song.scores.push({score: row.Score, player: row.Player.substring(0, row.Player.length - 1), difficulty: row.Difficulty, date: row.Date})
      })
      db.close()
      Job.execute()
    })
  }
}

class Job {
  private static createPdf(): PDFKit.PDFDocument {
    const pdf = new PDF({margin: conf.margin, size: conf.size})
    pdf.pipe(fs.createWriteStream(conf.output))
    pdf.fontSize(conf.fontSize)
    return pdf
  }
  private static printList() {
    const pdf = this.createPdf()
    for (const song of songs) song.addInfo(pdf, conf.format)
    pdf.end()
  }
  private static noVideos() {
    const pdf = this.createPdf()
    for (const song of songs) if (!song.video) song.addInfo(pdf, conf.format)
    pdf.end()
  }
  private static noMedley() {
    const pdf = this.createPdf()
    for (const song of songs) if (!song.medley) song.addInfo(pdf, conf.format)
    pdf.end()
  }
  private static noYear() {
    const pdf = this.createPdf()
    for (const song of songs) if (song.year.length !== 4) song.addInfo(pdf, conf.format)
    pdf.end()
  }
  private static withDuo() {
    const pdf = this.createPdf()
    for (const song of songs) if (song.duo) song.addInfo(pdf, conf.format)
    pdf.end()
  }
  private static withScore() {
    const pdf = this.createPdf()
    for (const song of songs) if (song.scores.length !== 0) song.addInfo(pdf, conf.format)
    pdf.end()
  }
  private static noScore() {
    const pdf = this.createPdf()
    for (const song of songs) if (song.scores.length === 0) song.addInfo(pdf, conf.format)
    pdf.end()
  }
  static init() {
    Song.read(conf.path)
    conf.options.split('.').forEach(option => {
      if (option.startsWith('s')) Song.sort(songs, option.substring(option.length - 1))
    })
    if (conf.checkDb) Db.read()
    else this.execute()
  }

  static execute() {
    switch (conf.job) {
      case 'printList': return Job.printList()
      case 'noVideos': return Job.noVideos()
      case 'noMedley': return Job.noMedley()
      case 'noYear': return Job.noYear()
      case 'withDuo': return Job.withDuo()
      case 'withScore': return Job.withScore()
      case 'noScore': return Job.noScore()
      default: console.log(`Please provide a valid job: 'printList' 'noVideos' noMedley' 'noYear' 'with Duo' 'withScore' 'noScore'`)
    }
  }
}

Job.init()

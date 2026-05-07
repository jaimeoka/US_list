import * as fs from 'fs'
import PDFDocument = require('pdfkit')
import * as conf from './configuration'

interface SongScore {
  score: number
}

interface PrintableSong {
  video: string
  medley: boolean
  year: string
  duo: boolean
  scores: SongScore[]
  addInfo(pdf: PDFKit.PDFDocument, format: string): void
}

interface JobDependencies {
  songs: PrintableSong[]
  readSongs: () => void
  sortSongs: (sortBy: string) => void
  readDb: () => void
}

/**
 * Coordinates song loading, optional database enrichment, and PDF list generation.
 */
export class Job {
  private static dependencies: JobDependencies | null = null

  /**
   * Initializes the job execution flow and triggers either DB read or direct list generation.
   */
  static init(dependencies: JobDependencies) {
    this.dependencies = dependencies
    try {
      dependencies.readSongs()
      if (dependencies.songs.length === 0) {
        console.log('No songs found, please check the directory: ' + conf.path)
        return
      }
    } catch (error) {
      console.log('Error reading the songs, please check the directory: ' + conf.path)
      return
    }

    conf.options.split('.').forEach(option => {
      if (option.startsWith('s')) dependencies.sortSongs(option.substring(option.length - 1))
    })

    if (conf.checkDb) dependencies.readDb()
    else this.execute()
  }

  /**
   * Creates the PDF output with songs that match the provided predicate.
   */
  private static list(predicate: (song: PrintableSong) => boolean) {
    const dependencies = this.dependencies
    if (!dependencies) {
      console.log('Job is not initialized.')
      return
    }

    const pdf = new PDFDocument({margin: conf.margin, size: conf.size, layout: conf.layout})
    pdf.pipe(fs.createWriteStream(conf.output))
    pdf.fontSize(conf.fontSize)
    dependencies.songs.filter(predicate).forEach(song => song.addInfo(pdf, conf.format))
    pdf.end()
  }

  /**
   * Executes the configured job type and writes the corresponding song list.
   */
  static execute() {
    switch (conf.job) {
      case 'printList': return this.list(song => true)
      case 'noVideos':  return this.list(song => !song.video)
      case 'noMedley':  return this.list(song => !song.medley)
      case 'noYear':    return this.list(song => song.year.length !== 4)
      case 'withDuo':   return this.list(song => song.duo)
      case 'withScore': return this.list(song => song.scores.length !== 0)
      case 'noScore':   return this.list(song => song.scores.length === 0)
      default: console.log(`Please provide a valid job: 'printList' 'noVideos' 'noMedley' 'noYear' 'with Duo' 'withScore' 'noScore'`)
    }
  }
}

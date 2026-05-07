import * as fs from 'fs'
import PDFDocument = require('pdfkit')
import * as conf from './configuration'
import { Song, songs } from './song'

/**
 * Generates PDF song lists based on configured job type.
 */
export class Job {
  /**
   * Creates the PDF output with songs that match the provided predicate.
   */
  private static list(predicate: (song: Song) => boolean) {
    const pdf = new PDFDocument({margin: conf.margin, size: conf.size, layout: conf.layout})
    pdf.pipe(fs.createWriteStream(conf.output))
    pdf.fontSize(conf.fontSize)
    songs.filter(predicate).forEach(song => song.addInfo(pdf, conf.format))
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

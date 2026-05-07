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
   * If groupByArtist is true, prints a bold artist header before each new artist's first song.
   */
  private static list(predicate: (song: Song) => boolean, groupByArtist: boolean) {
    const pdf = new PDFDocument({margin: conf.margin, size: conf.size, layout: conf.layout})
    pdf.pipe(fs.createWriteStream(conf.output))
    pdf.fontSize(conf.fontSize)
    let currentArtist = ''
    songs.filter(predicate).forEach(song => {
      if (groupByArtist && song.artist !== currentArtist) {
        currentArtist = song.artist
        pdf.font('Courier-Bold').text(currentArtist).font('Courier')
      }
      song.addInfo(pdf, conf.format)
    })
    pdf.end()
  }

  /**
   * Executes the configured job type and writes the corresponding song list.
   */
  static execute() {
    const groupByArtist = conf.options.split('.').some(option => option === 'ga')
    switch (conf.job) {
      case 'printList': return this.list(song => true, groupByArtist)
      case 'noVideos':  return this.list(song => !song.video, groupByArtist)
      case 'noMedley':  return this.list(song => !song.medley, groupByArtist)
      case 'noYear':    return this.list(song => song.year.length !== 4, groupByArtist)
      case 'withDuo':   return this.list(song => song.duo, groupByArtist)
      case 'withScore': return this.list(song => song.scores.length !== 0, groupByArtist)
      case 'noScore':   return this.list(song => song.scores.length === 0, groupByArtist)
      default: console.log(`Please provide a valid job: 'printList' 'noVideos' 'noMedley' 'noYear' 'with Duo' 'withScore' 'noScore'`)
    }
  }
}

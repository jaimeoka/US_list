import * as fs from 'fs'
import PDFDocument = require('pdfkit')
import * as conf from './configuration'
import { Song, songs } from './song'

/**
 * Generates PDF song lists based on configured job type.
 */
export class Job {
  private static readonly groupHeaderIndent = 14
  private static readonly groupHeaderPaddingX = 6
  private static readonly groupHeaderPaddingTop = 2
  private static readonly groupHeaderPaddingBottom = 1
  private static readonly groupHeaderGap = 2
  private static readonly groupSpacing = 0.5

  private static ensureGroupFits(pdf: PDFKit.PDFDocument, isFirstGroup: boolean) {
    const lineHeight = pdf.currentLineHeight(true)
    const spacingBefore = isFirstGroup ? 0 : lineHeight * this.groupSpacing
    const headerHeight = conf.fontSize + this.groupHeaderPaddingTop + this.groupHeaderPaddingBottom
    const requiredHeight = spacingBefore + headerHeight + this.groupHeaderGap + lineHeight
    const pageBottom = pdf.page.height - pdf.page.margins.bottom

    if (pdf.y + requiredHeight > pageBottom) pdf.addPage()
  }

  private static printArtistHeader(pdf: PDFKit.PDFDocument, artist: string, isFirstGroup: boolean) {
    this.ensureGroupFits(pdf, isFirstGroup)
    if (!isFirstGroup) pdf.moveDown(this.groupSpacing)

    const headerFontSize = conf.fontSize
    pdf.font('Courier-Bold').fontSize(headerFontSize)
    const textWidth = pdf.widthOfString(artist)
    const boxWidth = textWidth + this.groupHeaderPaddingX * 2
    const boxHeight = headerFontSize + this.groupHeaderPaddingTop + this.groupHeaderPaddingBottom
    const x = conf.margin
    const y = pdf.y

    pdf.save()
    pdf.rect(x, y, boxWidth, boxHeight).fill('#203A43')
    pdf.fillColor('#FFFFFF')
    pdf.font('Courier-Bold').fontSize(headerFontSize)
    pdf.text(artist, x + this.groupHeaderPaddingX, y + this.groupHeaderPaddingTop, {
      lineBreak: false,
    })
    pdf.restore()

    pdf.font('Courier').fontSize(conf.fontSize)
    pdf.fillColor('#000000')
    pdf.y = y + boxHeight + this.groupHeaderGap
  }

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
        const isFirstGroup = currentArtist === ''
        currentArtist = song.artist
        this.printArtistHeader(pdf, currentArtist, isFirstGroup)
        pdf.x = conf.margin + this.groupHeaderIndent
      }
      else if (groupByArtist) pdf.x = conf.margin + this.groupHeaderIndent
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

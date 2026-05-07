import * as SQL from 'sqlite3'
import { exit } from 'process'
import * as conf from './configuration'
import { Job } from './jobs'

/** Represents a score row retrieved from the Ultrastar database. */
export interface DbScore {
  Artist: string
  Title: string
  Difficulty: number
  Player: string
  Score: number
  Date: number
}

/** Provides access to the Ultrastar SQLite database. */
export class Db {
  /**
   * Reads all scores from the database and populates the provided song map.
   * Calls `Job.execute()` once loading is complete.
   * @param songMap - Map of song keys to Song objects to populate with scores.
   */
  static read(songMap: Map<string, {scores: {score: number, player: string, difficulty: number, date: number}[]}>) {
    const db = new SQL.Database(conf.db)
    try {
      db.all('select Artist, Title, Player, Score, Date from us_songs s, us_scores r where s.ID = r.SongID', (error: Error, rows: DbScore[]) => {
        if (!rows) {
          console.log('Error accessing the database, please check the path: ' + conf.db)
          exit(1)
        }
        rows.forEach(row => {
          const artist = row.Artist
          const title = row.Title
          // The entries in Ultrastar.db have a null at the end, it must be removed
          const key = artist.substring(0, artist.length - 1) + '.' + title.substring(0, title.length - 1)
          const song = songMap.get(key)
          if (song) song.scores.push({score: row.Score, player: row.Player.substring(0, row.Player.length - 1), difficulty: row.Difficulty, date: row.Date})
        })
        db.close()
        Job.execute()
      })
    } catch (error) {
      console.log('Error accessing the database, please check the path: ' + conf.db)
      exit(1)
    }
  }
}

import * as conf from './configuration'
import { Job } from './jobs'
import { Db } from './db'
import { Song, songs, songMap } from './song'

// Step 1: Scan the configured directory for UltraStar TXT files and populate the songs list.
// If the directory is unreadable or yields no songs, log the issue and exit early.
try {
  Song.read(conf.path)
  if (songs.length === 0) {
    console.log('No songs found, please check the directory: ' + conf.path)
    process.exit(0)
  }
} catch (error) {
  console.log('Error reading the songs, please check the directory: ' + conf.path)
  process.exit(1)
}

// Step 2: Apply any sort options from the configuration (e.g. 'sa' sorts by artist, 'st' by title).
// Multiple sort options can be chained in conf.options using '.' as a separator.
conf.options.split('.').forEach(option => {
  if (option.startsWith('s')) Song.sort(songs, option.substring(option.length - 1))
})

// Step 3: Execute the job. If database enrichment is enabled, first load scores from the
// Ultrastar SQLite DB into the song map, then execute. Otherwise execute directly.
if (conf.checkDb) Db.read(songMap, () => Job.execute())
else Job.execute()
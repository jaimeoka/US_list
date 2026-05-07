import * as conf from './configuration'
import { Job } from './jobs'
import { Db } from './db'
import { Song, songs, songMap } from './song'



Job.init({
  songs,
  readSongs: () => Song.read(conf.path),
  sortSongs: (sortBy: string) => Song.sort(songs, sortBy),
  readDb: () => Db.read(songMap)
})
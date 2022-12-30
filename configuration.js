// File name
module.exports.output = 'songsCastellanoNoScore.pdf'
// Page margin
module.exports.margin = 25
// Page layout: 'portrait' 'landscape'
module.exports.layout = 'landscape'
// Default font
module.exports.fontSize = 12
// Font when entry too long
module.exports.fontSizeSmall = 10
// Entries longer than this use small font
module.exports.tooLong = 20
// Page size
module.exports.size = 'A4'
// Song directory
module.exports.path = 'C:\\US\\songs\\Castellano'
/*
Format for the song information.
Entries are separated by '.'
a: artist
t: title
l: language
y: year
g: genre
c: creator
v: video
d: duo
m: medley
h: high score in the database
x: free text
b after the format indicates bold.
Examples:
'l.x - .a.x - .t' => English - Frank Sinatra - Fly me to the moon
'a.x - .t.x (.y.x) .h' => Frank Sinatra - Fly me to the moon (1963) Singer1(8250)
*/
module.exports.format = 'ab.x - .t.x (.y.x).v.d.hb'
/*
Extra options
Firt character: s => sort songs
Second character
a: by artist
t: by title
l: by language
y: by year
g: by genre
c: by creator
*/
module.exports.options = 'sa.sl'
/*
job:
'printList': List all songs
'noVideos': List songs without videos
'noMedley': List songs without medley
'noYear': List songs without year
'with Duo': List songs with duo
'withScore': List songs with score
'noScore': List songs without score
*/
module.exports.job = 'noScore'
// check scores in the Database, false if high score is not needed
module.exports.checkDb = true
// Path to Ultrastar DB
module.exports.db = 'C:\\Users\\49172\\AppData\\Roaming\\ultrastardx\\Ultrastar.db'

import * as http from 'http'
import * as fs from 'fs'
import { exec } from 'child_process'
import * as path from 'path'

const PORT      = 3000
const indexJs   = path.join(__dirname, 'index.js')
const publicDir = path.join(__dirname, '..', 'public')

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
}

function requiresDb(format: string, job: string) {
  const hasHighScoreItem = format
    .split('.')
    .some(item => item.trim().startsWith('h'))
  const isScoreJob = job === 'withScore' || job === 'noScore'
  return hasHighScoreItem || isScoreJob
}

function serveStatic(url: string, res: http.ServerResponse) {
  const filePath = path.join(publicDir, url === '/' ? 'index.html' : url)
  // Prevent path traversal outside public/
  if (!filePath.startsWith(publicDir + path.sep) && filePath !== publicDir) {
    res.writeHead(403)
    res.end()
    return
  }
  const ext  = path.extname(filePath)
  const mime = MIME[ext] ?? 'application/octet-stream'
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return }
    res.writeHead(200, { 'Content-Type': mime })
    res.end(data)
  })
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  const url = req.url ?? '/'

  // Serve static files (GET)
  if (req.method === 'GET') {
    serveStatic(url, res)
    return
  }

  // Run a job
  if (req.method === 'POST' && url === '/run') {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => {
      let config: Record<string, string>
      try {
        config = JSON.parse(body)
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ success: false, message: 'Invalid JSON payload.' }))
        return
      }

      const env: NodeJS.ProcessEnv = {
        ...process.env,
        US_FORMAT:         config.format         ?? 'ab.x - .t.x (.y.x).v.d.hb',
        US_JOB:            config.job            ?? 'printList',
      }

      const forcedCheckDb = requiresDb(env.US_FORMAT, env.US_JOB)

      const mergedEnv: NodeJS.ProcessEnv = {
        ...process.env,
        US_PATH:           config.path          ?? '',
        US_OUTPUT:         config.output         ?? 'songs.pdf',
        US_LAYOUT:         config.layout         ?? 'portrait',
        US_SIZE:           config.size           ?? 'A4',
        US_MARGIN:         String(config.margin  ?? 25),
        US_FONTSIZE:       String(config.fontSize ?? 12),
        US_FONTSIZE_SMALL: String(config.fontSizeSmall ?? 10),
        US_FORMAT:         env.US_FORMAT,
        US_OPTIONS:        config.options        ?? '',
        US_JOB:            env.US_JOB,
        US_CHECK_DB:       String(forcedCheckDb),
        US_DB:             config.db             ?? '',
      }

      exec(`node "${indexJs}"`, { env: mergedEnv, timeout: 120_000 }, (error, stdout, stderr) => {
        const combined = [stdout, stderr].filter(Boolean).join('\n').trim()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        if (error) {
          res.end(JSON.stringify({ success: false, message: combined || error.message }))
        } else {
          res.end(JSON.stringify({ success: true, message: combined || 'PDF generated successfully!' }))
        }
      })
    })
    return
  }

  res.writeHead(404)
  res.end()
})

server.listen(PORT, () => {
  console.log(`UltraStar GUI  ->  http://localhost:${PORT}`)
})

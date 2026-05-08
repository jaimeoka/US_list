import * as http from 'http'
import * as fs from 'fs'
import { exec, execFile } from 'child_process'
import * as path from 'path'

const PORT      = 3000
const indexJs   = path.join(__dirname, 'index.js')
const publicDir = path.join(__dirname, '..', 'public')

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
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

function sendJson(res: http.ServerResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

function readJsonBody(req: http.IncomingMessage): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON payload.'))
      }
    })
    req.on('error', reject)
  })
}

function openNativePicker(kind: 'directory' | 'file', initialPath = ''): Promise<string | null> {
  if (process.platform !== 'win32') {
    return Promise.reject(new Error('Native file dialogs are only implemented for Windows in browser mode.'))
  }

  const resolvedInitialPath = initialPath.trim()
  const script = kind === 'directory'
    ? [
        'Add-Type -AssemblyName System.Windows.Forms',
        '$dialog = New-Object System.Windows.Forms.FolderBrowserDialog',
        '$dialog.Description = "Select the UltraStar songs directory"',
        '$selectedPath = $env:US_PICKER_INITIAL_PATH',
        'if ($selectedPath -and (Test-Path -LiteralPath $selectedPath -PathType Container)) { $dialog.SelectedPath = $selectedPath }',
        '$result = $dialog.ShowDialog()',
        'if ($result -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Write-Output $dialog.SelectedPath }',
      ].join('; ')
    : [
        'Add-Type -AssemblyName System.Windows.Forms',
        '$dialog = New-Object System.Windows.Forms.OpenFileDialog',
        '$dialog.Title = "Select the UltraStar database file"',
        '$dialog.Filter = "SQLite database (*.db)|*.db|All files (*.*)|*.*"',
        '$dialog.CheckFileExists = $true',
        '$dialog.RestoreDirectory = $true',
        '$selectedPath = $env:US_PICKER_INITIAL_PATH',
        '$defaultDirectory = Join-Path ([Environment]::GetFolderPath("ApplicationData")) "ultrastardx"',
        'if ($selectedPath) {',
        '  if (Test-Path -LiteralPath $selectedPath -PathType Container) {',
        '    $dialog.InitialDirectory = $selectedPath',
        '  } elseif (Test-Path -LiteralPath $selectedPath -PathType Leaf) {',
        '    $dialog.InitialDirectory = [System.IO.Path]::GetDirectoryName($selectedPath)',
        '    $dialog.FileName = $selectedPath',
        '  } else {',
        '    $parentPath = [System.IO.Path]::GetDirectoryName($selectedPath)',
        '    if ($parentPath -and (Test-Path -LiteralPath $parentPath -PathType Container)) { $dialog.InitialDirectory = $parentPath }',
        '    $leafName = [System.IO.Path]::GetFileName($selectedPath)',
        '    if ($leafName) { $dialog.FileName = $leafName }',
        '  }',
        '}',
        'if (-not $dialog.InitialDirectory -and (Test-Path -LiteralPath $defaultDirectory -PathType Container)) { $dialog.InitialDirectory = $defaultDirectory }',
        'if (-not $dialog.FileName) { $dialog.FileName = "Ultrastar.db" }',
        '$result = $dialog.ShowDialog()',
        'if ($result -eq [System.Windows.Forms.DialogResult]::OK) { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Write-Output $dialog.FileName }',
      ].join('; ')

  return new Promise((resolve, reject) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-STA', '-Command', script],
      {
        env: {
          ...process.env,
          US_PICKER_INITIAL_PATH: resolvedInitialPath,
        },
        timeout: 120_000,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(stderr.trim() || error.message))
          return
        }

        const selectedPath = stdout.trim()
        resolve(selectedPath || null)
      },
    )
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

  if (req.method === 'POST' && url === '/pick-path') {
    readJsonBody(req)
      .then(async config => {
        const kind = config.kind === 'file' ? 'file' : config.kind === 'directory' ? 'directory' : null
        if (!kind) {
          sendJson(res, 400, { success: false, message: 'Picker kind must be "directory" or "file".' })
          return
        }

        const selectedPath = await openNativePicker(kind, config.initialPath ?? '')
        sendJson(res, 200, { success: true, path: selectedPath, canceled: !selectedPath })
      })
      .catch(error => {
        sendJson(res, 500, {
          success: false,
          message: error instanceof Error ? error.message : 'Could not open native picker.',
        })
      })
    return
  }

  // Run a job
  if (req.method === 'POST' && url === '/run') {
    readJsonBody(req)
      .then(config => {
        const env: NodeJS.ProcessEnv = {
          ...process.env,
          US_FORMAT:         config.format         ?? 'ab.x - .t.x (.y.x).v.d.hb',
          US_JOB:            config.job            ?? 'printList',
        }

        const forcedCheckDb = requiresDb(env.US_FORMAT ?? '', env.US_JOB ?? '')

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
          sendJson(res, 200, error
            ? { success: false, message: combined || error.message }
            : { success: true, message: combined || 'PDF generated successfully!' })
        })
      })
      .catch(error => {
        sendJson(res, 400, {
          success: false,
          message: error instanceof Error ? error.message : 'Invalid JSON payload.',
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

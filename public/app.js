const PREVIEW_SONG = {
  artist: 'The Beatles',
  title: 'Hey Jude',
  language: 'English',
  genre: 'Rock',
  year: '1968',
  creator: 'JohnDoe',
  video: true,
  duo: false,
  medley: false,
  highScore: 'Paul(9500)',
};

function previewFormat() {
  const format  = document.getElementById('format').value.trim();
  const preview = document.getElementById('format-preview');
  if (!format) { preview.innerHTML = ''; return; }

  const items = format.split('.');
  let html = '<span class="preview-label">Preview &mdash; Hey Jude &middot; The Beatles</span>';

  items.forEach(item => {
    if (!item) return;
    const code = item[0];
    const bold = item.endsWith('b') && item.length > 1;
    let text = null;

    switch (code) {
      case 'a': text = PREVIEW_SONG.artist; break;
      case 't': text = PREVIEW_SONG.title; break;
      case 'l': text = PREVIEW_SONG.language; break;
      case 'g': text = PREVIEW_SONG.genre; break;
      case 'y': text = PREVIEW_SONG.year; break;
      case 'c': text = PREVIEW_SONG.creator; break;
      case 'v': text = PREVIEW_SONG.video   ? 'v' : ' '; break;
      case 'd': text = PREVIEW_SONG.duo     ? 'd' : ' '; break;
      case 'm': text = PREVIEW_SONG.medley  ? 'm' : ' '; break;
      case 'h': text = PREVIEW_SONG.highScore; break;
      case 'x': text = item.substring(1); break;
      default: return;
    }

    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html += bold ? `<strong>${escaped}</strong>` : `<span>${escaped}</span>`;
  });

  preview.innerHTML = html;
}

function toggleDb(cb) {
  document.getElementById('db-section').classList.toggle('hidden', !cb.checked);
}

async function runJob() {
  const btn  = document.getElementById('runBtn');
  const area = document.getElementById('result-area');

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Generating\u2026';

  area.className = 'running';
  area.style.display = 'block';
  area.textContent = 'Running\u2026';

  const sortBy       = document.getElementById('sortBy').value;
  const groupByArtist = document.getElementById('groupByArtist').checked;
  const opts = [];
  if (sortBy) opts.push('s' + sortBy);
  if (groupByArtist) opts.push('ga');

  const payload = {
    path:          document.getElementById('songsPath').value.trim(),
    output:        document.getElementById('outputFile').value.trim(),
    layout:        document.querySelector('input[name="layout"]:checked').value,
    size:          document.getElementById('pageSize').value,
    margin:        document.getElementById('margin').value,
    fontSize:      document.getElementById('fontSize').value,
    fontSizeSmall: document.getElementById('fontSizeSmall').value,
    format:        document.getElementById('format').value.trim(),
    options:       opts.join('.'),
    job:           document.getElementById('job').value,
    checkDb:       String(document.getElementById('checkDb').checked),
    db:            document.getElementById('dbPath').value.trim(),
  };

  try {
    const res  = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    area.className   = data.success ? 'success' : 'error';
    area.textContent = data.success
      ? '\u2705 ' + (data.message || 'PDF generated successfully!')
      : '\u274C ' + (data.message || 'An error occurred.');
  } catch (err) {
    area.className   = 'error';
    area.textContent = '\u274C Could not reach the server: ' + err.message;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '&#9654; Generate PDF';
  }
}

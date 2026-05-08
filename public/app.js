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

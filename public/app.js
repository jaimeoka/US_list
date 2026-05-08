const PREVIEW_SONG = {
  artist: 'The Beatles',
  title: 'Hey Jude',
  genre: 'Rock',
  year: '1968',
  creator: 'JohnDoe',
  video: true,
  duo: false,
  medley: false,
  highScore: 'Paul(9500)',
};

let rememberedGroupByArtist = false;

function t(key, params) {
  if (window.i18n && typeof window.i18n.t === 'function') {
    return window.i18n.t(key, params);
  }
  return key;
}

function hasHighScoreItem(format) {
  return format
    .split('.')
    .some(item => item.trim().startsWith('h'));
}

function isScoreJob(job) {
  return job === 'withScore' || job === 'noScore';
}

function setResultState(type, message) {
  const area = document.getElementById('result-area');
  area.className = type;
  area.style.display = 'block';
  area.textContent = message;
}

function requiresDb() {
  const format = document.getElementById('format').value.trim();
  const job = document.getElementById('job').value;
  return hasHighScoreItem(format) || isScoreJob(job);
}

function syncDbState() {
  const needed = requiresDb();
  const section = document.getElementById('db-section');
  const dbPath = document.getElementById('dbPath');
  const dbState = document.getElementById('db-state');
  const dbBrowseBtn = document.getElementById('dbBrowseBtn');

  section.classList.toggle('hidden', !needed);
  dbPath.disabled = !needed;
  dbBrowseBtn.disabled = !needed;
  dbState.textContent = needed
    ? t('hints.dbRequired')
    : t('hints.dbNotRequired');
}

function syncGroupByArtistState() {
  const sortBy = document.getElementById('sortBy').value;
  const groupByArtist = document.getElementById('groupByArtist');
  const canGroupByArtist = sortBy === 'a';

  if (!groupByArtist.disabled) {
    rememberedGroupByArtist = groupByArtist.checked;
  }

  groupByArtist.disabled = !canGroupByArtist;
  groupByArtist.checked = canGroupByArtist ? rememberedGroupByArtist : false;
}

async function pickNativePath(kind, inputId, button) {
  const input = document.getElementById(inputId);
  const previousLabel = button.textContent;

  button.disabled = true;
  button.textContent = t('buttons.browsing');

  try {
    const res = await fetch('/pick-path', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind,
        initialPath: input.value.trim(),
      }),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || t('status.pickFailed'));
    }

    if (data.path) {
      input.value = data.path;
      setResultState('success', '\u2705 ' + t('status.pickSuccess'));
    }
  } catch (err) {
    setResultState('error', '\u274C ' + t('status.pickFailedWithMessage', {
      message: err.message,
    }));
  } finally {
    button.disabled = kind === 'file' && !requiresDb();
    button.textContent = previousLabel;
  }
}

function bindPickerButtons() {
  document.querySelectorAll('[data-picker-kind]').forEach(button => {
    button.addEventListener('click', () => {
      pickNativePath(button.dataset.pickerKind, button.dataset.targetInput, button);
    });
  });
}

function previewFormat() {
  const format  = document.getElementById('format').value.trim();
  const preview = document.getElementById('format-preview');
  syncDbState();
  if (!format) { preview.innerHTML = ''; return; }

  const items = format.split('.');
  let html = `<span class="preview-label">${t('preview.label', {
    title: PREVIEW_SONG.title,
    artist: PREVIEW_SONG.artist,
  })}</span>`;

  items.forEach(item => {
    if (!item) return;
    const code = item[0];
    const bold = item.endsWith('b') && item.length > 1;
    let text = null;

    switch (code) {
      case 'a': text = PREVIEW_SONG.artist; break;
      case 't': text = PREVIEW_SONG.title; break;
      case 'l': text = t('preview.sampleLanguage'); break;
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

async function runJob() {
  const btn  = document.getElementById('runBtn');

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> ${t('status.generating')}`;

  setResultState('running', t('status.running'));

  const sortBy = document.getElementById('sortBy').value;
  const groupByArtistInput = document.getElementById('groupByArtist');
  const groupByArtist = !groupByArtistInput.disabled && groupByArtistInput.checked;
  const checkDb = requiresDb();
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
    tooLong:       document.getElementById('tooLong').value,
    format:        document.getElementById('format').value.trim(),
    options:       opts.join('.'),
    job:           document.getElementById('job').value,
    checkDb:       String(checkDb),
    db:            document.getElementById('dbPath').value.trim(),
  };

  try {
    const res  = await fetch('/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    setResultState(data.success ? 'success' : 'error', data.success
      ? '\u2705 ' + (data.message || t('status.successDefault'))
      : '\u274C ' + (data.message || t('status.errorDefault')));
  } catch (err) {
    setResultState('error', '\u274C ' + t('status.serverUnreachable', { message: err.message }));
  } finally {
    btn.disabled = false;
    btn.innerHTML = `&#9654; <span data-i18n="buttons.generatePdf">${t('buttons.generatePdf')}</span>`;
  }
}

async function initUi() {
  if (window.i18n && typeof window.i18n.init === 'function') {
    await window.i18n.init();
  }
  bindPickerButtons();
  rememberedGroupByArtist = document.getElementById('groupByArtist').checked;
  document.getElementById('groupByArtist').addEventListener('change', event => {
    rememberedGroupByArtist = event.target.checked;
  });
  document.getElementById('sortBy').addEventListener('change', syncGroupByArtistState);
  syncDbState();
  syncGroupByArtistState();
  previewFormat();
}

window.addEventListener('i18n:changed', () => {
  syncDbState();
  previewFormat();
});

initUi();

(function () {
  const SUPPORTED_LANGS = ['en', 'es', 'de'];
  const STORAGE_KEY = 'us_lang';

  let currentLang = 'en';
  let messages = {};

  function getNestedValue(obj, key) {
    return key.split('.').reduce((acc, part) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, part)) {
        return acc[part];
      }
      return undefined;
    }, obj);
  }

  function formatTemplate(value, params) {
    if (!params) return value;
    return value.replace(/\{(\w+)\}/g, (_, name) => {
      if (Object.prototype.hasOwnProperty.call(params, name)) {
        return String(params[name]);
      }
      return `{${name}}`;
    });
  }

  function t(key, params) {
    const raw = getNestedValue(messages, key);
    const value = typeof raw === 'string' ? raw : key;
    return formatTemplate(value, params);
  }

  async function loadMessages(lang) {
    const selected = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
    const res = await fetch(`/messages_${selected}.json`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Could not load language file: ${selected}`);
    }
    messages = await res.json();
    currentLang = selected;
  }

  function applyTranslations(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });

    root.querySelectorAll('[data-i18n-html]').forEach(el => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });

    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
    });

    document.title = t('page.title');
  }

  function applyLanguageSelectValue() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = currentLang;
    }
  }

  async function setLanguage(lang) {
    await loadMessages(lang);
    localStorage.setItem(STORAGE_KEY, currentLang);
    applyTranslations();
    applyLanguageSelectValue();
    window.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: currentLang } }));
  }

  async function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const initial = SUPPORTED_LANGS.includes(saved) ? saved : 'en';
    await setLanguage(initial);

    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.addEventListener('change', async event => {
        try {
          await setLanguage(event.target.value);
        } catch {
          await setLanguage('en');
        }
      });
    }
  }

  window.i18n = {
    init,
    t,
    getLanguage: () => currentLang,
    getSupportedLanguages: () => [...SUPPORTED_LANGS],
    setLanguage,
  };
})();

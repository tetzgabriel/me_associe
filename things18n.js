/*! things18n 1.1.0 — tiny i18n for plain HTML, CSS and JS. No build, no dependencies.
    https://meoriente.com.br/indiethings/things18n/ */
(function (root) {
  'use strict';

  var VERSION = '1.1.0';
  var HAS_DOM = typeof document !== 'undefined';
  var RTL = /^(ar|fa|he|iw|ur|ps|sd|ug|yi|dv|ckb)(-|$)/i;

  /* ------------------------------------------------------------------ state */

  var cfg = { default: 'en', param: 'lang', storageKey: 'things18n:lang', warn: true, switcher: null };
  var langs = [];                 // available languages (declared or added), canonical spelling
  var dicts = {};                 // lang -> flat { 'a.b.c': string | pluralObject }
  var meta = {};                  // lang -> { label }
  var requested = [];             // raw tags in priority order (?lang, storage, navigator)
  var explicit = null;            // set by setLang(): wins over everything
  var current = null;
  var listeners = [];
  var warned = {};
  var readyCbs = [];
  var domReady = false;
  var applyQueued = false;
  var styleEl = null;
var debugOn = false;
var missingJs = {};            // keys t() could not find in the current language (for the debug report)
var badgeEl = null;

  /* ---------------------------------------------------------------- helpers */

  function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

  function warn(msg) {
    if (!cfg.warn || warned[msg]) return;
    warned[msg] = 1;
    if (typeof console !== 'undefined' && console.warn) console.warn('[things18n] ' + msg);
  }

  function safeGet(key) { try { return root.localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, v) { try { root.localStorage.setItem(key, v); } catch (e) { /* storage blocked: still works for this visit */ } }

  function base(tag) { return String(tag).toLowerCase().split(/[-_]/)[0]; }

  // Map any BCP-47-ish tag onto one of the available languages: exact → same base → null.
  function match(tag) {
    if (!tag) return null;
    var t = String(tag).replace('_', '-').toLowerCase(), i;
    for (i = 0; i < langs.length; i++) if (langs[i].toLowerCase() === t) return langs[i];
    var b = base(t);
    for (i = 0; i < langs.length; i++) if (base(langs[i]) === b) return langs[i];
    return null;
  }

  function addLang(l) {
    for (var i = 0; i < langs.length; i++) if (langs[i].toLowerCase() === l.toLowerCase()) return langs[i];
    langs.push(l);
    return l;
  }

  function flatten(obj, prefix, out) {
    Object.keys(obj).forEach(function (k) {
      var v = obj[k], key = prefix ? prefix + '.' + k : k;
      if (isObj(v) && !('other' in v)) flatten(v, key, out);  // namespace
      else out[key] = v;                                       // string, or plural {one, other, …}
    });
    return out;
  }

  /* ---------------------------------------------------------- language pick */

  function detect() {
    var list = [], q = null, i;
    if (HAS_DOM && root.location && cfg.param) {
      var m = new RegExp('[?&]' + cfg.param + '=([^&#]*)').exec(root.location.search || '');
      if (m) { try { q = decodeURIComponent(m[1]); } catch (e) { q = m[1]; } }
    }
    if (q) list.push(q);
    var stored = safeGet(cfg.storageKey);
    if (stored) list.push(stored);
    if (typeof navigator !== 'undefined') {
      if (navigator.languages && navigator.languages.length) for (i = 0; i < navigator.languages.length; i++) list.push(navigator.languages[i]);
      else if (navigator.language) list.push(navigator.language);
    }
    return list;
  }

  function resolve() {
    var next = null, i;
    if (explicit) next = match(explicit);
    for (i = 0; !next && i < requested.length; i++) next = match(requested[i]);
    if (!next) next = match(cfg.default) || langs[0] || cfg.default;
    return next;
  }

  /* --------------------------------------------------------------- messages */

  function lookup(key, lang) {
    var d = dicts[lang];
    return d && Object.prototype.hasOwnProperty.call(d, key) ? d[key] : undefined;
  }

  function pluralCategory(lang, n) {
    try { return new Intl.PluralRules(lang).select(n); }
    catch (e) { return n === 1 ? 'one' : 'other'; }
  }

  function choosePlural(entry, lang, params) {
    var n = params && (params.count !== undefined ? params.count : params.n);
    if (n === undefined) return entry.other;
    n = Number(n);
    if (Object.prototype.hasOwnProperty.call(entry, '=' + n)) return entry['=' + n];  // exact beats CLDR (pt: 0 is "one"!)
    var cat = pluralCategory(lang, n);
    return entry[cat] !== undefined ? entry[cat] : entry.other;
  }

  function format(str, params) {
    if (typeof str !== 'string') return str;
    return str.replace(/\{\{|\}\}|\{([A-Za-z0-9_.$-]+)\}/g, function (m, name) {
      if (m === '{{') return '{';
      if (m === '}}') return '}';
      if (params && params[name] !== undefined && params[name] !== null) return String(params[name]);
      warn('missing param {' + name + '} in "' + str + '"');
      return m;
    });
  }

  // Resolve a key to a final string, or `undefined` if no language in the chain has it.
  function resolveKey(key, params, lang) {
    var chain = [lang], i;
    var def = match(cfg.default);
    if (def && def !== lang) chain.push(def);
    for (i = 0; i < chain.length; i++) {
      var v = lookup(key, chain[i]);
      if (v === undefined) continue;
      if (isObj(v)) v = choosePlural(v, chain[i], params);
      return format(v, params);
    }
    return undefined;
  }

  function t(key, params, lang) {
    lang = lang ? (match(lang) || current) : current;
    var out = resolveKey(key, params, lang);
    if (lang !== match(cfg.default) && lookup(key, lang) === undefined) missingJs[key] = lang;
    if (out === undefined) { warn('missing key "' + key + '"'); return key; }
    return out;
  }

  function has(key, lang) { return lookup(key, lang ? match(lang) : current) !== undefined; }

  /* -------------------------------------------------------------------- DOM */

  function parseParams(el) {
    var raw = el.getAttribute('data-i18n-params');
    if (!raw) return undefined;
    try { return JSON.parse(raw); } catch (e) { warn('bad data-i18n-params JSON on <' + el.tagName.toLowerCase() + '>'); return undefined; }
  }

  // The original markup is the last-resort fallback, so authors only write the *other* languages.
  function remember(el) {
    if (!el.__t18) el.__t18 = { text: el.textContent, html: el.innerHTML, attrs: {} };
    return el.__t18;
  }

  // Whitespace-insensitive key for the key-less mode (data-t): the source text IS the key.
  function norm(text) { return String(text).replace(/\s+/g, ' ').trim(); }

  function isMissing(key) { return current !== match(cfg.default) && lookup(key, current) === undefined; }

  function applyEl(el) {
    var orig, v, k, params = parseParams(el), miss = [];

    k = el.getAttribute('data-i18n');
    if (k) {
      orig = remember(el);
      v = resolveKey(k, params, current);
      if (v === undefined) { v = orig.text; if (v === '') warn('missing key "' + k + '"'); }
      if (isMissing(k)) miss.push(k);
      if (el.textContent !== v) el.textContent = v;
    }
    k = el.getAttribute('data-i18n-html');
    if (k) {
      orig = remember(el);
      v = resolveKey(k, params, current);
      if (v === undefined) { v = orig.html; if (v === '') warn('missing key "' + k + '"'); }
      if (isMissing(k)) miss.push(k);
      if (el.innerHTML !== v) el.innerHTML = v;
    }
    k = el.getAttribute('data-i18n-attr');
    if (k) {
      orig = remember(el);
      k.split(';').forEach(function (pair) {
        var i = pair.indexOf(':');
        if (i < 1) return;
        var attr = pair.slice(0, i).trim(), key = pair.slice(i + 1).trim();
        if (!(attr in orig.attrs)) orig.attrs[attr] = el.getAttribute(attr);
        var val = resolveKey(key, params, current);
        if (isMissing(key)) miss.push(key);
        if (val === undefined) val = orig.attrs[attr];
        if (val === null || val === undefined) warn('missing key "' + key + '"');
        else el.setAttribute(attr, val);
      });
    }

    // key-less mode: <h1 data-t>Hello</h1>  +  add('pt-BR', { 'Hello': 'Olá' })
    if (el.hasAttribute('data-t')) {
      orig = remember(el);
      if (el.children.length) {
        warn('data-t on <' + el.tagName.toLowerCase() + '> that contains other elements would lose them; put data-t on the innermost element, or use data-lang blocks / data-i18n-html');
      } else {
        k = norm(orig.text);
        v = resolveKey(k, params, current);
        if (v === undefined) v = format(orig.text, params);
        if (k && isMissing(k)) miss.push(k);
        if (el.textContent !== v) el.textContent = v;
      }
    }
    k = el.getAttribute('data-t-attr');   // <input placeholder="Search" data-t-attr="placeholder aria-label">
    if (k) {
      orig = remember(el);
      k.split(/[\s,;]+/).filter(Boolean).forEach(function (attr) {
        if (!(attr in orig.attrs)) orig.attrs[attr] = el.getAttribute(attr);
        var src = orig.attrs[attr];
        if (src === null || src === undefined) return;
        var key = norm(src), val = resolveKey(key, params, current);
        if (val === undefined) val = format(src, params);
        if (key && isMissing(key)) miss.push(key);
        el.setAttribute(attr, val);
      });
    }

    if (debugOn && miss.length) el.setAttribute('data-i18n-missing', miss.join(' | '));
    else if (el.hasAttribute('data-i18n-missing')) el.removeAttribute('data-i18n-missing');
  }

  function labelFor(l) {
    if (meta[l] && meta[l].label) return meta[l].label;
    try {
      var n = new Intl.DisplayNames([l], { type: 'language' }).of(l);
      if (n) return n.charAt(0).toUpperCase() + n.slice(1);
    } catch (e) { /* old browser */ }
    return l;
  }

  function buildSwitches(rootEl) {
    var boxes = rootEl.querySelectorAll('[data-i18n-switch]');
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i], sig = langs.join('|');
      if (box.__t18sig === sig) continue;       // already built for this set of languages
      box.__t18sig = sig;
      if (box.__t18auto) box.hidden = langs.length < 2;
      box.textContent = '';
      var short = box.getAttribute('data-i18n-switch') === 'short';
      langs.forEach(function (l) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-i18n-set', l);
        b.setAttribute('lang', l);
        b.textContent = short ? base(l).toUpperCase() : labelFor(l);
        if (short) b.title = labelFor(l);
        box.appendChild(b);
      });
    }
  }

  function syncSwitches(rootEl) {
    var btns = rootEl.querySelectorAll('[data-i18n-set]'), i;
    for (i = 0; i < btns.length; i++) {
      var on = match(btns[i].getAttribute('data-i18n-set')) === current;
      btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) btns[i].setAttribute('aria-current', 'true'); else btns[i].removeAttribute('aria-current');
    }
    var sels = rootEl.querySelectorAll('select[data-i18n-select]');
    for (i = 0; i < sels.length; i++) {
      var s = sels[i];
      if (!s.__t18built && !s.options.length) {   // empty select: fill it
        langs.forEach(function (l) { var o = document.createElement('option'); o.value = l; o.textContent = labelFor(l); o.lang = l; s.appendChild(o); });
      }
      s.__t18built = true;
      if (s.value !== current) s.value = current;
    }
  }

  var SEL = '[data-i18n],[data-i18n-html],[data-i18n-attr],[data-t],[data-t-attr]';

  function ensureAutoSwitcher() {
    if (!cfg.switcher || !document.body || document.querySelector('[data-i18n-switch]')) return;
    var nav = document.createElement('nav');
    nav.className = 'things18n-switcher';
    nav.setAttribute('data-i18n-switch', 'short');
    nav.setAttribute('data-pos', typeof cfg.switcher === 'string' ? cfg.switcher : 'top-right');
    nav.setAttribute('aria-label', 'Language');
    nav.__t18auto = true;
    document.body.appendChild(nav);
  }

  function apply(rootEl) {
    if (!HAS_DOM) return;
    rootEl = rootEl || document;
    if (rootEl === document) ensureAutoSwitcher();
    buildSwitches(rootEl);
    var nodes = rootEl.querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i++) applyEl(nodes[i]);
    if (rootEl.nodeType === 1 && rootEl.matches(SEL)) applyEl(rootEl);
    syncSwitches(rootEl);
    if (debugOn) updateBadge();
  }

  // Blocks like <p data-lang="en">…</p><p data-lang="pt-BR">…</p>: CSS shows only the current one.
  // The rules are generated from the available languages, so there is nothing to keep in sync.
  // Low specificity (:where) so a site can restyle the auto-switcher with a one-line rule.
  var SWITCHER_CSS =
    ':where(.things18n-switcher){position:fixed;z-index:2147483000;display:flex;gap:2px;padding:3px;font:600 13px/1 system-ui,-apple-system,sans-serif;background:rgba(255,255,255,.94);color:#222;border-radius:999px;box-shadow:0 1px 8px rgba(0,0,0,.3)}' +
    ':where(.things18n-switcher[hidden]){display:none}' +
    ':where(.things18n-switcher[data-pos="top-right"]){top:12px;right:12px}' +
    ':where(.things18n-switcher[data-pos="top-left"]){top:12px;left:12px}' +
    ':where(.things18n-switcher[data-pos="bottom-right"]){bottom:12px;right:12px}' +
    ':where(.things18n-switcher[data-pos="bottom-left"]){bottom:12px;left:12px}' +
    ':where(.things18n-switcher) button{font:inherit;color:inherit;background:none;border:0;padding:7px 11px;border-radius:999px;cursor:pointer}' +
    ':where(.things18n-switcher) button[aria-pressed="true"]{background:#222;color:#fff}' +
    '@media (prefers-color-scheme:dark){:where(.things18n-switcher){background:rgba(30,30,30,.94);color:#eee}:where(.things18n-switcher) button[aria-pressed="true"]{background:#eee;color:#111}}';

  function writeBlockCss() {
    if (!HAS_DOM || !document.head) return;
    var css = '';
    langs.forEach(function (l) {
      css += 'html[lang="' + l + '"] [data-lang]:not([data-lang="' + l + '"]){display:none!important}';
    });
    css += SWITCHER_CSS;
    if (debugOn) css += '[data-i18n-missing]{outline:2px dashed #e0245e!important;outline-offset:2px}';
    if (!styleEl) { styleEl = document.createElement('style'); styleEl.setAttribute('data-things18n', ''); document.head.appendChild(styleEl); }
    if (styleEl.textContent !== css) styleEl.textContent = css;
  }

  function setHtmlLang() {
    if (!HAS_DOM) return;
    var h = document.documentElement;
    if (h.getAttribute('lang') !== current) h.setAttribute('lang', current);
    h.setAttribute('dir', RTL.test(current) ? 'rtl' : 'ltr');
  }

  /* ------------------------------------------------------------------ debug */

  function paramsOf(v) {
    var strs = typeof v === 'string' ? [v] : Object.keys(v).map(function (k) { return String(v[k]); }), set = {};
    strs.forEach(function (x) { (x.replace(/\{\{|\}\}/g, '').match(/\{[A-Za-z0-9_.$-]+\}/g) || []).forEach(function (p) { set[p] = 1; }); });
    return Object.keys(set).sort().join(', ');
  }

  // Dictionary health, across ALL languages: keys one language has and another lacks, and keys whose
  // {params} differ between languages. (The default language may legitimately lack keys: its text is in the HTML.)
  function parity() {
    var def = match(cfg.default), have = Object.keys(dicts), all = {}, out = { missing: {}, params: [] };
    have.forEach(function (l) { Object.keys(dicts[l]).forEach(function (k) { all[k] = 1; }); });
    langs.forEach(function (l) { if (l !== def && !dicts[l]) out.missing[l] = ['(no dictionary added)']; });
    Object.keys(all).forEach(function (k) {
      have.forEach(function (l) { if (l !== def && !(k in dicts[l])) (out.missing[l] = out.missing[l] || []).push(k); });
      var seen = {}, distinct = [];
      have.forEach(function (l) { if (k in dicts[l]) { var p = paramsOf(dicts[l][k]); seen[l] = p; if (distinct.indexOf(p) < 0) distinct.push(p); } });
      if (distinct.length > 1) out.params.push(k + '  ' + Object.keys(seen).map(function (l) { return l + ' [' + seen[l] + ']'; }).join(' vs '));
    });
    return out;
  }

  // Which elements and keys have no translation in the current language, and how many
  // <... data-lang="x"> blocks exist per language (a lopsided count means a forgotten block).
  function report(print) {
    var out = { lang: current, default: match(cfg.default), missing: [], js: Object.keys(missingJs).filter(function (k) { return missingJs[k] === current; }), blocks: {}, lopsidedBlocks: false, dictionary: parity() };
    if (HAS_DOM) {
      var els = document.querySelectorAll('[data-i18n-missing]'), i, counts = document.querySelectorAll('[data-lang]');
      for (i = 0; i < els.length; i++) out.missing.push({ key: els[i].getAttribute('data-i18n-missing'), tag: els[i].tagName.toLowerCase(), element: els[i] });
      for (i = 0; i < counts.length; i++) { var l = counts[i].getAttribute('data-lang'); out.blocks[l] = (out.blocks[l] || 0) + 1; }
      var n = Object.keys(out.blocks).map(function (k) { return out.blocks[k]; });
      out.lopsidedBlocks = n.length > 1 && Math.min.apply(null, n) !== Math.max.apply(null, n);
    }
    if (print && typeof console !== 'undefined') {
      console.group('[things18n] ' + current + (hasProblems(out) ? '' : ' — nothing missing'));
      if (out.missing.length) console.warn(out.missing.length + ' element(s) with no ' + current + ' translation (outlined in red):', out.missing.map(function (m) { return m.key; }));
      if (out.js.length) console.warn('t() keys with no ' + current + ' translation:', out.js);
      if (out.lopsidedBlocks) console.warn('data-lang blocks per language are uneven:', out.blocks);
      Object.keys(out.dictionary.missing).forEach(function (l) { console.warn(l + ' dictionary is missing ' + out.dictionary.missing[l].length + ' key(s) that other languages have:', out.dictionary.missing[l]); });
      if (out.dictionary.params.length) console.warn('{params} differ between languages for:', out.dictionary.params);
      console.groupEnd();
    }
    return out;
  }

  function hasProblems(r) {
    return !!(r.missing.length || r.js.length || r.lopsidedBlocks || Object.keys(r.dictionary.missing).length || r.dictionary.params.length);
  }

  function updateBadge() {
    if (!HAS_DOM || !document.body) return;
    if (!badgeEl) {
      badgeEl = document.createElement('div');
      badgeEl.className = 'things18n-debug';
      badgeEl.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483001;font:12px/1.4 ui-monospace,monospace;background:#111;color:#fff;padding:6px 10px;border-radius:6px;box-shadow:0 1px 8px rgba(0,0,0,.4);pointer-events:none;max-width:70vw';
      document.body.appendChild(badgeEl);
    }
    var r = report(false), b = Object.keys(r.blocks).map(function (k) { return k + ':' + r.blocks[k]; }).join(' ');
    var gaps = Object.keys(r.dictionary.missing).reduce(function (n, l) { return n + r.dictionary.missing[l].length; }, 0);
    badgeEl.textContent = 'things18n debug · ' + current + ' · ' + r.missing.length + ' missing' + (r.js.length ? ' + ' + r.js.length + ' in t()' : '') +
      (gaps ? ' · ' + gaps + ' dictionary gap' + (gaps === 1 ? '' : 's') : '') + (r.dictionary.params.length ? ' · ' + r.dictionary.params.length + ' param mismatch' : '') + (b ? ' · blocks ' + b : '');
    badgeEl.style.background = hasProblems(r) ? '#b3123f' : '#157347';
  }

  function debug(on) {
    debugOn = on !== false;
    if (!debugOn && badgeEl) { badgeEl.remove(); badgeEl = null; }
    writeBlockCss();
    if (domReady) { apply(); if (debugOn) report(true); }
    return debugOn;
  }

  /* ----------------------------------------------------------------- update */

  function emit(prev) {
    listeners.slice().forEach(function (cb) { try { cb(current, prev); } catch (e) { if (typeof console !== 'undefined') console.error(e); } });
    if (HAS_DOM && typeof CustomEvent === 'function') {
      document.dispatchEvent(new CustomEvent('things18n:change', { detail: { lang: current, previous: prev } }));
    }
  }

  // Recompute the language from what we know, update <html lang>, and re-render if it moved.
  function refresh(forceApply) {
    var prev = current;
    current = resolve();
    setHtmlLang();
    writeBlockCss();
    if (domReady) { if (forceApply || current !== prev) apply(); }
    if (prev !== null && current !== prev) emit(prev);
  }

  function queueApply() {
    if (!domReady || applyQueued) return;
    applyQueued = true;
    Promise.resolve().then(function () { applyQueued = false; apply(); });
  }

  /* -------------------------------------------------------------- public API */

  function init(opts) {
    opts = opts || {};
    if (opts.default) cfg.default = opts.default;
    if (opts.param !== undefined) cfg.param = opts.param;
    if (opts.storageKey) cfg.storageKey = opts.storageKey;
    if (opts.warn !== undefined) cfg.warn = !!opts.warn;
    if (opts.switcher !== undefined) cfg.switcher = opts.switcher || null;
    if (opts.langs) opts.langs.forEach(addLang);
    addLang(cfg.default);
    requested = detect();
    refresh(true);
    return api;
  }

  function add(lang, messages, options) {
    var canon = addLang(lang);
    dicts[canon] = dicts[canon] || {};
    flatten(messages || {}, '', dicts[canon]);
    if (options && options.label) meta[canon] = { label: options.label };
    refresh(false);
    queueApply();
    return api;
  }

  function setLang(lang) {
    var m = match(lang);
    if (!m) { warn('unsupported language "' + lang + '"'); return false; }
    explicit = m;
    safeSet(cfg.storageKey, m);
    syncUrl(m);
    refresh(true);
    return true;
  }

  // If the URL carries ?lang=xx, keep it in step with the user's choice so a reload doesn't undo it.
  function syncUrl(lang) {
    if (!HAS_DOM || !cfg.param || !root.history || !root.history.replaceState) return;
    var re = new RegExp('([?&]' + cfg.param + '=)[^&#]*');
    if (!re.test(root.location.search)) return;
    try { root.history.replaceState(null, '', root.location.pathname + root.location.search.replace(re, '$1' + encodeURIComponent(lang)) + root.location.hash); } catch (e) { /* file:// quirks */ }
  }

  function onChange(cb) {
    listeners.push(cb);
    return function () { var i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); };
  }

  function ready(cb) { if (domReady) cb(api); else readyCbs.push(cb); }

  function pick(obj, lang) {
    if (!isObj(obj)) return obj;
    lang = lang ? (match(lang) || current) : current;
    var k, b = base(lang);
    if (obj[lang] !== undefined) return obj[lang];
    for (k in obj) if (base(k) === b) return obj[k];
    var def = match(cfg.default);
    if (def && obj[def] !== undefined) return obj[def];
    for (k in obj) return obj[k];
    return undefined;
  }

  function formatNumber(n, o) { try { return new Intl.NumberFormat(current, o).format(n); } catch (e) { return String(n); } }
  function formatDate(d, o) {
    try { return new Intl.DateTimeFormat(current, o || { year: 'numeric', month: 'long', day: 'numeric' }).format(d instanceof Date ? d : new Date(d)); }
    catch (e) { return String(d); }
  }

  var api = {
    version: VERSION,
    init: init, add: add, t: t, has: has, apply: apply, pick: pick,
    setLang: setLang, onChange: onChange, ready: ready, debug: debug, report: function () { return report(true); },
    formatNumber: formatNumber, formatDate: formatDate,
    get lang() { return current; },
    get langs() { return langs.slice(); },
    get default() { return match(cfg.default) || cfg.default; }
  };

  /* ------------------------------------------------------------------ start */

  if (HAS_DOM) {
    // <script src="things18n.js" data-langs="en,pt-BR" data-default="en"></script>
    var s = document.currentScript, o = {};
    if (s) {
      if (s.getAttribute('data-langs')) o.langs = s.getAttribute('data-langs').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      if (s.getAttribute('data-default')) o.default = s.getAttribute('data-default').trim();
      if (s.hasAttribute('data-param')) o.param = s.getAttribute('data-param');
      if (s.getAttribute('data-storage-key')) o.storageKey = s.getAttribute('data-storage-key');
      if (s.hasAttribute('data-quiet')) o.warn = false;
      if (s.hasAttribute('data-switcher')) o.switcher = s.getAttribute('data-switcher') || 'top-right';
    }
    // zero config: the language your HTML is written in is whatever <html lang> says
    if (!o.default && document.documentElement.getAttribute('lang')) o.default = document.documentElement.getAttribute('lang');
    if (/[?&]i18n=debug\b/.test(root.location && root.location.search || '')) debugOn = true;
    init(o);

    document.addEventListener('click', function (e) {
      var b = e.target && e.target.closest && e.target.closest('[data-i18n-set]');
      if (b) { e.preventDefault(); setLang(b.getAttribute('data-i18n-set')); return; }
      var tg = e.target && e.target.closest && e.target.closest('[data-i18n-toggle]');
      if (tg) { e.preventDefault(); setLang(langs[(langs.indexOf(current) + 1) % langs.length]); }
    });
    document.addEventListener('change', function (e) {
      var sel = e.target && e.target.matches && e.target.matches('select[data-i18n-select]') ? e.target : null;
      if (sel) setLang(sel.value);
    });
    // another tab changed the language: follow it
    root.addEventListener('storage', function (e) {
      if (e.key === cfg.storageKey && e.newValue && match(e.newValue) && match(e.newValue) !== current) { explicit = match(e.newValue); refresh(true); }
    });

    var go = function () {
      domReady = true;
      apply();
      if (debugOn) report(true);
      readyCbs.splice(0).forEach(function (cb) { try { cb(api); } catch (err) { if (typeof console !== 'undefined') console.error(err); } });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  } else {
    init({});
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.things18n = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* Interface, efeitos, persistência e controles (toque + arrastar). Regras ficam em core.js. */
(function () {
  'use strict';

  var Core = window.Core;
  var BANK = window.WORD_BANK;
  var P = Core.P;
  var MODE_KEY = 'associe:mode:v1';
  var KEYS = {
    normal: { save: 'associe:v2', recent: 'associe:recent:v1' },
    med: { save: 'associe:med:v1', recent: 'associe:med-recent:v1' }
  };
  var MAX_HISTORY = 1500;
  var REDUCED = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  var topEl = document.getElementById('top');
  var boardEl = document.getElementById('board');
  var tableEl = document.getElementById('table');
  var statusEl = document.getElementById('status');
  var doneEl = document.getElementById('done');
  var timeEl = document.getElementById('time');
  var toastEl = document.getElementById('toast');
  var winEl = document.getElementById('win');
  var winTimeEl = document.getElementById('win-time');
  var canvas = document.getElementById('fx');
  var undoBtn = document.getElementById('undo');
  var hintBtn = document.getElementById('hint');
  var newBtn = document.getElementById('new');
  var modeBtn = document.getElementById('mode');
  var areaEl = document.getElementById('area');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  var mode = 'normal';   // 'normal' | 'med' (cada modo tem a sua partida salva)

  // game: estado do Core + { v, cats, history, startedAt, finishedAt }
  var game = null;
  var sel = null;        // origem selecionada por toque (src do Core)
  var hint = null;       // { src, dst }
  var drag = null;
  var celeb = null;      // { slot, cat }: fundação mostrada como completa por um instante
  var shownDone = 0;     // quantas categorias completas já foram exibidas (para animar só a nova)
  var winTimer = 0;

  // Efeitos de um único render (consumidos em takeFx).
  var fx = emptyFx();
  fx.deal = true;
  function emptyFx() { return { deal: false, land: {}, flip: {}, pop: {}, wasteFlip: false, shake: false }; }
  function takeFx() { var f = fx; fx = emptyFx(); return f; }

  /* ---------- util ---------- */

  function rnd(n) {
    if (window.crypto && window.crypto.getRandomValues) {
      var buf = new Uint32Array(1);
      var max = Math.floor(4294967296 / n) * n;
      do { window.crypto.getRandomValues(buf); } while (buf[0] >= max);
      return buf[0] % n;
    }
    return Math.floor(Math.random() * n);
  }

  function store(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* sem storage: segue sem salvar */ }
  }
  function load(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function cardText(id) {
    var cat = game.cats[Core.catOf(id)];
    return Core.isCat(id) ? cat.nome : cat.palavras[(id & 7) - 1];
  }

  function snapshot() { return Core.clone(game); }

  function takeState(s) {
    game.cols = s.cols; game.down = s.down; game.slots = s.slots; game.fc = s.fc;
    game.top = s.top; game.pool = s.pool; game.ptr = s.ptr;
  }

  function validSave(g) {
    if (!g || g.v !== 2 || !Array.isArray(g.cols) || !Array.isArray(g.down) || !Array.isArray(g.slots) ||
        !Array.isArray(g.fc) || !Array.isArray(g.top) || !Array.isArray(g.pool) || !Array.isArray(g.cats) ||
        !Array.isArray(g.history) || typeof g.ptr !== 'number') return false;
    if (g.cats.length !== P.CATS || g.fc.length !== P.CATS || g.top.length !== P.CATS ||
        g.slots.length !== P.SLOTS || g.cols.length !== g.down.length || g.ptr < 0 || g.ptr > g.pool.length) return false;
    var total = g.pool.length;
    g.cols.forEach(function (c) { total += c.length; });
    g.fc.forEach(function (n) { if (n >= 0) total += n + 1; });
    return total === P.CATS * (P.WORDS + 1) &&
      g.cats.every(function (c) { return c && c.nome && Array.isArray(c.palavras) && c.palavras.length === P.WORDS; });
  }

  function save() {
    store(KEYS[mode].save, {
      v: 2, cols: game.cols, down: game.down, slots: game.slots, fc: game.fc, top: game.top,
      pool: game.pool, ptr: game.ptr, cats: game.cats, history: game.history,
      startedAt: game.startedAt, finishedAt: game.finishedAt, area: game.area || null, leftAt: game.leftAt || null
    });
  }

  function setStatus(text) { statusEl.textContent = text || ''; }

  /* ---------- tempo ---------- */

  function fmtTime(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var h = Math.floor(total / 3600);
    var m = Math.floor((total % 3600) / 60);
    var s = total % 60;
    var mm = (m < 10 ? '0' : '') + m;
    var ss = (s < 10 ? '0' : '') + s;
    return h > 0 ? h + ':' + mm + ':' + ss : mm + ':' + ss;
  }

  function tick() {
    if (!game || document.hidden) return;
    timeEl.textContent = fmtTime((game.finishedAt || Date.now()) - game.startedAt);
  }

  /* ---------- confete e brilhos ---------- */

  var parts = [];
  var raf = 0;
  var cw = 0, ch = 0;
  var ctx = canvas.getContext && canvas.getContext('2d');
  var COLORS = ['#f0c35a', '#fff2b0', '#7fe0a8', '#38b36e', '#ff7a6b', '#5cc8ff', '#ffffff'];
  var GOLD = ['#f0c35a', '#fff2b0', '#ffffff', '#ffd978'];

  var dpr = 1;
  var MAX_PARTS = 280;

  function sizeCanvas() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cw = window.innerWidth; ch = window.innerHeight;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
  }

  function burst(x, y, n, power, colors) {
    if (REDUCED || !ctx) return;
    colors = colors || COLORS;
    if (!raf) {
      if (cw !== window.innerWidth || ch !== window.innerHeight || !canvas.width) sizeCanvas();
      canvas.style.display = 'block';
    }
    n = Math.min(n, MAX_PARTS - parts.length);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var v = (0.35 + Math.random() * 0.65) * power;
      parts.push({
        x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.5, g: 0.26,
        w: 4 + Math.random() * 5, h: 3 + Math.random() * 4, r: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.4, c: colors[(Math.random() * colors.length) | 0],
        life: 60 + Math.random() * 50
      });
    }
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function loop() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += p.g; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
      if (p.life <= 0 || p.y > ch + 30) { parts[i] = parts[parts.length - 1]; parts.pop(); continue; }
      var cos = Math.cos(p.r) * dpr, sin = Math.sin(p.r) * dpr;
      ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
      ctx.globalAlpha = p.life < 25 ? p.life / 25 : 1;
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    if (parts.length) {
      raf = requestAnimationFrame(loop);
    } else {
      raf = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }

  function burstAt(node, n, power, colors) {
    if (!node) return;
    var r = node.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, n, power, colors);
  }

  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.remove('show');
    void toastEl.offsetWidth; // reinicia a animação
    toastEl.classList.add('show');
  }

  function showWin() {
    winTimeEl.textContent = fmtTime(game.finishedAt - game.startedAt);
    winEl.hidden = false;
    document.getElementById('win-new').focus();
  }

  function hideWin() {
    clearTimeout(winTimer);
    winEl.hidden = true;
  }

  function celebrateWin() {
    [0, 250, 520, 820].forEach(function (delay, k) {
      setTimeout(function () {
        var x = [0.5, 0.2, 0.8, 0.5][k] * cw;
        var y = [0.35, 0.5, 0.5, 0.25][k] * ch;
        burst(x, y, 90, 11);
      }, delay);
    });
    winTimer = setTimeout(showWin, REDUCED ? 100 : 1500);
  }

  /* ---------- novo jogo ---------- */

  function sample(list, n) {
    var from = list.slice();
    var out = [];
    while (out.length < n) out.push(from.splice(rnd(from.length), 1)[0]);
    return out;
  }

  function withWords(cats) {
    return cats.map(function (c) { return { nome: c.nome, palavras: sample(c.palavras, P.WORDS) }; });
  }

  // Modo normal: categorias de qualquer assunto; roda o banco inteiro antes de repetir uma.
  function pickCategories() {
    var recent = load(KEYS.normal.recent) || [];
    var pool = BANK.filter(function (c) { return recent.indexOf(c.nome) < 0; });
    if (pool.length < P.CATS) { recent = []; pool = BANK.slice(); }
    var picked = sample(pool, P.CATS);
    store(KEYS.normal.recent, recent.concat(picked.map(function (c) { return c.nome; })));
    return { cats: withWords(picked), area: null };
  }

  // Modo médico: cada partida é de uma área (Cardiologia, Nefrologia...); passa por todas as áreas
  // antes de repetir uma.
  function pickMedical() {
    var areas = (window.MED_BANK || []).filter(function (a) { return a.cats.length >= P.CATS; });
    if (!areas.length) return pickCategories();
    var recent = load(KEYS.med.recent) || [];
    var pool = areas.filter(function (a) { return recent.indexOf(a.area) < 0; });
    if (!pool.length) { // deu a volta: recomeça, sem repetir a última área logo em seguida
      recent = recent.slice(-1);
      pool = areas.filter(function (a) { return recent.indexOf(a.area) < 0; });
    }
    var area = pool[rnd(pool.length)];
    store(KEYS.med.recent, recent.concat(area.area));
    return { cats: withWords(sample(area.cats, P.CATS)), area: area.area };
  }

  function newGame() {
    var s = Core.newSolvableDeal(rnd, 300) || Core.deal(rnd);
    var pick = mode === 'med' ? pickMedical() : pickCategories();
    game = { v: 2, cats: pick.cats, area: pick.area, history: [], startedAt: Date.now(), finishedAt: null };
    takeState(s);
    sel = null;
    hint = null;
    celeb = null;
    shownDone = 0;
    hideWin();
    setStatus('');
    fx = emptyFx();
    fx.deal = true;
    save();
    render();
  }

  /* ---------- jogadas ---------- */

  function commit(newState) {
    game.history.push(snapshot());
    if (game.history.length > MAX_HISTORY) game.history.shift();
    takeState(newState);
    sel = null;
    hint = null;
    var justWon = Core.isWon(game) && !game.finishedAt;
    if (justWon) game.finishedAt = Date.now();
    save();
    render();
    if (justWon) celebrateWin();
  }

  function doMove(src, dst) {
    var n = Core.apply(game, src, dst);
    var moved = src.t === 'c' ? game.cols[src.c].slice(src.i) : [game.pool[src.idx]];
    var cat = Core.catOf(moved[0]);
    var next = emptyFx();
    if (dst.t === 'c') moved.forEach(function (id) { next.land[id] = 1; });
    if (src.t === 'c' && n.down[src.c] < game.down[src.c] && n.cols[src.c].length) {
      next.flip[n.cols[src.c][n.cols[src.c].length - 1]] = 1;
    }

    var completed = dst.t === 'f' && game.fc[cat] !== P.WORDS && n.fc[cat] === P.WORDS;
    var slot = -1;
    if (dst.t === 'f') {
      if (completed) {
        slot = game.slots.indexOf(cat);
        if (slot < 0) slot = (dst.slot !== undefined && dst.slot !== null && game.slots[dst.slot] === -1)
          ? dst.slot : game.slots.indexOf(-1);
        celeb = { slot: slot, cat: cat };
      } else {
        slot = n.slots.indexOf(cat);
        next.pop[slot] = 1;
      }
    }
    fx = next;
    commit(n);

    if (dst.t === 'f') {
      var slotEl = topEl.querySelectorAll('.slot')[slot];
      if (completed) {
        celebrateCategory(slotEl, cat);
      } else {
        burstAt(slotEl, 9, 4.5, GOLD);
      }
    }
  }

  function celebrateCategory(slotEl, cat) {
    burstAt(slotEl, 70, 10);
    toast(game.cats[cat].nome + ' completa!');
    var mine = celeb;
    setTimeout(function () {
      if (celeb === mine) { celeb = null; render(); }
    }, REDUCED ? 600 : 1500);
  }

  function undo() {
    var prev = game.history.pop();
    if (!prev) return;
    takeState(prev);
    sel = null;
    hint = null;
    celeb = null;
    if (game.finishedAt && !Core.isWon(game)) { game.finishedAt = null; hideWin(); setStatus(''); }
    save();
    render();
  }

  function drawCard() {
    if (!game.pool.length) return;
    fx.wasteFlip = true;
    commit(Core.draw(game));
  }

  function wasteSrc() {
    return game.ptr > 0 ? { t: 'p', idx: game.ptr - 1 } : null;
  }

  function sameSrc(a, b) {
    return a && b && a.t === b.t && (a.t === 'p' || (a.c === b.c && a.i === b.i));
  }

  function slotFor(card, preferred) {
    if (Core.isCat(card)) {
      if (preferred !== undefined && preferred !== null && game.slots[preferred] === -1) return preferred;
      return game.slots.indexOf(-1);
    }
    return game.slots.indexOf(Core.catOf(card));
  }

  var LOCKED_MSG = 'Há uma carta de categoria no topo desta coluna: ela só sai para uma fundação.';
  var CAT_MSG = 'Uma carta de categoria vai para uma fundação, uma coluna vazia ou sobre uma palavra dela.';

  // Por que a carta não pode ir para esta coluna.
  function explainColumn(src, c) {
    if (Core.locked(game, c)) return LOCKED_MSG;
    if (Core.isCat(Core.cardAt(game, src)) && game.cols[c].length) return CAT_MSG;
    return '';
  }

  function explainFoundation(src) {
    return Core.isCat(Core.cardAt(game, src))
      ? 'Todas as fundações estão ocupadas. Complete uma categoria antes.'
      : 'A categoria dessa palavra ainda não está em nenhuma fundação.';
  }

  function showHint() {
    if (Core.isWon(game)) return;
    var r = Core.solve(game, 80000);
    var m = r.path && r.path[0];
    if (!m) {
      if (r.complete) {
        setStatus('Daqui não dá mais para terminar. Use Desfazer.');
        return;
      }
      m = Core.genMoves(game)[0];
    }
    if (!m) {
      setStatus(game.pool.length ? 'Sem jogadas no tabuleiro. Compre cartas do monte.' : 'Sem jogadas possíveis. Use Desfazer.');
      return;
    }
    if (m.src.t === 'p') game.ptr = m.src.idx + 1; // mostra a carta no descarte
    sel = null;
    hint = { src: m.src, dst: m.dst };
    setStatus('');
    render();
  }

  /* ---------- render ---------- */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Maior palavra do texto (5..11): define o tamanho da fonte para não quebrar palavras no meio.
  function lenOf(text) {
    var longest = 0;
    text.split(/[\s-]+/).forEach(function (w) { if (w.length > longest) longest = w.length; });
    return Math.min(11, Math.max(5, longest));
  }

  // Tamanho da letra pelo maior trecho sem quebra: termos médicos longos ("Amiodarona") cabem sem
  // partir no meio da palavra. Mede com canvas, uma vez por texto.
  var measureCanvas = document.createElement('canvas');
  var measureCtx = measureCanvas.getContext && measureCanvas.getContext('2d');
  var emCache = {};
  var G = { colW: 56, cardMax: 12, tabMax: 10, faceMax: 11 };

  function widestEm(text, sans) {
    var key = (sans ? 's:' : 'f:') + text;
    if (emCache[key] !== undefined) return emCache[key];
    var em = 0;
    if (measureCtx) {
      measureCtx.font = sans ? '800 100px system-ui, -apple-system, sans-serif' : '700 100px Georgia, "Times New Roman", serif';
      text.split(/\s+/).forEach(function (word) {
        (word.match(/[^-]+-?/g) || [word]).forEach(function (piece) {
          em = Math.max(em, measureCtx.measureText(piece).width / 100);
        });
      });
    }
    emCache[key] = em;
    return em;
  }

  function fit(node, text, maxPx, availPx, sans) {
    var em = widestEm(text, sans);
    if (!em) return;
    node.style.fontSize = Math.max(5.5, Math.min(maxPx, availPx / em)).toFixed(2) + 'px';
  }

  function measureGeom() {
    var n = game.cols.length;
    var w = boardEl.clientWidth || tableEl.clientWidth || 360;
    var cssW = (Math.min(window.innerWidth - 12, 540) - 20) / 6; // mesma conta do --cardw do CSS
    G = { colW: (w - 4 * (n - 1)) / n, cardMax: Math.min(cssW * .22, 17), tabMax: Math.min(cssW * .17, 12.5), faceMax: Math.min(cssW * .2, 16) };
  }

  function cardEl(id, extra, dataset) {
    var text = cardText(id);
    var b = el('button', 'card' + (Core.isCat(id) ? ' cat' : '') + (extra || ''), text);
    b.type = 'button';
    b.dataset.len = lenOf(text);
    fit(b, text, G.cardMax, G.colW - 7, false);
    b.setAttribute('aria-label', (Core.isCat(id) ? 'Categoria ' : 'Palavra ') + text);
    Object.keys(dataset || {}).forEach(function (k) { b.dataset[k] = dataset[k]; });
    return b;
  }

  function hintSlot() {
    if (!hint || hint.dst.t !== 'f') return -1;
    return slotFor(Core.cardAt(game, hint.src), hint.dst.slot);
  }

  function renderTop(f) {
    topEl.textContent = '';
    var hSlot = hintSlot();
    for (var k = 0; k < P.SLOTS; k++) {
      var cat = game.slots[k];
      var complete = false;
      if (cat < 0 && celeb && celeb.slot === k) { cat = celeb.cat; complete = true; }
      var slot = el('button', 'slot' + (cat < 0 ? ' empty' : '') + (complete ? ' complete' : '') +
        (f.pop[k] ? ' pop' : '') + (hSlot === k ? ' hint-to' : ''));
      slot.type = 'button';
      slot.dataset.slot = k;
      if (cat >= 0) {
        var count = complete ? P.WORDS : game.fc[cat];
        var tab = el('span', 'tab', game.cats[cat].nome);
        tab.dataset.len = lenOf(game.cats[cat].nome);
        fit(tab, game.cats[cat].nome, G.tabMax, G.colW - 5, true);
        slot.appendChild(tab);
        var face = el('span', 'face');
        face.appendChild(el('span', 'count', count + ' / ' + P.WORDS));
        var topId = game.top[cat];
        var topText = topId >= 0 && !Core.isCat(topId) ? cardText(topId) : '';
        face.dataset.len = lenOf(topText || 'x');
        if (topText) fit(face, topText, G.faceMax, G.colW - 9, false);
        face.appendChild(document.createTextNode(topText));
        var bar = el('span', 'bar-fill');
        var fill = el('i');
        fill.style.setProperty('--p', Math.round(count / P.WORDS * 100) + '%');
        bar.appendChild(fill);
        face.appendChild(bar);
        slot.appendChild(face);
        slot.setAttribute('aria-label', 'Categoria ' + game.cats[cat].nome + ', ' + count + ' de ' + P.WORDS);
      } else {
        slot.appendChild(el('span', 'tab'));
        slot.appendChild(el('span', 'face'));
        slot.setAttribute('aria-label', 'Fundação livre');
      }
      topEl.appendChild(slot);
    }

    // descarte
    var waste = el('div', 'pile waste');
    var src = wasteSrc();
    if (src) {
      var extra = '';
      if (sel && sameSrc(sel, src)) extra += ' sel';
      if (hint && sameSrc(hint.src, src)) extra += ' hint-from';
      if (f.wasteFlip) extra += ' drawn';
      if (f.shake && sel && sameSrc(sel, src)) extra += ' shake';
      waste.appendChild(cardEl(game.pool[src.idx], extra, {}));
    } else {
      waste.appendChild(el('div', 'waste-empty'));
    }
    topEl.appendChild(waste);

    // estoque
    var left = game.pool.length - game.ptr;
    var stock = el('button', 'stock' + (left === 0 ? ' empty' : ''));
    stock.type = 'button';
    if (!game.pool.length) {
      stock.disabled = true;
      stock.setAttribute('aria-label', 'Monte vazio');
    } else if (left > 0) {
      stock.textContent = left;
      stock.setAttribute('aria-label', 'Comprar carta, ' + left + ' no monte');
    } else {
      stock.textContent = '↻';
      stock.setAttribute('aria-label', 'Recomeçar o monte');
    }
    topEl.appendChild(stock);
  }

  function renderBoard(f) {
    boardEl.textContent = '';
    game.cols.forEach(function (col, c) {
      var colEl = el('div', 'col' + (col.length ? '' : ' empty') +
        (hint && hint.dst.t === 'c' && hint.dst.c === c ? ' hint-to' : ''));
      colEl.dataset.col = c;
      col.forEach(function (id, i) {
        var b;
        var faceDown = i < game.down[c];
        var anim = '';
        if (f.deal) anim += ' deal';
        else if (f.land[id]) anim += ' land';
        else if (f.flip[id]) anim += ' flipin';
        if (faceDown) {
          b = el('button', 'card down' + anim);
          b.type = 'button';
          b.tabIndex = -1;
          b.setAttribute('aria-label', 'Carta virada para baixo');
          b.dataset.i = i;
        } else {
          var extra = anim;
          var inSel = sel && sel.t === 'c' && sel.c === c && i >= sel.i;
          if (inSel) extra += ' sel';
          if (hint && hint.src.t === 'c' && hint.src.c === c && i >= hint.src.i) extra += ' hint-from';
          if (inSel && f.shake) extra += ' shake';
          b = cardEl(id, extra, { i: i });
        }
        if (f.deal) b.style.animationDelay = (i * 55 + c * 35) + 'ms';
        if (i > 0) {
          var prevDown = i - 1 < game.down[c];
          b.style.marginTop = 'calc(var(' + (prevDown ? '--peek-down' : '--peek-up') + ') - var(--ch))';
        }
        colEl.appendChild(b);
      });
      boardEl.appendChild(colEl);
    });
  }

  // O navegador pode medir o texto diferente do canvas (arredondamento em fontes pequenas): confere
  // no DOM e reduz a letra de quem estourou, para nunca partir uma palavra no meio.
  function shrinkToFit() {
    var nodes = tableEl.querySelectorAll('.card:not(.down), .slot .tab, .slot .face');
    for (var pass = 0; pass < 4; pass++) {
      var over = [];
      for (var k = 0; k < nodes.length; k++) {
        if (nodes[k].scrollWidth > nodes[k].clientWidth + 0.5) over.push(nodes[k]);
      }
      if (!over.length) return;
      var sizes = over.map(function (n) {
        return parseFloat(window.getComputedStyle(n).fontSize) * Math.max(0.75, (n.clientWidth / n.scrollWidth) * 0.97);
      });
      over.forEach(function (n, i) { n.style.fontSize = sizes[i].toFixed(2) + 'px'; });
    }
  }

  function render() {
    var f = takeFx();
    tableEl.style.setProperty('--n', game.cols.length);
    topEl.style.setProperty('--n', game.cols.length);
    boardEl.style.setProperty('--n', game.cols.length);
    measureGeom();
    renderTop(f);
    renderBoard(f);
    shrinkToFit();

    var names = [];
    game.fc.forEach(function (n, c) { if (n === P.WORDS) names.push(game.cats[c].nome); });
    doneEl.textContent = '';
    names.forEach(function (name, k) {
      doneEl.appendChild(el('span', 'chip' + (k >= shownDone ? ' new' : ''), name));
    });
    shownDone = names.length;

    areaEl.textContent = game.area || '';
    undoBtn.disabled = game.history.length === 0;
    var won = Core.isWon(game);
    hintBtn.disabled = won;
    if (won) setStatus('Pronto! Todas as categorias foram completadas.');
    tick();
  }

  /* ---------- toque e arrastar ---------- */

  function srcFromTarget(target) {
    var card = target.closest('.card');
    if (!card || card.classList.contains('down')) return null;
    var col = card.closest('.col');
    if (col) return { t: 'c', c: +col.dataset.col, i: +card.dataset.i };
    if (card.closest('.waste')) return wasteSrc();
    return null;
  }

  function zoneFromTarget(target) {
    var slot = target.closest('.slot');
    if (slot) return { t: 'f', slot: +slot.dataset.slot };
    var col = target.closest('.col');
    if (col) return { t: 'c', c: +col.dataset.col };
    return null;
  }

  // Destino sob o ponteiro (arrastar): qualquer ponto da faixa de cima vale como fundação
  // (a carta vai para a fundação dela); embaixo, a coluna pela faixa horizontal.
  function measure() {
    var slots = topEl.querySelectorAll('.slot');
    var cols = boardEl.children;
    var m = { boardTop: boardEl.getBoundingClientRect().top, topTop: topEl.getBoundingClientRect().top, slots: [], cols: [] };
    for (var k = 0; k < slots.length; k++) {
      var r = slots[k].getBoundingClientRect();
      m.slots.push({ l: r.left, r: r.right });
    }
    for (var c = 0; c < cols.length; c++) {
      var cr = cols[c].getBoundingClientRect();
      m.cols.push({ l: cr.left, r: cr.right });
    }
    return m;
  }

  function zoneAt(x, y, m) {
    if (y < m.boardTop - 4) {
      if (y < m.topTop - 40) return null;
      for (var k = 0; k < m.slots.length; k++) {
        if (x >= m.slots[k].l && x < m.slots[k].r && game.slots[k] === -1) return { t: 'f', slot: k };
      }
      return { t: 'f' };
    }
    for (var c = 0; c < m.cols.length; c++) {
      if (x >= m.cols[c].l - 3 && x < m.cols[c].r + 3) return { t: 'c', c: c };
    }
    return null;
  }

  var targetNode = null;

  function clearTarget() {
    if (targetNode) targetNode.classList.remove('target');
    targetNode = null;
  }

  function markTarget(zone) {
    var node = null;
    if (zone) {
      if (zone.t === 'f') {
        var idx = slotFor(Core.cardAt(game, drag.src), zone.slot);
        node = topEl.querySelectorAll('.slot')[idx];
      } else {
        node = boardEl.children[zone.c];
      }
    }
    if (node === targetNode) return;
    clearTarget();
    if (node) { node.classList.add('target'); targetNode = node; }
  }

  function startGhost() {
    var ghost = el('div', 'ghost');
    var nodes = [];
    if (drag.src.t === 'c') {
      var all = boardEl.children[drag.src.c].querySelectorAll('.card');
      for (var k = drag.src.i; k < all.length; k++) nodes.push(all[k]);
    } else {
      nodes.push(topEl.querySelector('.waste .card'));
    }
    var rect = nodes[0].getBoundingClientRect();
    ghost.style.width = rect.width + 'px';
    nodes.forEach(function (n, idx) {
      var clone = n.cloneNode(true);
      clone.classList.remove('sel', 'hint-from', 'land', 'flipin', 'deal', 'drawn', 'shake');
      clone.style.marginTop = idx === 0 ? '0' : 'calc(var(--peek-up) - var(--ch))';
      clone.style.animation = 'none';
      ghost.appendChild(clone);
      n.style.opacity = '.3';
    });
    document.body.appendChild(ghost);
    drag.ghost = ghost;
    drag.offX = drag.x - rect.left;
    drag.offY = drag.y - rect.top;
    ghost.style.transformOrigin = drag.offX + 'px ' + drag.offY + 'px';
  }

  // Posiciona o fantasma e marca o destino, no máximo uma vez por quadro.
  function frame() {
    drag && (drag.raf = 0);
    if (!drag || !drag.ghost) return;
    drag.ghost.style.transform = 'translate3d(' + (drag.px - drag.offX) + 'px,' + (drag.py - drag.offY) +
      'px,0) rotate(3deg) scale(1.04)';
    var z = zoneAt(drag.px, drag.py, drag.rects);
    markTarget(z && Core.canMove(game, drag.src, z) ? z : null);
  }

  function onDown(e) {
    if (e.button > 0 || drag) return;
    if (e.target.closest('.stock')) return;
    var src = srcFromTarget(e.target);
    drag = {
      src: src, zone: zoneFromTarget(e.target), x: e.clientX, y: e.clientY,
      moved: false, pid: e.pointerId, ghost: null,
      movable: !!src && Core.validSrc(game, src)
    };
    try { tableEl.setPointerCapture(e.pointerId); } catch (err) { /* ok */ }
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    if (!drag.moved) {
      if (!drag.movable) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (dx * dx + dy * dy < 64) return;
      drag.moved = true;
      drag.rects = measure();
      startGhost();
    }
    drag.px = e.clientX;
    drag.py = e.clientY;
    if (!drag.raf) drag.raf = requestAnimationFrame(frame);
  }

  function endDrag() {
    if (drag && drag.raf) cancelAnimationFrame(drag.raf);
    if (drag && drag.ghost) drag.ghost.remove();
    clearTarget();
    drag = null;
  }

  function onUp(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    var d = drag;
    endDrag();
    if (d.moved) {
      var z = zoneAt(e.clientX, e.clientY, d.rects);
      if (z && Core.canMove(game, d.src, z)) {
        doMove(d.src, z);
      } else {
        if (z && z.t === 'f') setStatus(explainFoundation(d.src));
        else if (z && z.t === 'c') setStatus(explainColumn(d.src, z.c));
        render();
      }
    } else {
      onTap(d.src, d.zone);
    }
  }

  function onCancel() {
    if (!drag) return;
    endDrag();
    render();
  }

  function onTap(src, zone) {
    hint = null;
    setStatus('');
    var movable = !!src && Core.validSrc(game, src);

    if (sel) {
      // toque na própria carta selecionada: desmarca
      if (movable && sameSrc(sel, src)) {
        sel = null;
        render();
        return;
      }
      if (zone && Core.canMove(game, sel, zone)) {
        doMove(sel, zone);
        return;
      }
      if (zone && zone.t === 'c' && !movable) {
        var why = explainColumn(sel, zone.c);
        if (why) {
          setStatus(why);
          fx.shake = true;
          render();
          return;
        }
      }
      if (zone && zone.t === 'f' && !movable) {
        setStatus(explainFoundation(sel));
        fx.shake = true;
        render(); // mantém a seleção para ela escolher outro destino
        return;
      }
      sel = movable ? src : null;
      render();
      return;
    }

    if (!movable) { render(); return; }
    sel = src;
    render();
  }

  /* ---------- eventos ---------- */

  tableEl.addEventListener('pointerdown', onDown);
  tableEl.addEventListener('pointermove', onMove);
  tableEl.addEventListener('pointerup', onUp);
  tableEl.addEventListener('pointercancel', onCancel);
  tableEl.addEventListener('contextmenu', function (e) { e.preventDefault(); });

  // Teclado: Enter/Espaço em um botão gera click sem ponteiro (detail === 0).
  tableEl.addEventListener('click', function (e) {
    if (e.target.closest('.stock')) { drawCard(); return; }
    if (e.detail !== 0) return;
    onTap(srcFromTarget(e.target), zoneFromTarget(e.target));
  });

  function askNewGame() {
    var inProgress = game.history.length > 0 && !Core.isWon(game);
    if (inProgress && !window.confirm('Começar um novo jogo? O jogo atual será perdido.')) return;
    newGame();
  }

  undoBtn.addEventListener('click', undo);
  hintBtn.addEventListener('click', showHint);
  newBtn.addEventListener('click', askNewGame);
  document.getElementById('win-new').addEventListener('click', newGame);
  document.getElementById('win-close').addEventListener('click', hideWin);
  document.addEventListener('visibilitychange', tick);
  document.addEventListener('gesturestart', function (e) { e.preventDefault(); }); // sem zoom por pinça (Safari)

  /* ---------- início ---------- */

  // Retoma a partida salva do modo atual; false se não houver uma válida.
  function resume() {
    var saved = load(KEYS[mode].save);
    if (!validSave(saved)) return false;
    game = saved;
    if (!game.startedAt) game.startedAt = Date.now();
    if (game.leftAt) { // o tempo longe desta partida (jogando no outro modo) não conta
      if (!game.finishedAt) game.startedAt += Math.max(0, Date.now() - game.leftAt);
      game.leftAt = null;
    }
    if (Core.isWon(game) && !game.finishedAt) game.finishedAt = Date.now();
    if (!Core.isWon(game)) game.finishedAt = null;
    sel = null; hint = null; celeb = null; shownDone = 0;
    hideWin();
    setStatus('');
    fx = emptyFx();
    fx.deal = true;
    render();
    return true;
  }

  function applyMode() {
    var med = mode === 'med';
    document.documentElement.classList.toggle('med', med);
    modeBtn.setAttribute('aria-checked', med ? 'true' : 'false');
    if (themeMeta) themeMeta.setAttribute('content', med ? '#0b4a57' : '#14573a');
  }

  function setMode(next) {
    if (next === mode || !game) return;
    game.leftAt = Date.now();
    save();
    mode = next;
    store(MODE_KEY, mode);
    applyMode();
    if (!resume()) newGame();
  }

  modeBtn.addEventListener('click', function () { setMode(mode === 'med' ? 'normal' : 'med'); });

  var savedMode = load(MODE_KEY);
  if (savedMode === 'med' && window.MED_BANK) mode = 'med';
  applyMode();
  if (!resume()) newGame();
  setInterval(tick, 1000);
})();

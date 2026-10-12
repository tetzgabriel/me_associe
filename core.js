/* Regras, gerador e solver do jogo. Sem acesso ao DOM, para poder ser testado em Node.

   Modelo:
   - cols/down: colunas do tabuleiro; as `down[c]` primeiras cartas de cada coluna estão viradas para baixo.
   - slots: fundações no topo (SLOTS posições; -1 = livre, senão o índice da categoria).
   - fc[cat]: -1 categoria ainda não iniciada; 0..WORDS palavras já colocadas na fundação.
   - top[cat]: última carta colocada na fundação da categoria (só para exibir).
   - pool/ptr: monte. pool[0..ptr) é o descarte (topo = pool[ptr-1]), o resto é o estoque.
   Carta = cat * 8 + k, com k = 0 para a carta de categoria e k = 1..WORDS para palavras. */
(function (root) {
  'use strict';

  var P = {
    WORDS: 7,                     // palavras por categoria
    CATS: 7,                      // categorias por jogo
    SLOTS: 4,                     // fundações simultâneas
    LAYOUT: [6, 6, 6, 6, 6, 6]    // cartas por coluna; o resto vai para o monte
  };

  function catOf(id) { return id >> 3; }
  function isCat(id) { return (id & 7) === 0; }

  function clone(s) {
    return {
      cols: s.cols.map(function (c) { return c.slice(); }),
      down: s.down.slice(),
      slots: s.slots.slice(),
      fc: s.fc.slice(),
      top: s.top.slice(),
      pool: s.pool.slice(),
      ptr: s.ptr
    };
  }

  // Depois de tirar cartas de uma coluna, a nova última carta vira para cima.
  function fix(s, c) {
    var len = s.cols[c].length;
    if (s.down[c] >= len) s.down[c] = Math.max(0, len - 1);
  }

  /* src: { t: 'c', c, i } (coluna, a partir do índice i) ou { t: 'p', idx } (carta do monte)
     dst: { t: 'c', c } ou { t: 'f', slot? } */

  function cardAt(s, src) {
    return src.t === 'p' ? s.pool[src.idx] : s.cols[src.c][src.i];
  }

  function validSrc(s, src) {
    if (src.t === 'p') return src.idx >= 0 && src.idx < s.pool.length;
    var col = s.cols[src.c];
    var i = src.i;
    if (i < s.down[src.c] || i >= col.length) return false;
    var cat = catOf(col[i]);
    for (var k = i + 1; k < col.length; k++) {
      if (isCat(col[k]) || catOf(col[k]) !== cat) return false;
    }
    return true;
  }

  // Coluna que tem uma carta de categoria na base da parte virada para cima: não recebe mais cartas.
  // A categoria só sai de lá indo para uma fundação.
  function locked(s, c) {
    var col = s.cols[c];
    return col.length > 0 && isCat(col[Math.min(s.down[c], col.length - 1)]);
  }

  function canMove(s, src, dst) {
    if (!validSrc(s, src)) return false;
    var card = cardAt(s, src);
    if (dst.t === 'f') {
      if (isCat(card)) {
        if (dst.slot !== undefined && dst.slot !== null) return s.slots[dst.slot] === -1;
        return s.slots.indexOf(-1) >= 0;
      }
      return s.slots.indexOf(catOf(card)) >= 0;
    }
    if (src.t === 'c' && src.c === dst.c) return false;
    var dcol = s.cols[dst.c];
    if (dcol.length === 0) return true;
    if (isCat(card) || locked(s, dst.c)) return false;
    return catOf(dcol[dcol.length - 1]) === catOf(card);
  }

  function apply(s, src, dst) {
    var n = clone(s);
    var moved;
    if (src.t === 'c') {
      moved = n.cols[src.c].splice(src.i);
      fix(n, src.c);
    } else {
      moved = n.pool.splice(src.idx, 1);
      if (src.idx < n.ptr) n.ptr--;
    }
    if (dst.t === 'f') {
      var cat = catOf(moved[0]);
      for (var m = 0; m < moved.length; m++) {
        var id = moved[m];
        if (isCat(id)) {
          var slot = (dst.slot !== undefined && dst.slot !== null && n.slots[dst.slot] === -1)
            ? dst.slot : n.slots.indexOf(-1);
          n.slots[slot] = cat;
          n.fc[cat] = 0;
        } else {
          n.fc[cat]++;
        }
        n.top[cat] = id;
      }
      if (n.fc[cat] === P.WORDS) n.slots[n.slots.indexOf(cat)] = -1; // categoria completa libera a fundação
    } else {
      for (var k = 0; k < moved.length; k++) n.cols[dst.c].push(moved[k]);
    }
    return n;
  }

  // Compra uma carta do estoque para o descarte; com o estoque vazio, recomeça o ciclo.
  function draw(s) {
    var n = clone(s);
    if (!n.pool.length) return n;
    if (n.ptr < n.pool.length) n.ptr++;
    else n.ptr = 1;
    return n;
  }

  function isWon(s) {
    for (var c = 0; c < s.fc.length; c++) if (s.fc[c] !== P.WORDS) return false;
    return true;
  }

  /* ---------- solver ---------- */

  // O monte pode ser percorrido à vontade, então para o solver ele é uma "mão": qualquer carta
  // dele está disponível. Por isso só importa tirar categorias dele para as fundações.

  // Palavra exposta cuja categoria já está numa fundação: ir para lá nunca atrapalha.
  function greedy(s, path) {
    var again = true;
    while (again) {
      again = false;
      for (var c = 0; c < s.cols.length && !again; c++) {
        var col = s.cols[c];
        if (!col.length) continue;
        var last = col[col.length - 1];
        if (!isCat(last) && s.slots.indexOf(catOf(last)) >= 0) {
          var m = { src: { t: 'c', c: c, i: col.length - 1 }, dst: { t: 'f' } };
          path.push(m);
          s = apply(s, m.src, m.dst);
          again = true;
        }
      }
      for (var p = 0; p < s.pool.length && !again; p++) {
        if (!isCat(s.pool[p]) && s.slots.indexOf(catOf(s.pool[p])) >= 0) {
          var pm = { src: { t: 'p', idx: p }, dst: { t: 'f' } };
          path.push(pm);
          s = apply(s, pm.src, pm.dst);
          again = true;
        }
      }
    }
    return s;
  }

  // Jogadas que o solver considera (subconjunto das legais, suficiente para resolver).
  function genMoves(s) {
    var out = [];
    var n = s.cols.length;
    var free = s.slots.indexOf(-1) >= 0;
    var empty = -1;
    for (var c = 0; c < n; c++) if (!s.cols[c].length) { empty = c; break; }

    for (var p = 0; p < s.pool.length; p++) {
      if (isCat(s.pool[p]) && free) out.push({ src: { t: 'p', idx: p }, dst: { t: 'f' }, w: 0 });
    }
    for (var a = 0; a < n; a++) {
      var col = s.cols[a];
      var len = col.length;
      if (!len) continue;
      var last = col[len - 1];
      if (isCat(last)) {
        if (free) out.push({ src: { t: 'c', c: a, i: len - 1 }, dst: { t: 'f' }, w: 0 });
        else if (len > 1 && empty >= 0) out.push({ src: { t: 'c', c: a, i: len - 1 }, dst: { t: 'c', c: empty }, w: 4 });
        continue;
      }
      var i = s.down[a];
      if (isCat(col[i])) {
        // pilha (categoria + palavras): vai inteira para uma fundação livre
        if (free) out.push({ src: { t: 'c', c: a, i: i }, dst: { t: 'f' }, w: 0 });
        i++; // ou as palavras saem de cima dela
      }
      var cat = catOf(col[i]);
      for (var b = 0; b < n; b++) {
        if (b === a) continue;
        var dst = s.cols[b];
        if (!dst.length) {
          if (b === empty && i > 0) out.push({ src: { t: 'c', c: a, i: i }, dst: { t: 'c', c: b }, w: 3 });
        } else if (catOf(dst[dst.length - 1]) === cat && !locked(s, b)) {
          out.push({ src: { t: 'c', c: a, i: i }, dst: { t: 'c', c: b }, w: i === 0 ? 1 : 2 });
        }
      }
    }
    out.sort(function (x, y) { return x.w - y.w; });
    return out;
  }

  function key(s) {
    var cols = s.cols.map(function (col, c) {
      var str = '';
      for (var k = 0; k < col.length; k++) {
        var v = catOf(col[k]) * 2 + (isCat(col[k]) ? 1 : 0);
        str += String.fromCharCode((k < s.down[c] ? 97 : 65) + v);
      }
      return str;
    });
    cols.sort();
    var pool = s.pool.map(function (id) { return String.fromCharCode(65 + catOf(id) * 2 + (isCat(id) ? 1 : 0)); });
    pool.sort();
    return cols.join('|') + '#' + s.fc.join(',') + '#' + pool.join('');
  }

  // Devolve { path, complete }: path é a lista de jogadas até a vitória ou null; complete é true
  // quando a busca terminou sem estourar o limite (path null + complete = sem solução).
  function solve(state, maxNodes) {
    var limit = maxNodes || 60000;
    var seen = new Set();
    var nodes = 0;
    var path = [];
    var aborted = false;

    function rec(s0) {
      var mark = path.length;
      var s = greedy(s0, path);
      if (isWon(s)) return true;
      var k = key(s);
      if (seen.has(k)) { path.length = mark; return false; }
      seen.add(k);
      if (++nodes > limit) { aborted = true; path.length = mark; return false; }
      var ms = genMoves(s);
      for (var m = 0; m < ms.length; m++) {
        path.push({ src: ms[m].src, dst: ms[m].dst });
        if (rec(apply(s, ms[m].src, ms[m].dst))) return true;
        path.pop();
        if (aborted) { path.length = mark; return false; }
      }
      path.length = mark;
      return false;
    }

    var won = rec(state);
    return { path: won ? path : null, complete: won || !aborted, nodes: nodes };
  }

  /* ---------- geração ---------- */

  function shuffle(arr, rnd) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = rnd(i + 1);
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function deal(rnd) {
    var ids = [];
    for (var c = 0; c < P.CATS; c++) for (var k = 0; k <= P.WORDS; k++) ids.push(c * 8 + k);
    shuffle(ids, rnd);
    var cols = [];
    var pos = 0;
    P.LAYOUT.forEach(function (size) {
      cols.push(ids.slice(pos, pos + size));
      pos += size;
    });
    var slots = [];
    for (var sIdx = 0; sIdx < P.SLOTS; sIdx++) slots.push(-1);
    var fc = [];
    var top = [];
    for (var f = 0; f < P.CATS; f++) { fc.push(-1); top.push(-1); }
    return {
      cols: cols,
      down: cols.map(function (col) { return Math.max(0, col.length - 1); }),
      slots: slots,
      fc: fc,
      top: top,
      pool: ids.slice(pos),
      ptr: 0
    };
  }

  // Sorteia distribuições até o solver provar que dá para ganhar.
  function newSolvableDeal(rnd, maxTries, maxNodes) {
    var tries = maxTries || 200;
    for (var t = 0; t < tries; t++) {
      var s = deal(rnd);
      if (solve(s, maxNodes).path) return s;
    }
    return null;
  }

  var api = {
    P: P,
    catOf: catOf, isCat: isCat, clone: clone, cardAt: cardAt, validSrc: validSrc,
    canMove: canMove, locked: locked, apply: apply, draw: draw, isWon: isWon,
    genMoves: genMoves, solve: solve, deal: deal, newSolvableDeal: newSolvableDeal
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Core = api;
})(typeof window !== 'undefined' ? window : globalThis);

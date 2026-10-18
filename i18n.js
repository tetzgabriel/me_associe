/* MeAsocie interface strings (things18n). The Portuguese text is also written in index.html, so the
   page reads fine without JavaScript; everything built by game.js needs its key here. Keep both
   languages in step: tools/check-i18n.js fails if a key or a {param} exists in only one of them. */

things18n.add('pt-BR', {
  meta: {
    title: 'MeAsocie',
    description: 'MeAsocie: paciência de associação em português. Agrupe as palavras nas categorias certas.'
  },
  lang: { label: 'Idioma' },
  css: { free: 'livre', med: 'Médico' },
  timer: { label: 'Tempo', aria: 'Tempo desde o início da rodada' },
  mode: { label: 'Modo médico' },
  actions: { label: 'Ações', undo: 'Desfazer', hint: 'Dica', new: 'Novo jogo' },
  board: { top: 'Categorias e monte', label: 'Tabuleiro' },
  win: { title: 'Parabéns!', body: 'Todas as categorias completas.', time: 'Tempo:', close: 'Fechar' },
  toast: { complete: '{name} completa!' },
  status: { won: 'Pronto! Todas as categorias foram completadas.' },
  confirm: { newGame: 'Começar um novo jogo? O jogo atual será perdido.' },
  msg: {
    locked: 'Há uma carta de categoria no topo desta coluna: ela só sai para uma fundação.',
    catDest: 'Uma carta de categoria vai para uma fundação, uma coluna vazia ou sobre uma palavra dela.',
    foundationsFull: 'Todas as fundações estão ocupadas. Complete uma categoria antes.',
    noFoundation: 'A categoria dessa palavra ainda não está em nenhuma fundação.',
    stuck: 'Daqui não dá mais para terminar. Use Desfazer.',
    drawCards: 'Sem jogadas no tabuleiro. Compre cartas do monte.',
    noMoves: 'Sem jogadas possíveis. Use Desfazer.'
  },
  aria: {
    category: 'Categoria {name}',
    word: 'Palavra {name}',
    slot: 'Categoria {name}, {count} de {total}',
    slotFree: 'Fundação livre',
    stockEmpty: 'Monte vazio',
    stockDraw: { '=0': 'Monte vazio', other: 'Comprar carta, {count} no monte' },
    stockReset: 'Recomeçar o monte',
    faceDown: 'Carta virada para baixo'
  }
}, { label: 'Português' });

things18n.add('en', {
  meta: {
    title: 'MeAsocie',
    description: 'MeAsocie: word-association solitaire. Sort the words into the right categories.'
  },
  lang: { label: 'Language' },
  css: { free: 'free', med: 'Medical' },
  timer: { label: 'Time', aria: 'Time since the round started' },
  mode: { label: 'Medical mode' },
  actions: { label: 'Actions', undo: 'Undo', hint: 'Hint', new: 'New game' },
  board: { top: 'Categories and stock', label: 'Board' },
  win: { title: 'Well done!', body: 'All categories complete.', time: 'Time:', close: 'Close' },
  toast: { complete: '{name} complete!' },
  status: { won: 'Done! Every category is complete.' },
  confirm: { newGame: 'Start a new game? The current game will be lost.' },
  msg: {
    locked: 'There is a category card on top of this column: it can only move to a foundation.',
    catDest: 'A category card goes to a foundation, an empty column, or onto one of its own words.',
    foundationsFull: 'All foundations are taken. Complete a category first.',
    noFoundation: "This word's category isn't in a foundation yet.",
    stuck: "There's no way to finish from here. Use Undo.",
    drawCards: 'No moves on the board. Draw cards from the stock.',
    noMoves: 'No moves left. Use Undo.'
  },
  aria: {
    category: 'Category {name}',
    word: 'Word {name}',
    slot: 'Category {name}, {count} of {total}',
    slotFree: 'Free foundation',
    stockEmpty: 'Empty stock',
    stockDraw: { '=0': 'Empty stock', other: 'Draw a card, {count} left in the stock' },
    stockReset: 'Restart the stock',
    faceDown: 'Face-down card'
  }
}, { label: 'English' });

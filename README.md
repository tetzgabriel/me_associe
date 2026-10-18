# MeAsocie

Paciência de palavras em português do Brasil. Sem anúncios, sem pontuação, sem limite de jogadas.

## Idiomas

O jogo fala português (BR) e inglês. O idioma vem do navegador na primeira vez, e o seletor **PT · EN** (ao lado do modo médico) troca na hora. Cada idioma guarda a sua própria partida; o modo médico existe só em português. A tradução usa o [things18n](https://meoriente.com.br/indiethings/things18n/): `i18n.js` tem os textos da interface e `words.en.js` o banco de palavras em inglês.

## Como jogar

- **Tabuleiro**: 6 colunas de cartas; só a carta de baixo de cada coluna fica virada para cima.
- **Categorias** (cartas verdes, ex.: "Frutas") e **palavras** (ex.: "Manga"). Cada jogo tem 7 categorias com 7 palavras cada.
- **Fundações** (faixa no topo): são só 4. Leve uma carta de categoria para uma fundação livre e depois coloque nela as palavras dessa categoria. Quando chega a 7/7, a categoria é completada e a fundação é liberada para outra.
- **Colunas**: uma palavra pode ser colocada em uma coluna vazia ou sobre outra palavra da mesma categoria. Carta de categoria vai para uma fundação, uma coluna vazia ou sobre uma palavra da própria categoria (isso destapa a carta de baixo); uma coluna com categoria no topo não recebe mais cartas, a categoria só sai dela para uma fundação.
- **Monte** (canto superior direito): toque para comprar uma carta; ela aparece no descarte ao lado e pode ser jogada de lá. Quando o monte acaba, toque em ↻ para recomeçar. Não há limite de voltas.
- **Modo médico**: a chave abaixo do título liga um banco de temas médicos para o internato (11 áreas, 90 categorias, mais de 1000 termos). Cada partida é de uma área (Cardiologia, Nefrologia, Pediatria...), passando por todas antes de repetir. O modo normal e o médico têm partidas e tempos separados: trocar de modo guarda uma e retoma a outra.
- Ganha quem completar as 7 categorias.
- Toque numa carta e depois no destino, ou arraste. Arrastar uma carta leva junto tudo o que está empilhado sobre ela, inclusive uma categoria com suas palavras para a fundação. **Desfazer** e **Dica** são ilimitados.
- **Novo jogo** sorteia outras categorias e palavras. Todo jogo sorteado tem solução.
- O **tempo** no topo conta desde que a rodada começou e para quando ela termina. Ao recarregar, a última partida (e o tempo) continuam de onde pararam, salvos no próprio navegador.
- Completar uma categoria dispara confete e um aviso; vencer mostra uma tela de parabéns com o tempo. Quem prefere menos movimento pode ativar "reduzir movimento" no sistema: os efeitos são desligados.

## Instalar no iPhone (como aplicativo)

1. Abra o endereço do jogo no **Safari**.
2. Toque em **Compartilhar** → **Adicionar à Tela de Início**.
3. Abra pelo ícone **MeAsocie**: abre em tela cheia, sem barras do navegador, e funciona sem internet depois da primeira abertura.

O jogo salvo fica no armazenamento de cada lugar: o app da Tela de Início não enxerga o jogo que foi começado numa aba do Safari (e vice-versa). Quando o jogo é atualizado no GitHub, a versão nova aparece na segunda abertura seguinte.

## Rodar localmente

Não há build nem dependências:

```sh
python3 -m http.server 8000   # abra http://localhost:8000
```

## Publicar

Repositório `tetzgabriel/me_associe`, GitHub Pages pela branch `main` / `(root)`. Como o site `tetzgabriel.github.io` usa o domínio `meoriente.com.br`, o jogo fica em **https://meoriente.com.br/me_associe/**. Todos os caminhos são relativos, então funciona em subpasta.

## Arquivos

| Arquivo | O que faz |
| --- | --- |
| `index.html`, `style.css` | Página e estilo |
| `manifest.webmanifest`, `sw.js` | Instalação como app e cache para abrir rápido e offline. Se mudar a lista de arquivos, atualize `ASSETS` e `CACHE` em `sw.js`; a atualização só entra se todos os arquivos novos forem baixados |
| `icons/`, `splash/` | Ícone do app (feito em SVG) e telas de abertura do iPhone |
| `game.js` | Interface, toque/arrastar, salvamento (`localStorage`) |
| `core.js` | Regras, gerador de partidas e solver (usado para garantir solução e para a Dica). Os parâmetros (categorias, palavras, fundações, colunas) ficam em `Core.P` |
| `words.js` | Banco de categorias e palavras. Para adicionar: sem palavra repetida entre categorias, palavras curtas |
| `words-med.js` | Banco do modo médico, organizado por área. Regras no comentário do arquivo (sem palavra repetida na mesma área, trechos de até 11 letras) |

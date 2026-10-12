/* Banco de categorias (pt-BR). Cada jogo sorteia 5 categorias e 5 palavras de cada.
   Regras para editar: sem palavra repetida entre categorias, nome de categoria
   não pode aparecer como palavra, palavras curtas (cabem na carta). */
(function (root) {
  'use strict';
  var BANK = [
    { nome: 'Frutas', palavras: ['Banana', 'Maçã', 'Uva', 'Pera', 'Manga', 'Abacaxi', 'Morango', 'Melancia', 'Goiaba', 'Mamão', 'Kiwi', 'Caju'] },
    { nome: 'Legumes', palavras: ['Cenoura', 'Batata', 'Tomate', 'Alface', 'Brócolis', 'Abóbora', 'Beterraba', 'Pepino', 'Couve', 'Espinafre', 'Berinjela', 'Chuchu'] },
    { nome: 'Temperos', palavras: ['Sal', 'Pimenta', 'Orégano', 'Alho', 'Canela', 'Cominho', 'Louro', 'Salsinha', 'Cebola', 'Manjericão', 'Açafrão', 'Gengibre'] },
    { nome: 'Bebidas', palavras: ['Água', 'Suco', 'Café', 'Leite', 'Cerveja', 'Vinho', 'Chá', 'Limonada', 'Cachaça', 'Guaraná', 'Champanhe', 'Caipirinha'] },
    { nome: 'Sobremesas', palavras: ['Brigadeiro', 'Pudim', 'Sorvete', 'Bolo', 'Picolé', 'Beijinho', 'Quindim', 'Torta', 'Mousse', 'Churros', 'Brownie', 'Gelatina'] },
    { nome: 'Comida brasileira', palavras: ['Feijoada', 'Coxinha', 'Acarajé', 'Tapioca', 'Moqueca', 'Farofa', 'Churrasco', 'Cuscuz', 'Pastel', 'Esfiha', 'Empada', 'Vatapá'] },
    { nome: 'Café da manhã', palavras: ['Pão', 'Manteiga', 'Queijo', 'Presunto', 'Requeijão', 'Geleia', 'Torrada', 'Omelete', 'Cereal', 'Iogurte', 'Granola', 'Biscoito'] },
    { nome: 'Carnes', palavras: ['Frango', 'Bife', 'Linguiça', 'Picanha', 'Costela', 'Salsicha', 'Bacon', 'Filé', 'Fígado', 'Alcatra', 'Lombo', 'Peito'] },

    { nome: 'Animais da fazenda', palavras: ['Vaca', 'Porco', 'Cavalo', 'Ovelha', 'Cabra', 'Burro', 'Coelho', 'Boi', 'Bode', 'Égua', 'Bezerro', 'Touro'] },
    { nome: 'Animais selvagens', palavras: ['Leão', 'Tigre', 'Zebra', 'Girafa', 'Elefante', 'Macaco', 'Hiena', 'Onça', 'Lobo', 'Búfalo', 'Panda', 'Urso'] },
    { nome: 'Aves', palavras: ['Águia', 'Coruja', 'Papagaio', 'Pardal', 'Beija-flor', 'Tucano', 'Pavão', 'Cegonha', 'Gaivota', 'Arara', 'Galinha', 'Pato'] },
    { nome: 'Animais do mar', palavras: ['Baleia', 'Golfinho', 'Tubarão', 'Polvo', 'Lula', 'Foca', 'Arraia', 'Lagosta', 'Orca', 'Tartaruga', 'Camarão', 'Siri'] },
    { nome: 'Insetos', palavras: ['Formiga', 'Abelha', 'Mosca', 'Mosquito', 'Borboleta', 'Besouro', 'Grilo', 'Vespa', 'Cupim', 'Joaninha', 'Libélula', 'Barata'] },
    { nome: 'Répteis', palavras: ['Cobra', 'Jacaré', 'Lagarto', 'Camaleão', 'Iguana', 'Crocodilo', 'Jiboia', 'Cágado', 'Sucuri', 'Lagartixa', 'Víbora', 'Anaconda'] },
    { nome: 'Flores e plantas', palavras: ['Rosa', 'Margarida', 'Girassol', 'Orquídea', 'Tulipa', 'Lírio', 'Jasmim', 'Violeta', 'Cacto', 'Samambaia', 'Hortênsia', 'Lavanda'] },
    { nome: 'Árvores', palavras: ['Pinheiro', 'Carvalho', 'Palmeira', 'Bambu', 'Ipê', 'Eucalipto', 'Cedro', 'Salgueiro', 'Baobá', 'Sequoia', 'Oliveira', 'Araucária'] },

    { nome: 'Cores', palavras: ['Azul', 'Verde', 'Amarelo', 'Vermelho', 'Roxo', 'Preto', 'Branco', 'Cinza', 'Marrom', 'Bege', 'Dourado', 'Turquesa'] },
    { nome: 'Formas', palavras: ['Círculo', 'Quadrado', 'Triângulo', 'Retângulo', 'Losango', 'Esfera', 'Cubo', 'Pirâmide', 'Cilindro', 'Cone', 'Hexágono', 'Oval'] },
    { nome: 'Meses', palavras: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'] },
    { nome: 'Sentimentos', palavras: ['Alegria', 'Tristeza', 'Raiva', 'Medo', 'Saudade', 'Ciúme', 'Orgulho', 'Vergonha', 'Esperança', 'Amor', 'Ansiedade', 'Surpresa'] },
    { nome: 'Família', palavras: ['Mãe', 'Pai', 'Irmão', 'Avó', 'Tio', 'Primo', 'Sobrinho', 'Neto', 'Cunhado', 'Sogra', 'Madrinha', 'Genro'] },

    { nome: 'Corpo humano', palavras: ['Braço', 'Perna', 'Cabeça', 'Joelho', 'Cotovelo', 'Ombro', 'Pescoço', 'Tornozelo', 'Barriga', 'Costas', 'Pulso', 'Dedo'] },
    { nome: 'Rosto', palavras: ['Olho', 'Nariz', 'Boca', 'Orelha', 'Sobrancelha', 'Bochecha', 'Queixo', 'Testa', 'Cílios', 'Língua', 'Dente', 'Pálpebra'] },
    { nome: 'Profissões', palavras: ['Médico', 'Professor', 'Padeiro', 'Dentista', 'Bombeiro', 'Pedreiro', 'Advogado', 'Cozinheiro', 'Motorista', 'Pintor', 'Jornalista', 'Carteiro'] },
    { nome: 'Roupas', palavras: ['Camisa', 'Calça', 'Vestido', 'Saia', 'Casaco', 'Meia', 'Bermuda', 'Blusa', 'Jaqueta', 'Cueca', 'Pijama', 'Biquíni'] },
    { nome: 'Acessórios', palavras: ['Chapéu', 'Boné', 'Cinto', 'Bolsa', 'Óculos', 'Relógio', 'Luva', 'Cachecol', 'Gravata', 'Brinco', 'Anel', 'Colar'] },
    { nome: 'Higiene', palavras: ['Sabonete', 'Shampoo', 'Escova', 'Toalha', 'Desodorante', 'Pente', 'Perfume', 'Esponja', 'Secador', 'Fio dental', 'Hidratante', 'Cotonete'] },

    { nome: 'Cômodos da casa', palavras: ['Cozinha', 'Sala', 'Quarto', 'Banheiro', 'Garagem', 'Varanda', 'Quintal', 'Corredor', 'Sótão', 'Porão', 'Lavanderia', 'Escritório'] },
    { nome: 'Móveis', palavras: ['Sofá', 'Cadeira', 'Mesa', 'Cama', 'Armário', 'Estante', 'Poltrona', 'Cômoda', 'Rack', 'Beliche', 'Penteadeira', 'Aparador'] },
    { nome: 'Utensílios', palavras: ['Panela', 'Colher', 'Garfo', 'Faca', 'Prato', 'Copo', 'Peneira', 'Frigideira', 'Espátula', 'Ralador', 'Tigela', 'Xícara'] },
    { nome: 'Ferramentas', palavras: ['Martelo', 'Serrote', 'Alicate', 'Furadeira', 'Parafuso', 'Prego', 'Lixa', 'Enxada', 'Trena', 'Machado', 'Rastelo', 'Porca'] },
    { nome: 'Material escolar', palavras: ['Caderno', 'Lápis', 'Caneta', 'Borracha', 'Régua', 'Mochila', 'Apontador', 'Tesoura', 'Cola', 'Estojo', 'Giz', 'Compasso'] },
    { nome: 'Tecnologia', palavras: ['Celular', 'Computador', 'Teclado', 'Mouse', 'Tela', 'Fone', 'Câmera', 'Roteador', 'Impressora', 'Tablet', 'Notebook', 'Carregador'] },

    { nome: 'Transportes', palavras: ['Carro', 'Ônibus', 'Bicicleta', 'Avião', 'Navio', 'Trem', 'Metrô', 'Moto', 'Barco', 'Caminhão', 'Helicóptero', 'Patinete'] },
    { nome: 'Lugares da cidade', palavras: ['Padaria', 'Farmácia', 'Escola', 'Hospital', 'Mercado', 'Banco', 'Igreja', 'Praça', 'Biblioteca', 'Cinema', 'Teatro', 'Museu'] },
    { nome: 'Países', palavras: ['Brasil', 'Japão', 'França', 'Itália', 'Egito', 'China', 'Canadá', 'Argentina', 'México', 'Portugal', 'Índia', 'Peru'] },
    { nome: 'Capitais do Brasil', palavras: ['Brasília', 'Salvador', 'Recife', 'Manaus', 'Belém', 'Curitiba', 'Fortaleza', 'Goiânia', 'Natal', 'Vitória', 'Maceió', 'Cuiabá'] },
    { nome: 'Natureza', palavras: ['Montanha', 'Rio', 'Floresta', 'Deserto', 'Vulcão', 'Cachoeira', 'Lago', 'Vale', 'Ilha', 'Caverna', 'Pântano', 'Geleira'] },
    { nome: 'Clima', palavras: ['Chuva', 'Vento', 'Neve', 'Trovão', 'Neblina', 'Granizo', 'Relâmpago', 'Nuvem', 'Tempestade', 'Geada', 'Garoa', 'Furacão'] },
    { nome: 'Espaço', palavras: ['Terra', 'Marte', 'Vênus', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Mercúrio', 'Lua', 'Cometa', 'Galáxia', 'Estrela'] },
    { nome: 'Praia', palavras: ['Areia', 'Guarda-sol', 'Onda', 'Concha', 'Canga', 'Prancha', 'Maresia', 'Barraca', 'Bronzeador', 'Sandália', 'Coqueiro', 'Jangada'] },

    { nome: 'Esportes', palavras: ['Futebol', 'Vôlei', 'Basquete', 'Natação', 'Tênis', 'Judô', 'Boxe', 'Ciclismo', 'Atletismo', 'Surfe', 'Golfe', 'Handebol'] },
    { nome: 'Instrumentos', palavras: ['Violão', 'Piano', 'Bateria', 'Flauta', 'Violino', 'Trompete', 'Saxofone', 'Gaita', 'Tambor', 'Harpa', 'Cavaquinho', 'Pandeiro'] },
    { nome: 'Ritmos musicais', palavras: ['Samba', 'Forró', 'Rock', 'Sertanejo', 'Pagode', 'Funk', 'Jazz', 'Bossa nova', 'Reggae', 'Axé', 'Frevo', 'Choro'] },
    { nome: 'Brinquedos', palavras: ['Boneca', 'Bola', 'Pipa', 'Pião', 'Carrinho', 'Peteca', 'Ioiô', 'Bambolê', 'Pelúcia', 'Gangorra', 'Dominó', 'Baralho'] },
    { nome: 'Folclore', palavras: ['Saci', 'Curupira', 'Iara', 'Boitatá', 'Boto', 'Cuca', 'Caipora', 'Negrinho', 'Lobisomem', 'Mapinguari', 'Boiúna', 'Matinta'] },
    { nome: 'Seres fantásticos', palavras: ['Dragão', 'Fada', 'Bruxa', 'Sereia', 'Unicórnio', 'Vampiro', 'Duende', 'Gigante', 'Fantasma', 'Mago', 'Fênix', 'Centauro'] },
    { nome: 'Festa junina', palavras: ['Fogueira', 'Quadrilha', 'Bandeirinha', 'Canjica', 'Quentão', 'Pinhão', 'Balão', 'Arraial', 'Caipira', 'Pipoca', 'Milho', 'Paçoca'] },
    { nome: 'Disciplinas', palavras: ['Matemática', 'História', 'Geografia', 'Português', 'Ciências', 'Física', 'Química', 'Biologia', 'Inglês', 'Artes', 'Filosofia', 'Sociologia'] }
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = BANK;
  else root.WORD_BANK = BANK;
})(typeof window !== 'undefined' ? window : globalThis);

export const RECURSOS = {
  python: {
    emoji: '🐍',
    nome: 'Python',
    cor: 0x3776ab,
    descricao: 'Linguagem versátil, ideal para iniciantes, ciência de dados, automação e back-end.',
    topicos: [
      'Sintaxe básica, tipos, listas, dicionários',
      'Funções, classes e módulos',
      'Manipulação de arquivos e exceções',
      'Bibliotecas populares: requests, pandas, flask',
      'Async/await e concorrência',
    ],
    links: [
      { label: '📖 Docs oficiais', url: 'https://docs.python.org/3/' },
      { label: '🎮 Tutorial interativo', url: 'https://www.learnpython.org/' },
      { label: '📚 Real Python', url: 'https://realpython.com/' },
      { label: '📘 Automate the Boring Stuff (grátis)', url: 'https://automatetheboringstuff.com/' },
      { label: '🗺️ Roadmap Python', url: 'https://roadmap.sh/python' },
      { label: '🏋️ Exercism — prática', url: 'https://exercism.org/tracks/python' },
    ],
    dica: 'Comece com `!run python` e escreva `print("Croac!")` — entender o ambiente é o primeiro passo!',
  },

  java: {
    emoji: '☕',
    nome: 'Java',
    cor: 0xf89820,
    descricao: 'Linguagem robusta, orientada a objetos, amplamente usada em back-end corporativo e Android.',
    topicos: [
      'Classes, objetos, herança e polimorfismo',
      'Collections: List, Map, Set',
      'Tratamento de exceções e streams',
      'Spring Boot para APIs REST',
      'JUnit para testes automatizados',
    ],
    links: [
      { label: '📖 Tutorial oficial Oracle', url: 'https://docs.oracle.com/javase/tutorial/' },
      { label: '📚 Baeldung', url: 'https://www.baeldung.com/' },
      { label: '🗺️ Roadmap Java', url: 'https://roadmap.sh/java' },
      { label: '🏋️ Exercism — prática', url: 'https://exercism.org/tracks/java' },
      { label: '🌱 Spring Guides', url: 'https://spring.io/guides' },
    ],
    dica: 'Java parece verboso no início, mas a estrutura rígida te ensina boas práticas de POO que valem em qualquer linguagem.',
  },

  'web-dev': {
    emoji: '🌐',
    nome: 'Web Dev',
    cor: 0xe34c26,
    descricao: 'Desenvolvimento web cobre HTML, CSS, JavaScript e frameworks modernos como React e Vue.',
    topicos: [
      'HTML semântico e acessibilidade',
      'CSS: flexbox, grid, responsividade',
      'JavaScript: DOM, eventos, fetch API',
      'Frameworks: React, Vue, Svelte',
      'Ferramentas: Vite, npm, Git',
    ],
    links: [
      { label: '📖 MDN Web Docs', url: 'https://developer.mozilla.org/' },
      { label: '📘 JavaScript.info', url: 'https://javascript.info/' },
      { label: '🎨 CSS-Tricks', url: 'https://css-tricks.com/' },
      { label: '🗺️ Frontend Roadmap', url: 'https://roadmap.sh/frontend' },
      { label: '🏋️ freeCodeCamp', url: 'https://www.freecodecamp.org/' },
      { label: '🎮 Flexbox Froggy (CSS)', url: 'https://flexboxfroggy.com/' },
    ],
    dica: 'Domine HTML + CSS + JS vanilla antes de partir para frameworks. A base sólida faz toda diferença quando algo quebra.',
  },

  backend: {
    emoji: '⚙️',
    nome: 'Back-end',
    cor: 0x68a063,
    descricao: 'Back-end cobre servidores, APIs, autenticação, filas de mensagens e arquitetura de sistemas.',
    topicos: [
      'APIs REST e GraphQL',
      'Autenticação: JWT, OAuth 2.0',
      'Node.js (Express/Fastify) ou Python (FastAPI/Flask)',
      'Mensageria: RabbitMQ, Kafka',
      'Docker e deploy em produção',
    ],
    links: [
      { label: '🗺️ Backend Roadmap', url: 'https://roadmap.sh/backend' },
      { label: '📖 Node.js Docs', url: 'https://nodejs.org/docs/latest/api/' },
      { label: '⚡ FastAPI (Python)', url: 'https://fastapi.tiangolo.com/' },
      { label: '🔵 Express.js', url: 'https://expressjs.com/' },
      { label: '🧪 Postman — testar APIs', url: 'https://www.postman.com/' },
      { label: '🐳 Docker — Getting Started', url: 'https://docs.docker.com/get-started/' },
    ],
    dica: 'Aprenda a desenhar uma API REST corretamente antes de partir para microsserviços. Simplicidade é escala.',
  },

  'banco-de-dados': {
    emoji: '🗄️',
    nome: 'Banco de Dados',
    cor: 0x336791,
    descricao: 'Bancos de dados relacionais (SQL) e não-relacionais (NoSQL) para armazenar e consultar dados.',
    topicos: [
      'SQL: SELECT, JOIN, GROUP BY, subqueries',
      'Modelagem: chaves, relacionamentos, normalização',
      'Índices e otimização de queries',
      'PostgreSQL, MySQL, SQLite',
      'NoSQL: MongoDB, Redis, Firestore',
    ],
    links: [
      { label: '🎮 SQLZoo — prática interativa', url: 'https://sqlzoo.net/' },
      { label: '📖 PostgreSQL Docs', url: 'https://www.postgresql.org/docs/' },
      { label: '📚 MySQL Tutorial', url: 'https://www.mysqltutorial.org/' },
      { label: '📖 MongoDB Docs', url: 'https://www.mongodb.com/docs/' },
      { label: '🗺️ DB Roadmap', url: 'https://roadmap.sh/postgresql-dba' },
      { label: '🎮 SQLBolt — tutorial', url: 'https://sqlbolt.com/' },
    ],
    dica: 'Entender como um índice funciona internamente muda sua relação com banco de dados para sempre. Estude B-trees.',
  },

  'bots-discord': {
    emoji: '🤖',
    nome: 'Bots Discord',
    cor: 0x5865f2,
    descricao: 'Criação de bots para Discord usando discord.js (Node.js) ou discord.py (Python).',
    topicos: [
      'Configurar aplicação no Developer Portal',
      'Slash commands e context menus',
      'Embeds, componentes (botões, selects)',
      'Eventos: messageCreate, interactionCreate',
      'Permissões, intents e partials',
    ],
    links: [
      { label: '📖 Discord.js Guide', url: 'https://discordjs.guide/' },
      { label: '📖 Discord.js Docs', url: 'https://discord.js.org/' },
      { label: '🐍 Discord.py Docs', url: 'https://discordpy.readthedocs.io/' },
      { label: '🔧 Discord Developer Portal', url: 'https://discord.com/developers/docs' },
      { label: '💡 Top.gg — inspiração', url: 'https://top.gg/' },
    ],
    dica: 'Esse bot (PantanoCode) é open source — leia o código-fonte como material de estudo! Use `!run js` para testar snippets.',
  },

  'game-dev': {
    emoji: '🎮',
    nome: 'Game Dev',
    cor: 0x478cbf,
    descricao: 'Desenvolvimento de jogos 2D e 3D com engines como Godot, Unity e frameworks como Pygame.',
    topicos: [
      'Game loop, delta time e física',
      'Sprites, animações e tilemaps',
      'Colisões, câmera e cenas',
      'Godot (GDScript/C#), Unity (C#)',
      'Publicar na itch.io e Google Play',
    ],
    links: [
      { label: '🎮 Godot Docs', url: 'https://docs.godotengine.org/' },
      { label: '🎮 Unity Learn', url: 'https://learn.unity.com/' },
      { label: '🐍 Pygame Docs', url: 'https://www.pygame.org/docs/' },
      { label: '🗺️ Game Dev Roadmap', url: 'https://roadmap.sh/game-developer' },
      { label: '🎯 itch.io — publicar jogos', url: 'https://itch.io/' },
      { label: '📺 GDQuest — Godot grátis', url: 'https://www.gdquest.com/' },
    ],
    dica: 'Faça um jogo pequeno e terminado antes de planejar o próximo. Um Pong completo vale mais que um RPG pela metade.',
  },
};

export const ALIASES = {
  py: 'python',
  js: 'web-dev',
  web: 'web-dev',
  front: 'web-dev',
  frontend: 'web-dev',
  back: 'backend',
  api: 'backend',
  bd: 'banco-de-dados',
  sql: 'banco-de-dados',
  db: 'banco-de-dados',
  banco: 'banco-de-dados',
  bot: 'bots-discord',
  bots: 'bots-discord',
  discord: 'bots-discord',
  game: 'game-dev',
  jogos: 'game-dev',
  godot: 'game-dev',
  unity: 'game-dev',
};

export function getRecurso(chave) {
  const normalizado = chave.toLowerCase().trim();
  const key = ALIASES[normalizado] || normalizado;
  return RECURSOS[key] || null;
}

export function listarAreas() {
  return Object.keys(RECURSOS);
}

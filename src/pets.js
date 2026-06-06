export const PETS = {
  normal: {
    nome: 'Sapo Normal',
    emoji: '🐸',
    raridade: '⭐ Comum',
    lore: 'Um sapo simples do pântano. Não tem nada de especial... ou tem?',
    preco: 0,
    arquivo: null,
    desbloqueio: 'Todos os membros começam com ele.',
    stats: { ataque: 10, defesa: 10, velocidade: 10 },
  },
  pirata: {
    nome: 'Capitão Croac',
    emoji: '🏴‍☠️',
    raridade: '⭐⭐ Incomum',
    lore: 'Navega pelos mares do Stack Overflow há 300 anos sem encontrar a solução. Dizem que seu tesouro é um repositório privado com código perfeito.',
    preco: 300,
    arquivo: 'pet_pirata.png',
    ilustracao: 'ilustracao_pirata.jpg',
    desbloqueio: 'Comprar na loja por 300 🪙',
    stats: { ataque: 15, defesa: 12, velocidade: 8 },
  },
  fantasma: {
    nome: 'Rã Fantasma',
    emoji: '👻',
    raridade: '⭐⭐ Incomum',
    lore: 'Morreu esperando o código compilar. Agora assombra os corredores do pântano revisando pull requests que ninguém pediu.',
    preco: 300,
    arquivo: 'pet_fantasma.png',
    ilustracao: 'ilustracao_fantasma.jpg',
    desbloqueio: 'Comprar na loja por 300 🪙',
    stats: { ataque: 8, defesa: 6, velocidade: 22 },
  },
  ninja: {
    nome: 'Sapo Sombra',
    emoji: '🥷',
    raridade: '⭐⭐⭐ Raro',
    lore: 'Ninguém sabe seu nome real. Commita às 3h da manhã, nunca abre issues e seus PRs surgem do nada. O log do git o teme.',
    preco: 600,
    arquivo: 'pet_ninja.png',
    ilustracao: 'ilustracao_ninja.jpg',
    desbloqueio: 'Comprar na loja por 600 🪙',
    stats: { ataque: 20, defesa: 8, velocidade: 18 },
  },
  hacker: {
    nome: 'Mr. Pântano',
    emoji: '💻',
    raridade: '⭐⭐⭐ Raro',
    lore: 'ROOT://HACK_THE_POND. Vive numa sala escura rodeado de monitores. Já derrubou o servidor do pântano três vezes "por acidente".',
    preco: 600,
    arquivo: 'pet_hacker.png',
    ilustracao: 'ilustracao_hacker.jpg',
    desbloqueio: 'Comprar na loja por 600 🪙',
    stats: { ataque: 12, defesa: 18, velocidade: 10 },
  },
  lendario: {
    nome: 'Rã das Trevas',
    emoji: '💀',
    raridade: '⭐⭐⭐⭐⭐ Lendário',
    lore: 'Existe desde antes do primeiro `console.log`. Seus olhos flamejantes viram a criação do JavaScript e ainda não perdoaram. Só aparece para os verdadeiros mestres do pântano.',
    preco: 0,
    arquivo: 'pet_lendario.png',
    ilustracao: null,
    desbloqueio: 'Atingir o nível máximo (Sapo Lendário)',
    stats: { ataque: 22, defesa: 20, velocidade: 15 },
  },
};

export function getPet(id) {
  return PETS[id] || null;
}

export function listarPets() {
  return Object.entries(PETS).map(([id, pet]) => ({ id, ...pet }));
}

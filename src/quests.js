// Banco de quests diárias com código bugado + output esperado
const QUESTS = [
  {
    id: 'q001',
    nivel: 'Girino',
    titulo: 'Contando moscas',
    descricao: 'O sapo estava contando moscas, mas seu código tá bugado! Corrija a função abaixo para que ela retorne a soma de todos os números **pares** de uma lista.',
    linguagem: 'python',
    codigoBugado: `def soma_pares(lista):
    total = 0
    for n in lista:
        if n % 2 != 0:  # 🐛 bug aqui!
            total += n
    return total

print(soma_pares([1, 2, 3, 4, 6]))`,
    outputEsperado: '12',
    xpBase: 50,
    dica: 'A condição do `if` está verificando os **ímpares** ao invés dos pares. O operador `!=` deveria ser `==`.',
  },
  {
    id: 'q002',
    nivel: 'Girino',
    titulo: 'Mosca invertida',
    descricao: 'O sapo tentou inverter uma string, mas algo deu errado. Corrija a função para que ela retorne a string invertida.',
    linguagem: 'python',
    codigoBugado: `def inverter(texto):
    return texto[1:]  # 🐛 bug aqui!

print(inverter("sapo"))`,
    outputEsperado: 'opas',
    xpBase: 50,
    dica: 'O slice `[1:]` remove o primeiro caractere. Para inverter, use `[::-1]`.',
  },
  {
    id: 'q003',
    nivel: 'Sapo Prog.',
    titulo: 'Poça fatorial',
    descricao: 'O sapo quer calcular fatoriais, mas a recursão está errada! Corrija a função para retornar o fatorial de n.',
    linguagem: 'python',
    codigoBugado: `def fatorial(n):
    if n == 0:
        return 0  # 🐛 bug aqui!
    return n * fatorial(n - 1)

print(fatorial(5))`,
    outputEsperado: '120',
    xpBase: 80,
    dica: 'O caso base da recursão deve retornar `1`, não `0`. Com `0`, todo resultado será zero.',
  },
  {
    id: 'q004',
    nivel: 'Girino',
    titulo: 'Contagem errada',
    descricao: 'O sapo quer saber quantas vogais tem em uma palavra, mas está contando errado. Corrija a função.',
    linguagem: 'python',
    codigoBugado: `def contar_vogais(texto):
    vogais = "aeiou"
    count = 0
    for c in texto:
        if c in vogais:
            count += 2  # 🐛 bug aqui!
    return count

print(contar_vogais("sapo"))`,
    outputEsperado: '2',
    xpBase: 50,
    dica: 'Está incrementando `count` por 2 a cada vogal. Deveria ser `count += 1`.',
  },
  {
    id: 'q005',
    nivel: 'Sapo Prog.',
    titulo: 'Pântano dos palíndromos',
    descricao: 'O sapo quer verificar se uma palavra é palíndromo, mas a função está sempre retornando False. Corrija!',
    linguagem: 'python',
    codigoBugado: `def palindromo(texto):
    return texto == texto[1:-1]  # 🐛 bug aqui!

print(palindromo("arara"))`,
    outputEsperado: 'True',
    xpBase: 80,
    dica: 'Está comparando `texto` com uma versão sem o primeiro e último caractere. Use `texto[::-1]` para inverter.',
  },
  {
    id: 'q006',
    nivel: 'Sapo Eng.',
    titulo: 'Busca binária bugada',
    descricao: 'O sapo implementou busca binária mas sempre retorna -1. Corrija a função para encontrar o índice do elemento na lista ordenada.',
    linguagem: 'python',
    codigoBugado: `def busca_binaria(lista, alvo):
    inicio, fim = 0, len(lista) - 1
    while inicio <= fim:
        meio = (inicio + fim) // 2
        if lista[meio] == alvo:
            return meio
        elif lista[meio] < alvo:
            fim = meio - 1  # 🐛 bug aqui!
        else:
            inicio = meio + 1  # 🐛 bug aqui!
    return -1

print(busca_binaria([1, 3, 5, 7, 9, 11], 7))`,
    outputEsperado: '3',
    xpBase: 120,
    dica: 'Quando o alvo é maior, `inicio` deve avançar (`inicio = meio + 1`). Quando menor, `fim` deve recuar (`fim = meio - 1`). Os dois estão trocados!',
  },
  {
    id: 'q007',
    nivel: 'Girino',
    titulo: 'Temperatura do pântano',
    descricao: 'O sapo quer converter Celsius para Fahrenheit, mas a fórmula está errada!',
    linguagem: 'python',
    codigoBugado: `def celsius_para_fahrenheit(c):
    return c * 9 / 5 - 32  # 🐛 bug aqui!

print(celsius_para_fahrenheit(100))`,
    outputEsperado: '212.0',
    xpBase: 50,
    dica: 'A fórmula correta é `(c * 9/5) + 32`, não `- 32`.',
  },
];

let questHoje = null;
let primeiroAResolver = null;
let resolvedores = new Set();

export function sortearQuestDoDia() {
  const indice = new Date().getDate() % QUESTS.length;
  questHoje = { ...QUESTS[indice], postadaEm: Date.now() };
  primeiroAResolver = null;
  resolvedores = new Set();
  return questHoje;
}

export function getQuestAtiva() {
  return questHoje;
}

export function validarResposta(output) {
  if (!questHoje) return false;
  return output.trim() === questHoje.outputEsperado.trim();
}

export function registrarResolvedor(userId) {
  if (resolvedores.has(userId)) return { jaResolveu: true, primeiro: false };
  resolvedores.add(userId);
  const primeiro = primeiroAResolver === null;
  if (primeiro) primeiroAResolver = userId;
  return { jaResolveu: false, primeiro };
}

export function getEstatisticasQuest() {
  return {
    totalResolvedores: resolvedores.size,
    primeiroAResolver,
  };
}

export function tempoRestante() {
  if (!questHoje) return null;
  const expira = new Date();
  expira.setHours(8, 0, 0, 0);
  expira.setDate(expira.getDate() + 1);
  const diff = expira - Date.now();
  const horas = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${horas}h ${mins}min`;
}

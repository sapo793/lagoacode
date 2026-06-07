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
  {
    id: 'q008',
    nivel: 'Sapo Prog.',
    titulo: 'Lodo de dígitos',
    descricao: 'O sapo quer somar os dígitos de um número, mas a função tá pulando casas. Corrija para que ela retorne a soma de todos os dígitos.',
    linguagem: 'python',
    codigoBugado: `def soma_digitos(n):
    soma = 0
    while n > 0:
        soma += n % 10
        n = n // 100  # 🐛 bug aqui!
    return soma

print(soma_digitos(1234))`,
    outputEsperado: '10',
    xpBase: 80,
    dica: 'Dividindo por `100` o sapo pula um dígito a cada volta. O certo é `n // 10`.',
  },
  {
    id: 'q009',
    nivel: 'Girino',
    titulo: 'O maior nenúfar',
    descricao: 'O sapo quer achar o maior número de uma lista, mas o resultado sai errado. Corrija a função.',
    linguagem: 'python',
    codigoBugado: `def maior(lista):
    maior_valor = lista[0]
    for n in lista:
        if n > maior_valor:
            maior_valor = n
        else:
            maior_valor = n  # 🐛 bug aqui!
    return maior_valor

print(maior([4, 9, 2, 7]))`,
    outputEsperado: '9',
    xpBase: 50,
    dica: 'O `else` sobrescreve `maior_valor` com qualquer número, mesmo os menores. Basta remover esse `else`.',
  },
  {
    id: 'q010',
    nivel: 'Girino',
    titulo: 'Charco dos quadrados',
    descricao: 'O sapo quer somar os quadrados dos números de uma lista, mas a conta tá errada. Corrija a função.',
    linguagem: 'python',
    codigoBugado: `def soma_quadrados(lista):
    total = 0
    for n in lista:
        total += n * 2  # 🐛 bug aqui!
    return total

print(soma_quadrados([1, 2, 3]))`,
    outputEsperado: '14',
    xpBase: 50,
    dica: '`n * 2` apenas dobra o número. Para elevar ao quadrado em Python, use `n ** 2`.',
  },
  {
    id: 'q011',
    nivel: 'Sapo Eng.',
    titulo: 'Pedra ou primo?',
    descricao: 'O sapo escreveu uma função pra checar se um número é primo, mas ela sempre diz que não é. Corrija!',
    linguagem: 'python',
    codigoBugado: `def eh_primo(n):
    if n < 2:
        return False
    for i in range(2, n):
        if n % i == 0:
            return False
    return False  # 🐛 bug aqui!

print(eh_primo(7))`,
    outputEsperado: 'True',
    xpBase: 100,
    dica: 'Se o laço termina sem achar nenhum divisor, o número É primo — o retorno final deveria ser `True`, não `False`.',
  },
  {
    id: 'q012',
    nivel: 'Girino',
    titulo: 'Croac em Java: somatório',
    descricao: 'O sapo escreveu um programa em Java pra somar os elementos de um array, mas o resultado sai errado. Corrija o código.',
    linguagem: 'java',
    codigoBugado: `public class Main {
    public static void main(String[] args) {
        int[] numeros = {1, 2, 3, 4, 5};
        int soma = 0;
        for (int i = 1; i < numeros.length; i++) {  // 🐛 bug aqui!
            soma += numeros[i];
        }
        System.out.println(soma);
    }
}`,
    outputEsperado: '15',
    xpBase: 60,
    dica: 'O laço começa em `i = 1` e pula o primeiro elemento do array. Deveria começar em `i = 0`.',
  },
  {
    id: 'q013',
    nivel: 'Girino',
    titulo: 'Croac em Java: par ou ímpar',
    descricao: 'O sapo quer dizer se um número é par ou ímpar, mas o programa sempre responde a mesma coisa. Corrija o código.',
    linguagem: 'java',
    codigoBugado: `public class Main {
    public static void main(String[] args) {
        int numero = 7;
        if (numero % 2 == 0) {
            System.out.println("par");
        } else {
            System.out.println("par");  // 🐛 bug aqui!
        }
    }
}`,
    outputEsperado: 'impar',
    xpBase: 50,
    dica: 'O `else` deveria imprimir `"impar"`, não `"par"` de novo — senão a resposta nunca muda.',
  },
  {
    id: 'q014',
    nivel: 'Sapo Prog.',
    titulo: 'Croac em Java: fatorial',
    descricao: 'O sapo quer calcular o fatorial de um número em Java, mas o resultado sempre dá zero. Corrija o código.',
    linguagem: 'java',
    codigoBugado: `public class Main {
    public static void main(String[] args) {
        int n = 5;
        int resultado = 0;  // 🐛 bug aqui!
        for (int i = 1; i <= n; i++) {
            resultado *= i;
        }
        System.out.println(resultado);
    }
}`,
    outputEsperado: '120',
    xpBase: 90,
    dica: 'Multiplicar por zero sempre dá zero! O acumulador `resultado` deve começar em `1`, não em `0`.',
  },
  {
    id: 'q015',
    nivel: 'Sapo Prog.',
    titulo: 'Croac em Java: o maior do brejo',
    descricao: 'O sapo quer achar o maior número de um array em Java, mas o programa retorna o menor. Corrija o código.',
    linguagem: 'java',
    codigoBugado: `public class Main {
    public static void main(String[] args) {
        int[] numeros = {3, 7, 2, 9, 4};
        int maior = numeros[0];
        for (int n : numeros) {
            if (n < maior) {  // 🐛 bug aqui!
                maior = n;
            }
        }
        System.out.println(maior);
    }
}`,
    outputEsperado: '9',
    xpBase: 90,
    dica: 'A comparação `n < maior` guarda o menor valor encontrado. Para achar o maior, use `n > maior`.',
  },
  {
    id: 'q016',
    nivel: 'Sapo Prog.',
    titulo: 'Croac em Java: contando vogais',
    descricao: 'O sapo quer contar as vogais de uma palavra em Java, mas o programa conta as consoantes! Corrija o código.',
    linguagem: 'java',
    codigoBugado: `public class Main {
    public static void main(String[] args) {
        String palavra = "pantano";
        String vogais = "aeiou";
        int contador = 0;
        for (int i = 0; i < palavra.length(); i++) {
            char c = palavra.charAt(i);
            if (vogais.indexOf(c) == -1) {  // 🐛 bug aqui!
                contador++;
            }
        }
        System.out.println(contador);
    }
}`,
    outputEsperado: '3',
    xpBase: 90,
    dica: '`indexOf(c) == -1` é verdade quando o caractere NÃO é uma vogal. Pra contar vogais, a condição deveria ser `!= -1`.',
  },
  {
    id: 'q017',
    nivel: 'Sapo Eng.',
    titulo: 'Croac em Java: fibonacci enroscado',
    descricao: 'O sapo tentou calcular o n-ésimo número de Fibonacci em Java, mas a sequência não avança direito. Corrija o código.',
    linguagem: 'java',
    codigoBugado: `public class Main {
    public static void main(String[] args) {
        int n = 7;
        int a = 0, b = 1;
        for (int i = 0; i < n; i++) {
            int temp = a;
            a = b;
            b = temp;  // 🐛 bug aqui!
        }
        System.out.println(a);
    }
}`,
    outputEsperado: '13',
    xpBase: 130,
    dica: 'Ao só copiar `temp` para `b`, a sequência fica oscilando entre dois valores. O próximo termo de Fibonacci é a soma dos dois anteriores: `b = temp + b`.',
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

# 🐸 PantanoCode — Bot de Comunidade para Discord

Bot Discord para servidores de programação com execução de código em tempo real e sistema completo de gamificação. Membros executam código, resolvem quests diárias, acumulam XP, evoluem de nível, colecionam pets e batalham entre si.

---

## ✨ Funcionalidades

### ⚙️ Execução de código
Execute código diretamente no Discord em mais de 15 linguagens via integração com a API do [Glot.io](https://glot.io):

`Python · Java · JavaScript · TypeScript · C · C++ · Go · Rust · Ruby · PHP · Lua · Bash`

| Nível | Nome | XP necessário |
|---|---|---|
| 🥚 | Ovo | 0 |
| 🐛 | Girino Dev | 100 |
| 🐸 | Sapo Programador | 500 |
| ⚙️ | Sapo Engenheiro | 1.500 |
| 👑 | Sapo Lendário | 5.000 |

> Ao atingir o nível máximo, o pet **Rã das Trevas** (Lendário) é desbloqueado automaticamente.

---

## 🐾 Pets disponíveis

| Pet | Raridade | Como obter |
|---|---|---|
| 🐸 Sapo Normal | ⭐ Comum | Todos começam com ele |
| 🏴‍☠️ Capitão Croac | ⭐⭐ Incomum | Loja — 300 🪙 |
| 👻 Rã Fantasma | ⭐⭐ Incomum | Loja — 300 🪙 |
| 🥷 Sapo Sombra | ⭐⭐⭐ Raro | Loja — 600 🪙 |
| 💻 Mr. Pântano | ⭐⭐⭐ Raro | Loja — 600 🪙 |
| 💀 Rã das Trevas | ⭐⭐⭐⭐⭐ Lendário | Atingir nível máximo |
| 🌿 THAL'MOR | 🌎 Primordial | Inatingível |
| 🌑 YØRAX | 🌌 Entidade | Inatingível |

---

## 🚀 Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- Conta no [Discord Developer Portal](https://discord.com/developers/applications)
- Token da API do [Glot.io](https://glot.io) (para execução de código)

### 1. Clone o repositório

```bash
git clone https://github.com/sapo793/study_bot_discord.git
cd study_bot_discord
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
DISCORD_TOKEN=seu_token_do_bot
CLIENT_ID=id_da_aplicacao_discord
GLOT_TOKEN=seu_token_glot_io

# Opcional: ID do servidor para registrar comandos em modo dev
GUILD_ID=id_do_servidor
```

> **Como obter cada valor:**
> - `DISCORD_TOKEN` e `CLIENT_ID`: [Discord Developer Portal](https://discord.com/developers/applications) → sua aplicação → Bot / General Information
> - `GLOT_TOKEN`: crie uma conta em [glot.io](https://glot.io) e gere um token em Account → API Token

### 4. Inicie o bot

```bash
npm start
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```
MIT
Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.
Attach files by dragging & dropping, selecting or pasting them.

```
!run python
print("Croac!")
```

### 🎮 Gamificação completa

| Sistema | Descrição |
|---|---|
| **XP e Níveis** | 5 níveis progressivos com cargos automáticos no servidor |# 🐸 PantanoCode — Bot de Comunidade para Discord

Bot Discord para servidores de programação com execução de código em tempo real e sistema completo de gamificação. Membros executam código, resolvem quests diárias, acumulam XP, evoluem de nível, colecionam pets e batalham entre si.

---

## ✨ Funcionalidades

### ⚙️ Execução de código
Execute código diretamente no Discord em mais de 15 linguagens via integração com a API do [Glot.io](https://glot.io):

`Python · Java · JavaScript · TypeScript · C · C++ · Go · Rust · Ruby · PHP · Lua · Bash`

```
!run python
print("Croac!")
```

### 🎮 Gamificação completa

| Sistema | Descrição |
|---|---|
| **XP e Níveis** | 5 níveis progressivos com cargos automáticos no servidor |
| **Moedas** | Ganhas ao acumular XP, gastas na loja de pets |
| **Pets** | 8 colecionáveis com raridades, stats e lore próprios |
| **Interação com Pet** | Fome, energia e humor com decaimento real ao longo do tempo |
| **Batalhas** | Confrontos entre pets com sistema de stats |
| **Streaks** | Rastreamento de dias consecutivos resolvendo quests |
| **Ranking** | Placar geral do servidor por XP |

### 🐛 Quests diárias
O bot posta automaticamente um desafio diário de código bugado. O membro corrige o bug, executa com `!run` e o bot valida o output — primeiro a resolver ganha bônus de XP.

São 17 quests feitas à mão em Python e Java, cobrindo desde erros simples de lógica até bugs em recursão e busca binária.

### 📚 Recursos de aprendizado
Curadoria de links e dicas para 7 áreas:
`Python · Java · Web Dev · Back-end · Banco de Dados · Bots Discord · Game Dev`

---

## 🐸 Níveis e progressão

| Nível | Nome | XP necessário |
|---|---|---|
| 🥚 | Ovo | 0 |
| 🐛 | Girino Dev | 100 |
| 🐸 | Sapo Programador | 500 |
| ⚙️ | Sapo Engenheiro | 1.500 |
| 👑 | Sapo Lendário | 5.000 |

> Ao atingir o nível máximo, o pet **Rã das Trevas** (Lendário) é desbloqueado automaticamente.

---

## 🐾 Pets disponíveis

| Pet | Raridade | Como obter |
|---|---|---|
| 🐸 Sapo Normal | ⭐ Comum | Todos começam com ele |
| 🏴‍☠️ Capitão Croac | ⭐⭐ Incomum | Loja — 300 🪙 |
| 👻 Rã Fantasma | ⭐⭐ Incomum | Loja — 300 🪙 |
| 🥷 Sapo Sombra | ⭐⭐⭐ Raro | Loja — 600 🪙 |
| 💻 Mr. Pântano | ⭐⭐⭐ Raro | Loja — 600 🪙 |
| 💀 Rã das Trevas | ⭐⭐⭐⭐⭐ Lendário | Atingir nível máximo |
| 🌿 THAL'MOR | 🌎 Primordial | Inatingível |
| 🌑 YØRAX | 🌌 Entidade | Inatingível |

---

## 🚀 Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- Conta no [Discord Developer Portal](https://discord.com/developers/applications)
- Token da API do [Glot.io](https://glot.io) (para execução de código)

### 1. Clone o repositório

```bash
git clone https://github.com/sapo793/study_bot_discord.git
cd study_bot_discord
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
DISCORD_TOKEN=seu_token_do_bot
CLIENT_ID=id_da_aplicacao_discord
GLOT_TOKEN=seu_token_glot_io

# Opcional: ID do servidor para registrar comandos em modo dev
GUILD_ID=id_do_servidor
```

> **Como obter cada valor:**
> - `DISCORD_TOKEN` e `CLIENT_ID`: [Discord Developer Portal](https://discord.com/developers/applications) → sua aplicação → Bot / General Information
> - `GLOT_TOKEN`: crie uma conta em [glot.io](https://glot.io) e gere um token em Account → API Token

### 4. Inicie o bot

```bash
npm start
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

---

## 🕹️ Comandos principais

| Comando | Descrição |
|---|---|
| `!run <linguagem>` | Executa o código da mensagem na linguagem informada |
| `!quest` | Exibe a quest do dia |
| `!ficha` | Exibe seu perfil, nível, XP, moedas e pet equipado |
| `!rank` | Mostra o ranking do servidor por XP |
| `!loja` | Lista os pets disponíveis para compra |
| `!comprar <pet>` | Compra um pet com suas moedas |
| `!equipar <pet>` | Equipa um pet da sua coleção |
| `!pet` | Exibe o status do seu pet (fome, humor, energia) |
| `!alimentar` | Alimenta seu pet (uma vez por dia) |
| `!treinar` | Treina seu pet para batalhas |
| `!batalhar @usuario` | Desafia outro membro para uma batalha de pets |
| `!recursos <área>` | Exibe links e dicas de estudo para uma área |
| `!duvida` | Abre um tópico de dúvida no canal adequado |
| `!ajuda` | Lista todos os comandos disponíveis |

**Linguagens aceitas pelo `!run`:** `python`, `java`, `js`, `ts`, `c`, `cpp`, `go`, `rust`, `ruby`, `php`, `lua`, `bash`

---

## 🛠️ Tecnologias

- [Discord.js](https://discord.js.org/) v14
- [Glot.io API](https://glot.io) — sandbox de execução de código
- [dotenv](https://www.npmjs.com/package/dotenv)
- Node.js (ESModules)
- Persistência em JSON (engine própria, sem banco de dados externo)

---

## 📁 Estrutura do projeto

```
pantanocode/
├── src/
│   ├── index.js          # Entry point e todos os comandos do bot
│   ├── xp.js             # Sistema de XP, moedas, níveis e ranking
│   ├── pets.js           # Catálogo de pets com stats e lore
│   ├── petInteracao.js   # Fome, humor, energia, batalhas e treino
│   ├── quests.js         # Banco de quests e validação de respostas
│   ├── recursos.js       # Curadoria de links por área de programação
│   ├── cargos.js         # Atribuição automática de cargos por nível
│   ├── duvidas.js        # Sistema de canal de dúvidas
│   ├── bossFalas.js      # Falas e eventos especiais
│   ├── piston.js         # Integração com API de execução de código
│   └── scheduler.js      # Agendador para postagem diária de quests
├── assets/
│   ├── pets/             # Imagens dos pets
│   └── ilustracoes/      # Ilustrações de batalha e level up
├── data/                 # Arquivos JSON gerados em runtime (persistência)
├── package.json
└── .env                  # NÃO versionar — adicione ao .gitignore
```

---

## ⚠️ Importante

- O arquivo `.env` já está no `.gitignore` e **nunca deve ser commitado**.
- A pasta `data/` é gerada automaticamente em runtime e armazena o progresso dos usuários localmente.
- Para adicionar o bot ao servidor, gere o link no Discord Developer Portal → OAuth2 → URL Generator, marcando os escopos `bot` e `applications.commands` com as permissões necessárias (enviar mensagens, gerenciar cargos, adicionar reações).

---

## 📄 Licença

MIT
| **Moedas** | Ganhas ao acumular XP, gastas na loja de pets |
| **Pets** | 8 colecionáveis com raridades, stats e lore próprios |
| **Interação com Pet** | Fome, energia e humor com decaimento real ao longo do tempo |
| **Batalhas** | Confrontos entre pets com sistema de stats |
| **Streaks** | Rastreamento de dias consecutivos resolvendo quests |
| **Ranking** | Placar geral do servidor por XP |

### 🐛 Quests diárias
O bot posta automaticamente um desafio diário de código bugado. O membro corrige o bug, executa com `!run` e o bot valida o output — primeiro a resolver ganha bônus de XP.

São 17 quests feitas à mão em Python e Java, cobrindo desde erros simples de lógica até bugs em recursão e busca binária.

### 📚 Recursos de aprendizado
Curadoria de links e dicas para 7 áreas:
`Python · Java · Web Dev · Back-end · Banco de Dados · Bots Discord · Game Dev`

---

## 🐸 Níveis e progressão

| Nível | Nome | XP necessário |
|---|---|---|
| 🥚 | Ovo | 0 |
| 🐛 | Girino Dev | 100 |
| 🐸 | Sapo Programador | 500 |
| ⚙️ | Sapo Engenheiro | 1.500 |
| 👑 | Sapo Lendário | 5.000 |

> Ao atingir o nível máximo, o pet **Rã das Trevas** (Lendário) é desbloqueado automaticamente.

---

## 🐾 Pets disponíveis

| Pet | Raridade | Como obter |
|---|---|---|
| 🐸 Sapo Normal | ⭐ Comum | Todos começam com ele |
| 🏴‍☠️ Capitão Croac | ⭐⭐ Incomum | Loja — 300 🪙 |
| 👻 Rã Fantasma | ⭐⭐ Incomum | Loja — 300 🪙 |
| 🥷 Sapo Sombra | ⭐⭐⭐ Raro | Loja — 600 🪙 |
| 💻 Mr. Pântano | ⭐⭐⭐ Raro | Loja — 600 🪙 |
| 💀 Rã das Trevas | ⭐⭐⭐⭐⭐ Lendário | Atingir nível máximo |
| 🌿 THAL'MOR | 🌎 Primordial | Inatingível |
| 🌑 YØRAX | 🌌 Entidade | Inatingível |

---

## 🚀 Como rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- Conta no [Discord Developer Portal](https://discord.com/developers/applications)
- Token da API do [Glot.io](https://glot.io) (para execução de código)

### 1. Clone o repositório

```bash
git clone https://github.com/sapo793/study_bot_discord.git
cd study_bot_discord
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
DISCORD_TOKEN=seu_token_do_bot
CLIENT_ID=id_da_aplicacao_discord
GLOT_TOKEN=seu_token_glot_io

# Opcional: ID do servidor para registrar comandos em modo dev
GUILD_ID=id_do_servidor
```

> **Como obter cada valor:**
> - `DISCORD_TOKEN` e `CLIENT_ID`: [Discord Developer Portal](https://discord.com/developers/applications) → sua aplicação → Bot / General Information
> - `GLOT_TOKEN`: crie uma conta em [glot.io](https://glot.io) e gere um token em Account → API Token

### 4. Inicie o bot

```bash
npm start
```

Para desenvolvimento com reinicialização automática:

```bash
npm run dev
```

---

## 🕹️ Comandos principais

| Comando | Descrição |
|---|---|
| `!run <linguagem>` | Executa o código da mensagem na linguagem informada |
| `!quest` | Exibe a quest do dia |
| `!ficha` | Exibe seu perfil, nível, XP, moedas e pet equipado |
| `!rank` | Mostra o ranking do servidor por XP |
| `!loja` | Lista os pets disponíveis para compra |
| `!comprar <pet>` | Compra um pet com suas moedas |
| `!equipar <pet>` | Equipa um pet da sua coleção |
| `!pet` | Exibe o status do seu pet (fome, humor, energia) |
| `!alimentar` | Alimenta seu pet (uma vez por dia) |
| `!treinar` | Treina seu pet para batalhas |
| `!batalhar @usuario` | Desafia outro membro para uma batalha de pets |
| `!recursos <área>` | Exibe links e dicas de estudo para uma área |
| `!duvida` | Abre um tópico de dúvida no canal adequado |
| `!ajuda` | Lista todos os comandos disponíveis |

**Linguagens aceitas pelo `!run`:** `python`, `java`, `js`, `ts`, `c`, `cpp`, `go`, `rust`, `ruby`, `php`, `lua`, `bash`

---

## 🛠️ Tecnologias

- [Discord.js](https://discord.js.org/) v14
- [Glot.io API](https://glot.io) — sandbox de execução de código
- [dotenv](https://www.npmjs.com/package/dotenv)
- Node.js (ESModules)
- Persistência em JSON (engine própria, sem banco de dados externo)

---

## 📁 Estrutura do projeto

```
pantanocode/
├── src/
│   ├── index.js          # Entry point e todos os comandos do bot
│   ├── xp.js             # Sistema de XP, moedas, níveis e ranking
│   ├── pets.js           # Catálogo de pets com stats e lore
│   ├── petInteracao.js   # Fome, humor, energia, batalhas e treino
│   ├── quests.js         # Banco de quests e validação de respostas
│   ├── recursos.js       # Curadoria de links por área de programação
│   ├── cargos.js         # Atribuição automática de cargos por nível
│   ├── duvidas.js        # Sistema de canal de dúvidas
│   ├── bossFalas.js      # Falas e eventos especiais
│   ├── piston.js         # Integração com API de execução de código
│   └── scheduler.js      # Agendador para postagem diária de quests
├── assets/
│   ├── pets/             # Imagens dos pets
│   └── ilustracoes/      # Ilustrações de batalha e level up
├── data/                 # Arquivos JSON gerados em runtime (persistência)
├── package.json
└── .env                  # NÃO versionar — adicione ao .gitignore
```

---

## ⚠️ Importante

- O arquivo `.env` já está no `.gitignore` e **nunca deve ser commitado**.
- A pasta `data/` é gerada automaticamente em runtime e armazena o progresso dos usuários localmente.
- Para adicionar o bot ao servidor, gere o link no Discord Developer Portal → OAuth2 → URL Generator, marcando os escopos `bot` e `applications.commands` com as permissões necessárias (enviar mensagens, gerenciar cargos, adicionar reações).

---

## 📄 Licença

MIT

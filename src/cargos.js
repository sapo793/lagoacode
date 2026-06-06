import { readFileSync, writeFileSync, existsSync } from 'fs';
import { EmbedBuilder } from 'discord.js';

const ARQUIVO = './data/cargos.json';

export const CARGOS = [
  { emoji: '🐍', nome: 'Python',   desc: 'Desenvolvimento com Python'         },
  { emoji: '☕', nome: 'Java',     desc: 'Desenvolvimento com Java'            },
  { emoji: '🌐', nome: 'Web Dev',  desc: 'Front-end e frameworks web'          },
  { emoji: '🤖', nome: 'Bot Maker',desc: 'Criação de bots para Discord'        },
  { emoji: '🗄️', nome: 'Database', desc: 'Bancos de dados SQL e NoSQL'         },
  { emoji: '🎮', nome: 'Game Dev', desc: 'Desenvolvimento de jogos'            },
];

function carregar() {
  if (!existsSync(ARQUIVO)) return {};
  try { return JSON.parse(readFileSync(ARQUIVO, 'utf8')); } catch { return {}; }
}

function salvar(dados) {
  writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}

export function getMensagemCargos() {
  return carregar().mensagemId || null;
}

export function setCanalMensagemCargos(canalId, mensagemId) {
  salvar({ canalId, mensagemId });
}

export function getDadosCargos() {
  return carregar();
}

export function buildEmbedCargos() {
  const metade = Math.ceil(CARGOS.length / 2);
  const col1 = CARGOS.slice(0, metade);
  const col2 = CARGOS.slice(metade);

  const linhasColunas = col1.map((c, i) => {
    const c2 = col2[i];
    const esq = `${c.emoji} **${c.nome}**\n${c.desc}`;
    const dir = c2 ? `${c2.emoji} **${c2.nome}**\n${c2.desc}` : '';
    return { name: esq, value: dir || '​', inline: true };
  });

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🎭 Escolha suas Especialidades')
    .setDescription('Reaja com o emoji correspondente para receber o cargo de especialidade.\nReaja novamente para remover.')
    .setFooter({ text: 'PantanoCode • Cargos de especialidade' })
    .setTimestamp();

  // Adiciona campos em pares lado a lado
  for (let i = 0; i < col1.length; i++) {
    const c1 = col1[i];
    const c2 = col2[i];
    embed.addFields({ name: `${c1.emoji} ${c1.nome}`, value: c1.desc, inline: true });
    if (c2) embed.addFields({ name: `${c2.emoji} ${c2.nome}`, value: c2.desc, inline: true });
    // campo vazio pra forçar quebra de linha no Discord (3 colunas)
    if (c2) embed.addFields({ name: '​', value: '​', inline: true });
  }

  return embed;
}

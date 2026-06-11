import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder, Partials, ActivityType } from 'discord.js';
import { executarCodigo, linguagemValida, listarLinguagens } from './piston.js';
import { adicionarXP, getRanking, getUsuario, getNivel, getProximoNivel, registrarQuestResolvida, jaResolveuHoje, adicionarMoedas, gastarMoedas, comprarPet, equiparPet, adicionarTitulo } from './xp.js';
import { getQuestAtiva, validarResposta, registrarResolvedor, tempoRestante } from './quests.js';
import { iniciarScheduler, postarQuestDoDia } from './scheduler.js';
import { CARGOS, setCanalMensagemCargos, getDadosCargos, buildEmbedCargos } from './cargos.js';
import { getPet, listarPets } from './pets.js';
import { getStatusPet, alimentar, treinar, calcularBatalha, calcularBatalhaYorax, calcularBatalhaThalMor, podeBatalhar, getEstatisticas } from './petInteracao.js';
import { registrarReacaoUtil, removerReacaoUtil, abrirThread, resolverThread, XP_REACAO_UTIL, XP_RESOLVER_THREAD } from './duvidas.js';
import { getRecurso, listarAreas, RECURSOS } from './recursos.js';
import { getProvocacao } from './bossFalas.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
});

const DONO_ID = '540661055861293057';
const PREFIX = '!run';
const CANAL = process.env.CANAL_COMANDOS || 'comandos';
const CANAL_QUEST = process.env.CANAL_QUEST || process.env.CANAL_COMANDOS || 'comandos';
const CANAL_CARGOS   = '1511910861143543940';
const CANAL_DUVIDAS  = '1511910922980032532';
const CANAIS_EXTRAS  = ['1511910863974568087'];
const LIMITE_CHARS = 1900;

function truncar(texto) {
  if (texto.length <= LIMITE_CHARS) return texto;
  return texto.slice(0, LIMITE_CHARS) + '\n... (saída truncada)';
}

function canalPermitido(canal) {
  return canal.name === CANAL || canal.id === CANAL ||
         canal.name === CANAL_QUEST || canal.id === CANAL_QUEST ||
         CANAIS_EXTRAS.includes(canal.id);
}

function ehCanalQuest(canal) {
  return canal.name === CANAL_QUEST || canal.id === CANAL_QUEST;
}

async function anunciarNivelUp(canal, userId, nivelNovo) {
  const embed = new EmbedBuilder()
    .setColor(0xf1c40f)
    .setTitle(`${nivelNovo.emoji} Subiu de nível!`)
    .setDescription(`<@${userId}> evoluiu para **${nivelNovo.nome}**!\nO pântano celebra com um Croac especial! 🐸`)
    .setTimestamp();
  await canal.send({ embeds: [embed] });
}

client.once('ready', () => {
  console.log(`🐸 PantanoCode online como ${client.user.tag}`);
  console.log(`📡 Canal de comandos: #${CANAL}`);
  console.log(`🎯 Canal de quests:   #${CANAL_QUEST}`);
  client.user.setActivity('!run <linguagem> | !quest | !rank', { type: ActivityType.Watching });
  iniciarScheduler(client);

  const agendarProvocacao = () => {
    // Entre 1h30 e 3h entre provocações
    const delay = (90 + Math.floor(Math.random() * 90)) * 60 * 1000;
    setTimeout(async () => {
      try {
        const canal = client.channels.cache.get(process.env.CANAL_COMANDOS);
        if (!canal) return;
        const boss = Math.random() < 0.5 ? 'yorax' : 'thalmor';
        const fala = getProvocacao(boss);
        const emoji = boss === 'yorax' ? '🌑' : '🌿';
        const nome  = boss === 'yorax' ? 'YØRAX' : "THAL'MOR";
        await canal.send(`${emoji} **${nome}:** *"${fala}"*`);
      } catch { /* silencioso */ }
      agendarProvocacao();
    }, delay);
  };
  agendarProvocacao();
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  const ehCanalCargos  = msg.channel.id === CANAL_CARGOS;
  const ehCanalDuvidas = msg.channel.id === CANAL_DUVIDAS || msg.channel.parentId === CANAL_DUVIDAS;

  // ─── !ajuda ───────────────────────────────────────────────────────────────
  if (msg.content.trim() === '!ajuda') {
    const embed = new EmbedBuilder()
      .setColor(0x2ecc40)
      .setTitle('🐸 PantanoCode — Comandos')
      .addFields(
        { name: '📌 Como usar',        value: '```\n!run <linguagem>\n<seu código aqui>\n```' },
        { name: '🧪 Exemplo',          value: '```\n!run python\nprint("Croac! 🐸")\n```' },
        {
          name: '🌐 Linguagens suportadas',
          value: [
            '🐍 `python`',
            '🟨 `javascript` / `js`',
            '🔷 `typescript` / `ts`',
            '☕ `java`',
            '⚙️ `c` / `cpp`',
            '🐹 `go`',
            '🦀 `rust`',
            '💎 `ruby` / `rb`',
            '🐘 `php`',
            '🌙 `lua`',
            '💻 `bash` / `sh`',
          ].join('  '),
        },
        { name: '🎯 Quest do dia', value: '`!quest` — ver o desafio ativo' },
        { name: '🏆 Ranking',      value: '`!rank` — top 10 do servidor' },
        { name: '⭐ Meu XP',       value: '`!xp` — seu progresso e nível' },
        { name: '🧹 Limpar canal', value: '`!limpar [qtd]` — só o dono' },
        { name: '📮 Postar quest', value: '`!postquest` — posta a quest do dia manualmente (só o dono)' },
        { name: '🎭 Cargos',      value: '`!cargos` — posta o painel de cargos por reação (só o dono)' },
        { name: '🪙 Saldo',         value: '`!saldo` — ver suas moedas e pet atual' },
        { name: '🛒 Loja',          value: '`!loja` — ver pets disponíveis e preços' },
        { name: '💸 Comprar',       value: '`!comprar <pet>` — comprar um pet com moedas' },
        { name: '👕 Equipar',       value: '`!equipar <pet>` — equipar um pet que você possui' },
        { name: '🐸 Meu pet',       value: '`!pet` — exibir seu pet atual' },
        { name: '🍃 Alimentar',     value: '`!alimentar` — alimenta seu pet 1x por dia (+moedas)' },
        { name: '💪 Treinar',       value: '`!treinar` — treina seu pet 1x por dia (+bônus batalha)' },
        { name: '📊 Status',        value: '`!status` — ver fome, humor, stats e histórico de batalhas' },
        { name: '⚔️ Batalha',       value: '`!batalha @usuario` — desafiar alguém com seu pet' },
        { name: '🌑 Boss',          value: '`!batalha @bot` — desafiar YØRAX ou THAL\'MOR mencionando o bot' },
        { name: '📖 Ficha do pet',  value: '`!ficha <pet>` — veja a lore e ilustração de cada sapo' },
        { name: '📚 Recursos', value: '`!recursos <área>` — links e dicas de estudo por área (python, java, web-dev...)' },
        { name: '❓ Abrir dúvida', value: `\`!duvida <titulo>\` — abre uma thread de dúvida no canal de ajuda` },
        { name: '✅ Resolver',     value: `\`!resolver @usuario\` — dentro da thread, dá +${XP_RESOLVER_THREAD} XP a quem te ajudou` },
        { name: '👍 Resposta útil',value: `Reaja com ✅ em qualquer mensagem no canal de dúvidas para dar +${XP_REACAO_UTIL} XP` },
      )
      .setFooter({ text: 'PantanoCode • Resolve quests pra ganhar XP!' })
      .setTimestamp();
    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !recursos [area] ────────────────────────────────────────────────────
  if (msg.content.startsWith('!recursos')) {
    const area = msg.content.slice('!recursos'.length).trim();

    if (!area) {
      const lista = listarAreas()
        .map(k => `${RECURSOS[k].emoji} \`${k}\``)
        .join('  ');
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('📚 Material Didático — Áreas disponíveis')
        .setDescription(`Use \`!recursos <área>\` para ver links e dicas de estudo.\n\n${lista}`)
        .addFields({ name: '💡 Exemplos', value: '`!recursos python`  `!recursos web-dev`  `!recursos game-dev`' })
        .setFooter({ text: 'PantanoCode • Recursos de estudo' });
      return msg.channel.send({ embeds: [embed] });
    }

    const recurso = getRecurso(area);
    if (!recurso) {
      return msg.reply(`🐸 Área \`${area}\` não encontrada! Use \`!recursos\` para ver as opções.`);
    }

    const linksFormatados = recurso.links
      .map(l => `[${l.label}](${l.url})`)
      .join('\n');

    const topicosFormatados = recurso.topicos
      .map(t => `• ${t}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(recurso.cor)
      .setTitle(`${recurso.emoji} ${recurso.nome} — Recursos de Estudo`)
      .setDescription(recurso.descricao)
      .addFields(
        { name: '📌 Tópicos essenciais', value: topicosFormatados },
        { name: '🔗 Links importantes', value: linksFormatados },
        { name: '💡 Dica do Pântano', value: recurso.dica },
      )
      .setFooter({ text: 'PantanoCode • Use !recursos para ver outras áreas' })
      .setTimestamp();

    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !quest ───────────────────────────────────────────────────────────────
  if (msg.content.trim() === '!quest') {
    const quest = getQuestAtiva();
    if (!quest) {
      return msg.reply('🐸 Nenhuma quest ativa agora. Volta às 08h pra pegar a quest do dia!');
    }

    const restante = tempoRestante();
    const jaFez = jaResolveuHoje(msg.author.id);

    const embed = new EmbedBuilder()
      .setColor(jaFez ? 0x95a5a6 : 0x2ecc40)
      .setTitle(`☐ Quest do dia — Nível ${quest.nivel}  ${restante ? `• ${restante} restantes` : ''}`)
      .setDescription(quest.descricao + (jaFez ? '\n\n✅ **Você já resolveu essa quest hoje!**' : ''))
      .addFields({
        name: '🐛 Código bugado',
        value: `\`\`\`${quest.linguagem}\n${quest.codigoBugado}\n\`\`\``,
      })
      .addFields(
        { name: '🏅 XP base', value: `+${quest.xpBase}`,                              inline: true },
        { name: '⚡ Bônus 1º', value: `+${Math.floor(quest.xpBase * 0.4)}`,           inline: true },
        { name: '🔥 Streak',   value: 'Bônus acumulativo',                             inline: true },
      )
      .setFooter({ text: `Use: !run ${quest.linguagem}  com seu código corrigido` });

    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !rank ────────────────────────────────────────────────────────────────
  if (msg.content.trim() === '!rank') {
    const ranking = getRanking(10);
    if (ranking.length === 0) {
      return msg.reply('🐸 Ainda não há dados de ranking. Resolva uma quest pra aparecer!');
    }

    const medalhas = ['🥇', '🥈', '🥉'];
    const linhas = await Promise.all(ranking.map(async (u, i) => {
      let nome;
      try {
        const membro = await msg.guild.members.fetch(u.id);
        nome = membro.displayName;
      } catch {
        nome = `Usuário ${u.id.slice(-4)}`;
      }
      const nivel = getNivel(u.xp);
      const pos = medalhas[i] || `**${i + 1}.**`;
      return `${pos} ${nivel.emoji} **${nome}** — ${u.xp} XP _(${nivel.nome})_`;
    }));

    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle('🏆 Ranking do Pântano')
      .setDescription(linhas.join('\n'))
      .setTimestamp();

    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !xp ──────────────────────────────────────────────────────────────────
  if (msg.content.trim() === '!xp') {
    const dados = getUsuario(msg.author.id);
    const nivel = getNivel(dados.xp);
    const proximo = getProximoNivel(dados.xp);
    const progresso = proximo
      ? Math.floor(((dados.xp - nivel.minXP) / (proximo.minXP - nivel.minXP)) * 10)
      : 10;
    const barra = '█'.repeat(progresso) + '░'.repeat(10 - progresso);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc40)
      .setTitle(`${nivel.emoji} ${msg.member?.displayName || msg.author.username}`)
      .addFields(
        { name: 'Nível',     value: `${nivel.nome}`,                                         inline: true },
        { name: 'XP total',  value: `${dados.xp} XP`,                                        inline: true },
        { name: 'Streak',    value: `🔥 ${dados.streak} dias`,                               inline: true },
        { name: 'Progresso', value: `\`${barra}\` ${proximo ? `→ ${proximo.nome} (${proximo.minXP} XP)` : 'Nível máximo!'}` },
      )
      .setTimestamp();

    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !limpar ──────────────────────────────────────────────────────────────
  if (msg.content.startsWith('!limpar')) {
    if (msg.author.id !== DONO_ID) {
      return msg.reply('🐸 Só o dono do pântano pode limpar o canal!');
    }
    const partes = msg.content.split(' ');
    const quantidade = parseInt(partes[1]) || 10;
    if (quantidade < 1 || quantidade > 100) {
      return msg.reply('🐸 Quantidade deve ser entre 1 e 100!');
    }
    try {
      const deletadas = await msg.channel.bulkDelete(quantidade + 1, true);
      const aviso = await msg.channel.send(`🐸 ${deletadas.size - 1} mensagens deletadas!`);
      setTimeout(() => aviso.delete().catch(() => {}), 3000);
    } catch (err) {
      msg.reply(`🐸 Erro ao limpar: \`${err.message}\``);
    }
    return;
  }

  // ─── !postquest (dono) ────────────────────────────────────────────────────
  if (msg.content.trim() === '!postquest') {
    if (msg.author.id !== DONO_ID) return;
    await postarQuestDoDia(client);
    return msg.reply('🐸 Quest postada manualmente!');
  }

  // ─── !cargos (dono) ───────────────────────────────────────────────────────
  if (msg.content.trim() === '!cargos') {
    if (msg.author.id !== DONO_ID) {
      return msg.reply('🐸 Só o dono do pântano pode postar o painel de cargos!');
    }
    if (msg.channel.id !== CANAL_CARGOS) {
      return msg.reply(`🐸 Esse comando só funciona no canal <#${CANAL_CARGOS}>!`);
    }
    const embed = buildEmbedCargos();
    const mensagem = await msg.channel.send({ embeds: [embed] });
    setCanalMensagemCargos(msg.channel.id, mensagem.id);
    for (const cargo of CARGOS) {
      await mensagem.react(cargo.emoji);
    }
    return msg.reply('✅ Painel de cargos criado!').then(r => setTimeout(() => r.delete().catch(() => {}), 4000));
  }

  // ─── !infoduvidas (dono) ──────────────────────────────────────────────────
  if (msg.content.trim() === '!infoduvidas') {
    if (msg.author.id !== DONO_ID) return;

    const canal = await client.channels.fetch(CANAL_DUVIDAS).catch(() => null);
    if (!canal) return msg.reply('🐸 Canal de dúvidas não encontrado!');

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('❓ Como funciona o canal de Dúvidas?')
      .setDescription('Ficou travado num problema? Aqui é o lugar certo! Veja como usar o canal:')
      .addFields(
        {
          name: '📌 Abrindo uma dúvida',
          value: [
            'Use o comando abaixo neste canal:',
            '```',
            '!duvida <título da sua dúvida>',
            '```',
            '**Exemplo:**',
            '```',
            '!duvida Como usar async/await em JavaScript?',
            '```',
            '➜ O bot vai criar uma **thread** só pra sua dúvida. Descreva o problema lá dentro com mais detalhes se precisar.',
          ].join('\n'),
        },
        {
          name: '✅ Marcando como resolvida',
          value: [
            'Quando alguém te ajudar, dentro da thread use:',
            '```',
            '!resolver @usuario',
            '```',
            `➜ O bot dá **+${XP_RESOLVER_THREAD} XP** pra quem te ajudou e arquiva a thread automaticamente.`,
            '> ⚠️ Só quem abriu a dúvida pode usar esse comando.',
          ].join('\n'),
        },
        {
          name: '👍 Resposta útil (fora de threads)',
          value: [
            `Achou uma resposta útil aqui no canal? Reaja com **✅** na mensagem!`,
            `➜ O autor da mensagem recebe **+${XP_REACAO_UTIL} XP** automaticamente.`,
            '> Cada pessoa só pode votar uma vez por mensagem.',
          ].join('\n'),
        },
        {
          name: '🏆 Por que participar?',
          value: [
            '> O XP ganho aqui conta pro seu **ranking global** do servidor.',
            '> Ajudar outros é a forma mais rápida de subir de nível! 🐸',
          ].join('\n'),
        },
      )
      .setFooter({ text: 'PantanoCode • Canal de Dúvidas — Croac! 🐸' })
      .setTimestamp();

    await canal.send({ embeds: [embed] });
    return msg.reply('✅ Mensagem de ajuda postada!').then(r => setTimeout(() => r.delete().catch(() => {}), 4000));
  }

  // ─── !saldo ───────────────────────────────────────────────────────────────
  if (msg.content.trim() === '!saldo') {
    const dados = getUsuario(msg.author.id);
    const embed = new EmbedBuilder()
      .setColor(0xf1c40f)
      .setTitle(`🪙 Saldo de ${msg.member?.displayName || msg.author.username}`)
      .addFields(
        { name: '🪙 Moedas',    value: `${dados.moedas || 0} moedas`,  inline: true },
        { name: '⭐ XP total',  value: `${dados.xp} XP`,               inline: true },
        { name: '🐸 Pet atual', value: dados.petEquipado || 'normal',   inline: true },
      )
      .setFooter({ text: 'Ganhe moedas resolvendo quests e ajudando no canal de dúvidas!' })
      .setTimestamp();
    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !loja ────────────────────────────────────────────────────────────────
  if (msg.content.trim() === '!loja') {
    const dados = getUsuario(msg.author.id);
    const pets = listarPets().filter(p => p.id !== 'normal' && p.id !== 'lendario' && p.id !== 'yorax');
    const linhas = pets.map(p => {
      const possui = dados.pets?.includes(p.id);
      return `${p.emoji} **${p.nome}** — ${p.preco} 🪙 ${possui ? '✅ *possuído*' : ''}`;
    });

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('🛒 Loja de Pets')
      .setDescription(linhas.join('\n'))
      .addFields(
        { name: '🪙 Seu saldo',  value: `${dados.moedas || 0} moedas`,  inline: true },
        { name: '💡 Como comprar', value: '`!comprar <pet>`',            inline: true },
        { name: '🔒 Lendário',   value: 'Atingir nível máximo',         inline: true },
      )
      .setFooter({ text: 'Use !ficha <pet> para ver a lore de cada sapo!' })
      .setTimestamp();
    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !comprar <pet> ───────────────────────────────────────────────────────
  if (msg.content.startsWith('!comprar')) {
    const id = msg.content.slice('!comprar'.length).trim().toLowerCase();
    if (!id) return msg.reply('🐸 Informe o pet! Ex: `!comprar ninja`');

    const pet = getPet(id);
    if (!pet) return msg.reply(`🐸 Pet \`${id}\` não encontrado! Use \`!loja\` pra ver as opções.`);
    if (id === 'normal') return msg.reply('🐸 Você já tem o sapo normal!');
    if (id === 'lendario') return msg.reply('🐸 O pet lendário só é desbloqueado atingindo o nível máximo!');
    if (id === 'yorax') return msg.reply('🌑 YØRAX não pode ser comprado. Ele escolhe seus adversários.');

    const dados = getUsuario(msg.author.id);
    if (dados.pets?.includes(id)) return msg.reply(`🐸 Você já possui o **${pet.nome}**!`);
    if ((dados.moedas || 0) < pet.preco) {
      return msg.reply(`🐸 Moedas insuficientes! Você tem **${dados.moedas || 0} 🪙** e precisa de **${pet.preco} 🪙**.`);
    }

    gastarMoedas(msg.author.id, pet.preco);
    comprarPet(msg.author.id, id);
    const dadosAtual = getUsuario(msg.author.id);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc40)
      .setTitle(`🎉 Pet comprado!`)
      .setDescription(`Você adquiriu o **${pet.emoji} ${pet.nome}**!`)
      .addFields(
        { name: '💸 Gasto',       value: `${pet.preco} 🪙`,              inline: true },
        { name: '🪙 Saldo atual', value: `${dadosAtual.moedas} 🪙`,      inline: true },
      )
      .setFooter({ text: 'Use !equipar para equipá-lo e !pet para exibi-lo!' })
      .setTimestamp();
    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !equipar <pet> ───────────────────────────────────────────────────────
  if (msg.content.startsWith('!equipar')) {
    const id = msg.content.slice('!equipar'.length).trim().toLowerCase();
    if (!id) return msg.reply('🐸 Informe o pet! Ex: `!equipar ninja`');

    const pet = getPet(id);
    if (!pet) return msg.reply(`🐸 Pet \`${id}\` não encontrado!`);

    const resultado = equiparPet(msg.author.id, id);
    if (!resultado.ok) return msg.reply(`🐸 ${resultado.motivo}`);

    return msg.reply(`✅ **${pet.emoji} ${pet.nome}** equipado! Use \`!pet\` pra exibir.`);
  }

  // ─── !pet ─────────────────────────────────────────────────────────────────
  if (msg.content.trim() === '!pet') {
    const dados = getUsuario(msg.author.id);
    const id = dados.petEquipado || 'normal';
    const pet = getPet(id);

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`${pet.emoji} Pet de ${msg.member?.displayName || msg.author.username}`)
      .setDescription(`**${pet.nome}**\n${pet.raridade}`)
      .setFooter({ text: 'Use !loja para ver outros pets • !equipar para trocar' })
      .setTimestamp();

    if (pet.arquivo) {
      const { AttachmentBuilder } = await import('discord.js');
      const anexo = new AttachmentBuilder(`./assets/pets/${pet.arquivo}`);
      embed.setImage(`attachment://${pet.arquivo}`);
      return msg.channel.send({ embeds: [embed], files: [anexo] });
    }

    embed.setDescription(`**${pet.nome}**\n${pet.raridade}\n\n🐸 *(sem imagem — pet padrão)*`);
    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !alimentar ───────────────────────────────────────────────────────────
  if (msg.content.trim() === '!alimentar') {
    const dados = getUsuario(msg.author.id);
    const pet = getPet(dados.petEquipado || 'normal');
    const resultado = alimentar(msg.author.id);
    if (!resultado.ok) return msg.reply(`🐸 ${resultado.motivo}`);

    const moedasBonus = 10;
    adicionarMoedas(msg.author.id, moedasBonus);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc40)
      .setTitle(`🍃 ${pet.emoji} ${pet.nome} foi alimentado!`)
      .addFields(
        { name: '🍽️ Fome',    value: `${resultado.fome}/100`,     inline: true },
        { name: '😄 Humor',   value: resultado.humorLabel,         inline: true },
        { name: '🪙 Bônus',   value: `+${moedasBonus} moedas`,    inline: true },
      )
      .setFooter({ text: 'Volte amanhã pra alimentar novamente!' })
      .setTimestamp();
    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !treinar ─────────────────────────────────────────────────────────────
  if (msg.content.trim() === '!treinar') {
    const dados = getUsuario(msg.author.id);
    const pet = getPet(dados.petEquipado || 'normal');
    const resultado = treinar(msg.author.id);
    if (!resultado.ok) return msg.reply(`🐸 ${resultado.motivo}`);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle(`💪 ${pet.emoji} ${pet.nome} treinou!`)
      .setDescription('Seu pet ficou mais forte para a próxima batalha!')
      .addFields(
        { name: '⚔️ Bônus ganho',   value: `+${resultado.bonusGanho} ataque`,      inline: true },
        { name: '📈 Bônus total',    value: `+${resultado.bonusTotal} acumulado`,   inline: true },
      )
      .setFooter({ text: 'Treine todo dia para ficar mais forte nas batalhas!' })
      .setTimestamp();
    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !status ──────────────────────────────────────────────────────────────
  if (msg.content.trim() === '!status') {
    const dados = getUsuario(msg.author.id);
    const pet = getPet(dados.petEquipado || 'normal');
    const status = getStatusPet(msg.author.id);
    const stats = getEstatisticas(msg.author.id);

    const barraFome  = '█'.repeat(Math.floor(status.fome / 10))  + '░'.repeat(10 - Math.floor(status.fome / 10));
    const barraHumor = '█'.repeat(Math.floor(status.humor / 10)) + '░'.repeat(10 - Math.floor(status.humor / 10));

    const embed = new EmbedBuilder()
      .setColor(0x9b59b6)
      .setTitle(`${pet.emoji} Status de ${msg.member?.displayName || msg.author.username}`)
      .addFields(
        { name: '🍽️ Fome',         value: `\`${barraFome}\` ${status.fome}/100`,    inline: false },
        { name: '😄 Humor',        value: `\`${barraHumor}\` ${status.humorLabel}`,  inline: false },
        { name: '⚔️ Bônus treino', value: `+${stats.bonusTreino} ataque`,            inline: true  },
        { name: '🏆 Vitórias',     value: `${stats.vitorias}`,                        inline: true  },
        { name: '💀 Derrotas',     value: `${stats.derrotas}`,                        inline: true  },
        { name: '📊 Stats base',   value: `⚔️ ${pet.stats.ataque} ATK  🛡️ ${pet.stats.defesa} DEF  ⚡ ${pet.stats.velocidade} VEL`, inline: false },
      )
      .setFooter({ text: '!alimentar para aumentar fome • !treinar para aumentar ataque' })
      .setTimestamp();
    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !batalha @bot (YØRAX ou THAL'MOR) ──────────────────────────────────
  if (msg.content.startsWith('!batalha') && msg.mentions.users.size > 0) {
    const alvo = msg.mentions.users.first();
    const YORAX_ID   = '1508885040535179274';
    const THALMOR_ID = '1510390483556368505';

    if (!alvo.bot || (alvo.id !== YORAX_ID && alvo.id !== THALMOR_ID)) {
      // Deixa cair para o handler de batalha normal abaixo
    } else {
      const cooldown = podeBatalhar(msg.author.id);
      if (!cooldown.ok) return msg.reply(`⏳ ${cooldown.motivo}`);

      const dadosUser = getUsuario(msg.author.id);
      const petEquipadoId = dadosUser.petEquipado || 'normal';
      const petUser = { ...getPet(petEquipadoId), id: petEquipadoId };
      const { AttachmentBuilder } = await import('discord.js');

      if (alvo.id === YORAX_ID) {
        const resultado = calcularBatalhaYorax({ id: msg.author.id }, petUser);

        const anexo = new AttachmentBuilder('./assets/pets/pet_yorax.png');
        const embedInicio = new EmbedBuilder()
          .setColor(0x1a0030)
          .setTitle('🌑 YØRAX, O ARQUITETO DO VAZIO')
          .setDescription(`**${msg.member?.displayName || msg.author.username}** (${petUser.emoji} ${petUser.nome}) ousou desafiar a Entidade!\n\n*"${resultado.falaInicio}"*`)
          .setImage('attachment://pet_yorax.png')
          .setFooter({ text: 'Calculando resultado...' });

        await msg.channel.send({ embeds: [embedInicio], files: [anexo] });
        await new Promise(r => setTimeout(r, 2000));

        let recompensaTexto = '';
        if (resultado.atacanteVenceu) {
          adicionarXP(msg.author.id, 100, 'batalha_yorax');
          adicionarMoedas(msg.author.id, 200);
          recompensaTexto = '+100 XP / +200 🪙';
          if (resultado.primeiraVitoria) adicionarTitulo(msg.author.id, 'Quebrador do Vazio');
        }

        const embedResultado = new EmbedBuilder()
          .setColor(resultado.atacanteVenceu ? 0x2ecc40 : 0x1a0030)
          .setTitle(resultado.atacanteVenceu ? '🏆 Você derrotou YØRAX!' : '🌑 YØRAX venceu')
          .setDescription(`*${resultado.mensagem}*\n\n` + resultado.log.join('\n'))
          .addFields(
            { name: `${petUser.emoji} Seu HP`, value: `${resultado.hpA}`, inline: true },
            { name: '🌑 HP de YØRAX',          value: `${resultado.hpY}`, inline: true },
          );
        if (recompensaTexto) embedResultado.addFields({ name: '🎁 Recompensa', value: recompensaTexto, inline: false });
        if (resultado.primeiraVitoria) embedResultado.addFields({
          name: '🌌 Título desbloqueado!',
          value: '**"Quebrador do Vazio"** 🌌🐸\nVocê fez o impossível. YØRAX foi forçado a reconhecer sua existência.',
          inline: false,
        });
        embedResultado.setFooter({ text: 'YØRAX, o Arquiteto do Vazio • Cooldown: 5 minutos' }).setTimestamp();
        return msg.channel.send({ embeds: [embedResultado] });

      } else {
        const resultado = calcularBatalhaThalMor({ id: msg.author.id }, petUser);

        const anexo = new AttachmentBuilder('./assets/pets/sapo_anciao.png');
        const embedInicio = new EmbedBuilder()
          .setColor(0x1a3a0a)
          .setTitle("🌿 THAL'MOR, O GUARDIÃO DAS MEMÓRIAS PERDIDAS")
          .setDescription(`**${msg.member?.displayName || msg.author.username}** (${petUser.emoji} ${petUser.nome}) ousou perturbar o Primordial!\n\n*"${resultado.falaInicio}"*`)
          .setImage('attachment://sapo_anciao.png')
          .setFooter({ text: 'Calculando resultado...' });

        await msg.channel.send({ embeds: [embedInicio], files: [anexo] });
        await new Promise(r => setTimeout(r, 2000));

        let recompensaTexto = '';
        if (resultado.atacanteVenceu) {
          adicionarXP(msg.author.id, 120, 'batalha_thalmor');
          adicionarMoedas(msg.author.id, 250);
          recompensaTexto = '+120 XP / +250 🪙';
          if (resultado.primeiraVitoria) adicionarTitulo(msg.author.id, 'Desperto dos Lagos');
        }

        const embedResultado = new EmbedBuilder()
          .setColor(resultado.atacanteVenceu ? 0x2ecc40 : 0x1a3a0a)
          .setTitle(resultado.atacanteVenceu ? "🏆 Você venceu THAL'MOR!" : "🌿 THAL'MOR venceu")
          .setDescription(`*${resultado.mensagem}*\n\n` + resultado.log.join('\n'))
          .addFields(
            { name: `${petUser.emoji} Seu HP`,    value: `${resultado.hpA}`, inline: true },
            { name: "🌿 HP de THAL'MOR",          value: `${resultado.hpT}`, inline: true },
          );
        if (recompensaTexto) embedResultado.addFields({ name: '🎁 Recompensa', value: recompensaTexto, inline: false });
        if (resultado.primeiraVitoria) embedResultado.addFields({
          name: '🌿 Título desbloqueado!',
          value: '**"Desperto dos Lagos"** 🌿🐸\nOs lagos primordiais reconheceram sua força.',
          inline: false,
        });
        embedResultado.setFooter({ text: "THAL'MOR, o Guardião das Memórias • Cooldown: 5 minutos" }).setTimestamp();
        return msg.channel.send({ embeds: [embedResultado] });
      }
    }
  }

  // ─── !batalha @usuario ────────────────────────────────────────────────────
  if (msg.content.startsWith('!batalha')) {
    const alvo = msg.mentions.users.first();
    if (!alvo) return msg.reply('🐸 Mencione quem quer desafiar! Ex: `!batalha @usuario` ou `!batalha bot`');
    if (alvo.id === msg.author.id) return msg.reply('🐸 Você não pode batalhar contra si mesmo!');
    if (alvo.bot) return msg.reply('🐸 Para desafiar o bot, use `!batalha bot`!');

    const cooldownAtacante = podeBatalhar(msg.author.id);
    if (!cooldownAtacante.ok) return msg.reply(`🐸 ${cooldownAtacante.motivo}`);

    const dadosAtacante = getUsuario(msg.author.id);
    const dadosDefensor = getUsuario(alvo.id);
    const petAtacante = getPet(dadosAtacante.petEquipado || 'normal');
    const petDefensor = getPet(dadosDefensor.petEquipado || 'normal');

    const nomeAtacante = msg.member?.displayName || msg.author.username;
    const nomeDefensor = msg.guild.members.cache.get(alvo.id)?.displayName || alvo.username;

    const embedInicio = new EmbedBuilder()
      .setColor(0xe74c3c)
      .setTitle('⚔️ BATALHA DE PETS!')
      .setDescription(`**${nomeAtacante}** (${petAtacante.emoji} ${petAtacante.nome}) desafiou **${nomeDefensor}** (${petDefensor.emoji} ${petDefensor.nome})!`)
      .addFields(
        { name: `${petAtacante.emoji} ${petAtacante.nome}`, value: `⚔️ ${petAtacante.stats.ataque} ATK\n🛡️ ${petAtacante.stats.defesa} DEF\n⚡ ${petAtacante.stats.velocidade} VEL`, inline: true },
        { name: 'VS', value: '​', inline: true },
        { name: `${petDefensor.emoji} ${petDefensor.nome}`, value: `⚔️ ${petDefensor.stats.ataque} ATK\n🛡️ ${petDefensor.stats.defesa} DEF\n⚡ ${petDefensor.stats.velocidade} VEL`, inline: true },
      )
      .setFooter({ text: 'Calculando resultado...' });

    const msgBatalha = await msg.channel.send({ embeds: [embedInicio] });
    await new Promise(r => setTimeout(r, 2000));

    const { atacanteVenceu, log, hpA, hpB } = calcularBatalha(
      msg.author, alvo, petAtacante, petDefensor
    );

    const vencedorNome  = atacanteVenceu ? nomeAtacante  : nomeDefensor;
    const vencedorPet   = atacanteVenceu ? petAtacante   : petDefensor;
    const perdedorNome  = atacanteVenceu ? nomeDefensor  : nomeAtacante;
    const moedasGanhas  = 50;

    adicionarMoedas(atacanteVenceu ? msg.author.id : alvo.id, moedasGanhas);

    const embedResultado = new EmbedBuilder()
      .setColor(atacanteVenceu ? 0xf1c40f : 0x9b59b6)
      .setTitle(`🏆 ${vencedorPet.emoji} ${vencedorNome} venceu!`)
      .setDescription(log.join('\n'))
      .addFields(
        { name: '🏆 Vencedor',   value: `${vencedorNome} (HP: ${atacanteVenceu ? hpA : hpB})`,  inline: true },
        { name: '💀 Derrotado',  value: `${perdedorNome} (HP: ${atacanteVenceu ? hpB : hpA})`,  inline: true },
        { name: '🪙 Recompensa', value: `+${moedasGanhas} moedas pro vencedor!`,                 inline: false },
      )
      .setFooter({ text: 'Treine seu pet com !treinar para ficar mais forte!' })
      .setTimestamp();

    return msgBatalha.edit({ embeds: [embedResultado] });
  }

  // ─── !ficha <pet> ────────────────────────────────────────────────────────
  if (msg.content.startsWith('!ficha')) {
    const id = msg.content.slice('!ficha'.length).trim().toLowerCase();

    if (!id) {
      const lista = listarPets()
        .map(p => `${p.emoji} \`${p.id}\` — ${p.nome} ${p.raridade}`)
        .join('\n');
      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('📖 Fichas disponíveis')
        .setDescription(`Use \`!ficha <nome>\` para ver a ficha completa.\n\n${lista}`)
        .setFooter({ text: 'Ex: !ficha ninja' });
      return msg.channel.send({ embeds: [embed] });
    }

    const pet = getPet(id);
    if (!pet) {
      return msg.reply(`🐸 Pet \`${id}\` não encontrado! Use \`!ficha\` pra ver a lista.`);
    }

    const cores = { Comum: 0x95a5a6, Incomum: 0x2ecc71, Raro: 0x3498db, Lendário: 0x9b59b6, Entidade: 0x1a0030 };
    const cor = Object.entries(cores).find(([k]) => pet.raridade.includes(k))?.[1] || 0x2ecc40;

    const embed = new EmbedBuilder()
      .setColor(cor)
      .setTitle(`${pet.emoji} ${pet.nome}`)
      .addFields(
        { name: '✨ Raridade',     value: pet.raridade,     inline: true },
        { name: '💰 Preço',        value: pet.preco > 0 ? `${pet.preco} 🪙` : 'Inatingível', inline: true },
        { name: '🔓 Desbloqueio',  value: pet.desbloqueio,  inline: false },
        { name: '📜 Lore',         value: `*${pet.lore}*`,  inline: false },
      )
      .setFooter({ text: 'PantanoCode • Fichas de Pets' })
      .setTimestamp();

    const arquivoIlustracao = pet.ilustracao
      ? `./assets/ilustracoes/${pet.ilustracao}`
      : null;

    if (arquivoIlustracao) {
      const { AttachmentBuilder } = await import('discord.js');
      const anexo = new AttachmentBuilder(arquivoIlustracao);
      embed.setImage(`attachment://${pet.ilustracao}`);
      return msg.channel.send({ embeds: [embed], files: [anexo] });
    }

    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !duvida <titulo> ─────────────────────────────────────────────────────
  if (msg.content.startsWith('!duvida')) {
    if (msg.channel.id !== CANAL_DUVIDAS) {
      return msg.reply(`🐸 Use esse comando no canal <#${CANAL_DUVIDAS}>!`);
    }
    const titulo = msg.content.slice('!duvida'.length).trim();
    if (!titulo) return msg.reply('🐸 Informe o título da dúvida! Ex: `!duvida Como usar async/await em JS?`');

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle(`❓ ${titulo}`)
      .setDescription(`<@${msg.author.id}> abriu uma dúvida. Quem souber, responda na thread abaixo!\nQuando sua dúvida for resolvida, use \`!resolver @usuario\` na thread para dar XP a quem te ajudou. 🐸`)
      .setFooter({ text: 'PantanoCode • Sistema de Dúvidas' })
      .setTimestamp();

    const msgEmbed = await msg.channel.send({ embeds: [embed] });
    const thread = await msgEmbed.startThread({
      name: titulo.slice(0, 100),
      autoArchiveDuration: 1440,
      reason: `Dúvida de ${msg.author.username}`,
    });
    abrirThread(thread.id, msg.author.id, titulo);
    await thread.send(`👋 <@${msg.author.id}>, sua dúvida foi aberta! Descreva o problema aqui com mais detalhes se precisar.\nQuando resolver, use \`!resolver @usuario\` aqui dentro para dar **+${XP_RESOLVER_THREAD} XP** a quem te ajudou!`);
    await msg.delete().catch(() => {});
    return;
  }

  // ─── !resolver @usuario ───────────────────────────────────────────────────
  if (msg.content.startsWith('!resolver')) {
    const thread = msg.channel;
    if (!thread.isThread?.() || thread.parentId !== CANAL_DUVIDAS) {
      return msg.reply('🐸 Esse comando só funciona dentro de uma thread de dúvida!');
    }
    const mencionado = msg.mentions.users.first();
    if (!mencionado) return msg.reply('🐸 Mencione quem te ajudou! Ex: `!resolver @usuario`');

    const resultado = resolverThread(thread.id, msg.author.id, mencionado.id);
    if (!resultado.ok) return msg.reply(`🐸 ${resultado.motivo}`);

    const { subiu, nivelDepois, xpTotal } = adicionarXP(mencionado.id, XP_RESOLVER_THREAD);

    const embed = new EmbedBuilder()
      .setColor(0x2ecc40)
      .setTitle('✅ Dúvida resolvida!')
      .setDescription(`<@${msg.author.id}> marcou <@${mencionado.id}> como quem resolveu essa dúvida!`)
      .addFields(
        { name: '💰 XP ganho',  value: `+${XP_RESOLVER_THREAD} XP`,      inline: true },
        { name: '⭐ Total',      value: `${xpTotal} XP`,                   inline: true },
        { name: '🐸 Nível',     value: nivelDepois.nome,                   inline: true },
      )
      .setTimestamp();

    await thread.send({ embeds: [embed] });
    await thread.setArchived(true).catch(() => {});
    if (subiu) setTimeout(() => anunciarNivelUp(thread, mencionado.id, nivelDepois), 1000);
    return;
  }

  // ─── !run ─────────────────────────────────────────────────────────────────
  if (!msg.content.startsWith(PREFIX)) return;

  const conteudo = msg.content.slice(PREFIX.length).trim();

  if (conteudo === 'help' || conteudo === '') {
    const langs = listarLinguagens().join(', ');
    return msg.reply(
      `🐸 **PantanoCode** — Execute código no pântano!\n\n` +
      `**Como usar:**\n\`\`\`\n!run <linguagem>\n<código>\n\`\`\`\n` +
      `**Linguagens:** ${langs}`
    );
  }

  const linhas = conteudo.split('\n');
  const lang = linhas[0].trim().toLowerCase();
  const codigo = linhas.slice(1).join('\n').trim();

  if (!linguagemValida(lang)) {
    return msg.reply(
      `🐸 Linguagem \`${lang}\` não reconhecida. Use \`!run help\` pra ver as opções.`
    );
  }

  if (!codigo) {
    return msg.reply(`🐸 Manda o código depois da linguagem!`);
  }

  const aviso = await msg.reply('🐸 Mergulhando no pântano... aguarda!');

  try {
    const inicio = Date.now();
    const resultado = await executarCodigo(lang, codigo);
    const tempo = Date.now() - inicio;

    if (!resultado) {
      return aviso.edit('🐸 Erro ao conectar com a API. Tenta de novo!');
    }

    const temSaida = resultado.stdout.length > 0;
    const temErro = resultado.stderr.length > 0;
    const sucesso = resultado.codigo === 0;

    // ── Verifica se é resposta de quest ──────────────────────────────────
    const questAtiva = getQuestAtiva();
    const noQuestChannel = ehCanalQuest(msg.channel);
    let embedQuest = null;

    if (questAtiva && noQuestChannel && sucesso && temSaida) {
      const acertou = validarResposta(resultado.stdout);

      if (acertou) {
        const { jaResolveu, primeiro } = registrarResolvedor(msg.author.id);

        if (!jaResolveu) {
          const atualizou = registrarQuestResolvida(msg.author.id);

          if (atualizou) {
            let xpGanho = questAtiva.xpBase;
            const dados = getUsuario(msg.author.id);
            let descricaoXP = `+${xpGanho} XP (quest)`;

            if (primeiro) {
              const bonus = Math.floor(questAtiva.xpBase * 0.4);
              xpGanho += bonus;
              descricaoXP += ` +${bonus} XP (1º a resolver! ⚡)`;
            }

            if (dados.streak > 1) {
              const bonusStreak = Math.min(dados.streak * 5, 50);
              xpGanho += bonusStreak;
              descricaoXP += ` +${bonusStreak} XP (streak ${dados.streak}🔥)`;
            }

            const { subiu, nivelDepois } = adicionarXP(msg.author.id, xpGanho);
            const dadosAtual = getUsuario(msg.author.id);

            embedQuest = new EmbedBuilder()
              .setColor(0x2ecc40)
              .setTitle('✅ Quest resolvida!')
              .setDescription(`<@${msg.author.id}> corrigiu o bug do sapo!`)
              .addFields(
                { name: '💰 XP ganho',   value: descricaoXP,                   inline: false },
                { name: '⭐ Total',       value: `${dadosAtual.xp} XP`,         inline: true  },
                { name: '🔥 Streak',      value: `${dadosAtual.streak} dias`,   inline: true  },
                { name: '🐸 Nível',       value: nivelDepois.nome,              inline: true  },
              );

            if (subiu) {
              setTimeout(() => anunciarNivelUp(msg.channel, msg.author.id, nivelDepois), 1500);
            }
          } else {
            embedQuest = new EmbedBuilder()
              .setColor(0x2ecc40)
              .setTitle('✅ Correto!')
              .setDescription('Output correto! Mas você já ganhou XP dessa quest hoje.');
          }
        } else {
          embedQuest = new EmbedBuilder()
            .setColor(0x2ecc40)
            .setTitle('✅ Correto!')
            .setDescription('Output correto! (XP já computado na sua primeira resolução hoje)');
        }
      } else if (temSaida) {
        embedQuest = new EmbedBuilder()
          .setColor(0xe74c3c)
          .setTitle('❌ Output incorreto')
          .setDescription(
            `Esperado: \`${questAtiva.outputEsperado}\`\n` +
            `Obtido: \`${resultado.stdout.trim().slice(0, 100)}\`\n\n` +
            `💡 **Dica:** ${questAtiva.dica}`
          );
      }
    }

    // ── Monta resposta de execução ────────────────────────────────────────
    let resposta = '';
    if (sucesso && temSaida) {
      resposta = `✅ **Output** _(${lang} • ${tempo}ms)_:\n\`\`\`\n${truncar(resultado.stdout)}\n\`\`\``;
    } else if (!sucesso && temErro) {
      resposta = `❌ **Erro** _(código ${resultado.codigo})_:\n\`\`\`\n${truncar(resultado.stderr)}\n\`\`\``;
    } else if (temSaida && temErro) {
      resposta =
        `⚠️ **Output:**\n\`\`\`\n${truncar(resultado.stdout)}\n\`\`\`` +
        `\n**Stderr:**\n\`\`\`\n${truncar(resultado.stderr)}\n\`\`\``;
    } else {
      resposta = `✅ Código executado sem saída _(${tempo}ms)_.`;
    }

    if (embedQuest) {
      await aviso.edit({ content: resposta, embeds: [embedQuest] });
    } else {
      await aviso.edit(resposta);
    }
  } catch (err) {
    console.error('Erro ao executar código:', err?.message || err);
    await aviso.edit(`🐸 O pântano explodiu! Erro: \`${err?.message || err}\``);
  }
});

// ─── Reações para cargos ──────────────────────────────────────────────────
async function handleReacaoCargo(reaction, user, adicionar) {
  if (user.bot) return;
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }
  if (reaction.message.partial) {
    try { await reaction.message.fetch(); } catch { return; }
  }

  const dados = getDadosCargos();
  if (!dados.mensagemId || reaction.message.id !== dados.mensagemId) return;

  const emojiNome = reaction.emoji.name?.replace(/️/g, '');
  const entrada = CARGOS.find(c => c.emoji.replace(/️/g, '') === emojiNome);
  if (!entrada) return;

  const guild = reaction.message.guild;
  if (!guild) return;

  let cargo = guild.roles.cache.find(r => r.name === entrada.nome);
  if (!cargo) {
    try {
      cargo = await guild.roles.create({ name: entrada.nome, reason: 'Cargo de especialidade PantanoCode' });
    } catch (err) {
      console.error(`Erro ao criar cargo ${entrada.nome}:`, err.message);
      return;
    }
  }

  const membro = await guild.members.fetch(user.id).catch(() => null);
  if (!membro) return;

  try {
    if (adicionar) {
      await membro.roles.add(cargo);
    } else {
      await membro.roles.remove(cargo);
    }
  } catch (err) {
    console.error(`Erro ao ${adicionar ? 'adicionar' : 'remover'} cargo ${entrada.nome}:`, err.message);
  }
}

// ─── Reação ✅ no canal de dúvidas ─────────────────────────────────────────
async function handleReacaoDuvida(reaction, user, adicionar) {
  if (user.bot) return;
  if (reaction.partial) { try { await reaction.fetch(); } catch { return; } }
  if (reaction.emoji.name !== '✅') return;

  const msg = reaction.message.partial ? await reaction.message.fetch().catch(() => null) : reaction.message;
  if (!msg) return;
  if (msg.channel.id !== CANAL_DUVIDAS) return;
  if (msg.author.bot) return;

  if (adicionar) {
    const { ok } = registrarReacaoUtil(msg.id, user.id, msg.author.id);
    if (!ok) return;

    const { subiu, nivelDepois, xpTotal } = adicionarXP(msg.author.id, XP_REACAO_UTIL);
    const guild = msg.guild;
    const membro = await guild.members.fetch(msg.author.id).catch(() => null);
    const nome = membro?.displayName || msg.author.username;

    const embed = new EmbedBuilder()
      .setColor(0x2ecc40)
      .setTitle('👍 Resposta útil!')
      .setDescription(`<@${user.id}> marcou a resposta de **${nome}** como útil!`)
      .addFields(
        { name: '💰 XP ganho', value: `+${XP_REACAO_UTIL} XP`, inline: true },
        { name: '⭐ Total',     value: `${xpTotal} XP`,          inline: true },
        { name: '🐸 Nível',    value: nivelDepois.nome,           inline: true },
      )
      .setTimestamp();

    await msg.channel.send({ embeds: [embed] }).then(m => setTimeout(() => m.delete().catch(() => {}), 8000));
    if (subiu) setTimeout(() => anunciarNivelUp(msg.channel, msg.author.id, nivelDepois), 1500);
  } else {
    removerReacaoUtil(msg.id, user.id);
  }
}

client.on('messageReactionAdd', async (reaction, user) => {
  await handleReacaoCargo(reaction, user, true);
  await handleReacaoDuvida(reaction, user, true);
});
client.on('messageReactionRemove', async (reaction, user) => {
  await handleReacaoCargo(reaction, user, false);
  await handleReacaoDuvida(reaction, user, false);
});

client.login(process.env.DISCORD_TOKEN);

import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder, Partials } from 'discord.js';
import { executarCodigo, linguagemValida, listarLinguagens } from './piston.js';
import { adicionarXP, getRanking, getUsuario, getNivel, getProximoNivel, registrarQuestResolvida, jaResolveuHoje } from './xp.js';
import { getQuestAtiva, validarResposta, registrarResolvedor, tempoRestante, sortearQuestDoDia } from './quests.js';
import { iniciarScheduler, postarQuestDoDia } from './scheduler.js';
import { CARGOS, getMensagemCargos, setCanalMensagemCargos, getDadosCargos, buildEmbedCargos } from './cargos.js';
import { registrarReacaoUtil, removerReacaoUtil, abrirThread, resolverThread, getThread, XP_REACAO_UTIL, XP_RESOLVER_THREAD } from './duvidas.js';

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
const LIMITE_CHARS = 1900;

function truncar(texto) {
  if (texto.length <= LIMITE_CHARS) return texto;
  return texto.slice(0, LIMITE_CHARS) + '\n... (saída truncada)';
}

function canalPermitido(canal) {
  return canal.name === CANAL || canal.id === CANAL ||
         canal.name === CANAL_QUEST || canal.id === CANAL_QUEST;
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
  client.user.setActivity('!run <linguagem> | !quest | !rank', { type: 'WATCHING' });
  iniciarScheduler(client);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  const ehCanalCargos  = msg.channel.id === CANAL_CARGOS;
  const ehCanalDuvidas = msg.channel.id === CANAL_DUVIDAS || msg.channel.parentId === CANAL_DUVIDAS;
  if (!canalPermitido(msg.channel) && !ehCanalCargos && !ehCanalDuvidas) return;

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
        { name: '❓ Abrir dúvida', value: `\`!duvida <titulo>\` — abre uma thread de dúvida no canal de ajuda` },
        { name: '✅ Resolver',     value: `\`!resolver @usuario\` — dentro da thread, dá +${XP_RESOLVER_THREAD} XP a quem te ajudou` },
        { name: '👍 Resposta útil',value: `Reaja com ✅ em qualquer mensagem no canal de dúvidas para dar +${XP_REACAO_UTIL} XP` },
      )
      .setFooter({ text: 'PantanoCode • Resolve quests pra ganhar XP!' })
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
            '➜ O bot vai criar uma **thread** só pra sua dúvida. Descreva o problema lá dentro com mais detalhes, cole seu código, erros, etc.',
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
    if (!thread.isThread || !thread.isThread()) {
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

  const dados = getDadosCargos();
  if (!dados.mensagemId || reaction.message.id !== dados.mensagemId) return;

  const entrada = CARGOS.find(c => c.emoji === reaction.emoji.name);
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
  if (msg.author.bot) return; // ignora mensagens do próprio bot

  if (adicionar) {
    const { ok, motivo } = registrarReacaoUtil(msg.id, user.id, msg.author.id);
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
    // Não remove XP ao tirar reação (evita abuso reverso)
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

import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { executarCodigo, linguagemValida, listarLinguagens } from './piston.js';
import { adicionarXP, adicionarMoedas, adicionarTitulo, getRanking, getUsuario, getNivel, getProximoNivel, registrarQuestResolvida, jaResolveuHoje } from './xp.js';
import { getPet } from './pets.js';
import { podeBatalhar, calcularBatalhaYorax } from './petInteracao.js';
import { getQuestAtiva, validarResposta, registrarResolvedor, tempoRestante, sortearQuestDoDia } from './quests.js';
import { iniciarScheduler, postarQuestDoDia } from './scheduler.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const DONO_ID = '540661055861293057';
const PREFIX = '!run';
const CANAL = process.env.CANAL_COMANDOS || 'comandos';
const CANAL_QUEST = process.env.CANAL_QUEST || process.env.CANAL_COMANDOS || 'comandos';
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
  if (!canalPermitido(msg.channel)) return;

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
        { name: '🤝 Marcar solução', value: '`!solucao @usuario` — dá +20 XP pra quem te ajudou' },
        { name: '🧹 Limpar canal', value: '`!limpar [qtd]` — só o dono' },
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

  // ─── !solucao ─────────────────────────────────────────────────────────────
  if (msg.content.startsWith('!solucao')) {
    const mencionado = msg.mentions.users.first();

    if (!mencionado) {
      return msg.reply('🐸 Menciona quem te ajudou! Ex: `!solucao @usuario`');
    }
    if (mencionado.id === msg.author.id) {
      return msg.reply('🐸 Você não pode marcar a si mesmo como solução!');
    }
    if (mencionado.bot) {
      return msg.reply('🐸 Bots não ganham XP!');
    }

    const XP_AJUDA = 20;
    const { subiu, nivelDepois } = adicionarXP(mencionado.id, XP_AJUDA, 'ajuda');
    const dadosAtual = getUsuario(mencionado.id);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🤝 Solução marcada!')
      .setDescription(`<@${msg.author.id}> marcou a resposta de <@${mencionado.id}> como solução!`)
      .addFields(
        { name: '💰 XP ganho',  value: `+${XP_AJUDA} XP (ajudou a galera)`, inline: false },
        { name: '⭐ Total',      value: `${dadosAtual.xp} XP`,               inline: true },
        { name: '🐸 Nível',     value: nivelDepois.nome,                     inline: true },
      )
      .setTimestamp();

    await msg.channel.send({ embeds: [embed] });

    if (subiu) {
      setTimeout(() => anunciarNivelUp(msg.channel, mencionado.id, nivelDepois), 1500);
    }
    return;
  }

  // ─── !batalha bot ────────────────────────────────────────────────────────
  if (msg.content.trim() === '!batalha bot') {
    const cooldown = podeBatalhar(msg.author.id);
    if (!cooldown.ok) return msg.reply(`⏳ ${cooldown.motivo}`);

    const dadosUser = getUsuario(msg.author.id);
    const petUser = getPet(dadosUser.petEquipado || 'normal');

    const resultado = calcularBatalhaYorax({ id: msg.author.id }, petUser);

    let recompensaTexto = '';
    if (resultado.atacanteVenceu) {
      adicionarXP(msg.author.id, 100, 'batalha_yorax');
      adicionarMoedas(msg.author.id, 200);
      recompensaTexto = '+100 XP / +200 🪙';
      if (resultado.primeiraVitoria) {
        adicionarTitulo(msg.author.id, 'Quebrador do Vazio');
      }
    }

    const embed = new EmbedBuilder()
      .setColor(resultado.atacanteVenceu ? 0x2ecc40 : 0x1a0030)
      .setTitle(resultado.atacanteVenceu ? '🏆 Você derrotou YØRAX!' : '🌑 YØRAX venceu')
      .setDescription(resultado.mensagem + '\n\n' + resultado.log.join('\n'))
      .addFields(
        { name: `${petUser.emoji} Seu HP`, value: `${resultado.hpA}`, inline: true },
        { name: '🌑 HP de YØRAX', value: `${resultado.hpY}`, inline: true },
      );

    if (recompensaTexto) {
      embed.addFields({ name: '🎁 Recompensa', value: recompensaTexto, inline: false });
    }

    if (resultado.primeiraVitoria) {
      embed.addFields({
        name: '🌌 Título desbloqueado!',
        value: '**"Quebrador do Vazio"** 🌌🐸\nVocê fez o impossível. YØRAX foi forçado a reconhecer sua existência.',
        inline: false,
      });
    }

    embed.setFooter({ text: 'YØRAX, o Arquiteto do Vazio • Cooldown: 5 minutos' }).setTimestamp();
    return msg.channel.send({ embeds: [embed] });
  }

  // ─── !postquest (dono) ────────────────────────────────────────────────────
  if (msg.content.trim() === '!postquest') {
    if (msg.author.id !== DONO_ID) return;
    await postarQuestDoDia(client);
    return msg.reply('🐸 Quest postada manualmente!');
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

client.login(process.env.DISCORD_TOKEN);
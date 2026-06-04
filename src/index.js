import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { executarCodigo, linguagemValida, listarLinguagens } from './piston.js';

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

const LIMITE_CHARS = 1900;

function truncar(texto) {
  if (texto.length <= LIMITE_CHARS) return texto;
  return texto.slice(0, LIMITE_CHARS) + '\n... (saída truncada)';
}

function canalPermitido(canal) {
  return canal.name === CANAL || canal.id === CANAL;
}

client.once('ready', () => {
  console.log(`🐸 PantanoCode online como ${client.user.tag}`);
  console.log(`📡 Escutando canal: #${CANAL}`);
  console.log(`🔑 GLOT_TOKEN: ${process.env.GLOT_TOKEN ? 'carregado' : 'NÃO ENCONTRADO'}`);
  client.user.setActivity('!run <linguagem> | !run help', { type: 'WATCHING' });
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  if (!canalPermitido(msg.channel)) return;

  // !limpar [quantidade]
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
      const deletadas = await msg.channel.bulkDelete(quantidade + 1, true); // +1 inclui o próprio comando
      const aviso = await msg.channel.send(`🐸 ${deletadas.size - 1} mensagens deletadas!`);
      setTimeout(() => aviso.delete().catch(() => {}), 3000);
    } catch (err) {
      msg.reply(`🐸 Erro ao limpar: \`${err.message}\``);
    }
    return;
  }

  if (!msg.content.startsWith(PREFIX)) return;

  const conteudo = msg.content.slice(PREFIX.length).trim();

  // !run help
  if (conteudo === 'help' || conteudo === '') {
    const langs = listarLinguagens().join(', ');
    return msg.reply(
      `🐸 **PantanoCode** — Execute código direto do pântano!\n\n` +
      `**Como usar:**\n` +
      `\`\`\`\n!run <linguagem>\n<seu código aqui>\n\`\`\`\n` +
      `**Exemplo:**\n` +
      `\`\`\`\n!run python\nprint("Croac!")\n\`\`\`\n` +
      `**Linguagens suportadas:**\n${langs}`
    );
  }

  // Extrai linguagem e código
  const linhas = conteudo.split('\n');
  const lang = linhas[0].trim().toLowerCase();
  const codigo = linhas.slice(1).join('\n').trim();

  if (!linguagemValida(lang)) {
    return msg.reply(
      `🐸 Croac? Linguagem \`${lang}\` não reconhecida.\n` +
      `Use \`!run help\` para ver as linguagens suportadas.`
    );
  }

  if (!codigo) {
    return msg.reply(`🐸 Cadê o código? Manda o código depois da linguagem!`);
  }

  const aviso = await msg.reply('🐸 Mergulhando no pântano... aguarda!');

  try {
    const resultado = await executarCodigo(lang, codigo);

    if (!resultado) {
      return aviso.edit('🐸 Erro ao conectar com a API de execução. Tenta de novo!');
    }

    const temSaida = resultado.stdout.length > 0;
    const temErro = resultado.stderr.length > 0;
    const sucesso = resultado.codigo === 0;

    let resposta = '';

    if (sucesso && temSaida) {
      resposta = `✅ **Output:**\n\`\`\`\n${truncar(resultado.stdout)}\n\`\`\``;
    } else if (!sucesso && temErro) {
      resposta =
        `❌ **Erro (código ${resultado.codigo}):**\n\`\`\`\n${truncar(resultado.stderr)}\n\`\`\``;
    } else if (temSaida && temErro) {
      resposta =
        `⚠️ **Output:**\n\`\`\`\n${truncar(resultado.stdout)}\n\`\`\`` +
        `\n**Stderr:**\n\`\`\`\n${truncar(resultado.stderr)}\n\`\`\``;
    } else {
      resposta = `✅ Código executado sem saída (código ${resultado.codigo}).`;
    }

    await aviso.edit(resposta);
  } catch (err) {
    console.error('Erro ao executar código:', err?.message || err);
    await aviso.edit(`🐸 O pântano explodiu! Erro: \`${err?.message || err}\``);
  }
});

client.login(process.env.DISCORD_TOKEN);

import { EmbedBuilder } from 'discord.js';
import { sortearQuestDoDia } from './quests.js';

// Verifica a cada minuto se está na hora de postar a quest (08:00)
export function iniciarScheduler(client) {
  let ultimaQuestData = null;

  setInterval(async () => {
    const agora = new Date();
    const hojeStr = agora.toDateString();

    if (agora.getHours() === 8 && agora.getMinutes() === 0 && ultimaQuestData !== hojeStr) {
      ultimaQuestData = hojeStr;
      await postarQuestDoDia(client);
    }
  }, 60000);
}

export async function postarQuestDoDia(client) {
  const canalId = process.env.CANAL_QUEST || process.env.CANAL_COMANDOS;
  if (!canalId) return;

  const canal = await client.channels.fetch(canalId).catch(() => null);
  if (!canal) return;

  const quest = sortearQuestDoDia();

  const embed = new EmbedBuilder()
    .setColor(0x2ecc40)
    .setTitle(`☐ Quest do dia — Nível ${quest.nivel}`)
    .setDescription(quest.descricao)
    .addFields(
      {
        name: '🐛 Código bugado — encontre e corrija o erro!',
        value: `\`\`\`${quest.linguagem}\n${quest.codigoBugado}\n\`\`\``,
      },
      {
        name: '✅ Output esperado',
        value: `\`\`\`\n${quest.outputEsperado}\n\`\`\``,
      },
      {
        name: '📋 Como resolver',
        value: `Use \`!run ${quest.linguagem}\` com seu código corrigido neste canal.\nO bot valida automaticamente!`,
      },
    )
    .addFields(
      { name: '🏅 XP base',       value: `+${quest.xpBase} XP`,      inline: true },
      { name: '⚡ Bônus (1º)',     value: `+${Math.floor(quest.xpBase * 0.4)} XP`, inline: true },
      { name: '🔥 Streak diário', value: 'Bônus acumulativo',          inline: true },
    )
    .setFooter({ text: 'Quest expira às 08:00 de amanhã • PantanoCode' })
    .setTimestamp();

  await canal.send({ embeds: [embed] });
}

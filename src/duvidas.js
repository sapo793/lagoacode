import { readFileSync, writeFileSync, existsSync } from 'fs';

const ARQUIVO = './data/duvidas.json';

// XP concedido
export const XP_REACAO_UTIL   = 15;  // ✅ em mensagem no canal de dúvidas
export const XP_RESOLVER_THREAD = 40; // !resolver dentro de uma thread

function carregar() {
  if (!existsSync(ARQUIVO)) return { reacoes: {}, threads: {} };
  try { return JSON.parse(readFileSync(ARQUIVO, 'utf8')); } catch { return { reacoes: {}, threads: {} }; }
}

function salvar(dados) {
  writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}

// ── Opção A: reação ✅ ────────────────────────────────────────────────────

/**
 * Registra que userId deu ✅ na mensagem msgId do autor autorId.
 * Retorna { ok, motivo } — ok=true significa que XP deve ser concedido.
 */
export function registrarReacaoUtil(msgId, votanteId, autorId) {
  if (votanteId === autorId) return { ok: false, motivo: 'auto' };

  const db = carregar();
  if (!db.reacoes[msgId]) db.reacoes[msgId] = [];

  if (db.reacoes[msgId].includes(votanteId)) return { ok: false, motivo: 'duplicado' };

  db.reacoes[msgId].push(votanteId);
  salvar(db);
  return { ok: true };
}

/**
 * Remove o voto (reação removida). Retorna true se havia voto registrado.
 */
export function removerReacaoUtil(msgId, votanteId) {
  const db = carregar();
  if (!db.reacoes[msgId]) return false;
  const antes = db.reacoes[msgId].length;
  db.reacoes[msgId] = db.reacoes[msgId].filter(id => id !== votanteId);
  salvar(db);
  return db.reacoes[msgId].length < antes;
}

// ── Opção B: threads de dúvida ────────────────────────────────────────────

/**
 * Registra uma thread aberta pelo bot.
 */
export function abrirThread(threadId, autorId, titulo) {
  const db = carregar();
  db.threads[threadId] = { autorId, titulo, aberta: true, criadaEm: Date.now() };
  salvar(db);
}

/**
 * Resolve uma thread — marca como fechada e registra o resolvedor.
 * Retorna { ok, motivo, thread }
 */
export function resolverThread(threadId, solicitanteId, resolvedorId) {
  const db = carregar();
  const thread = db.threads[threadId];

  if (!thread) return { ok: false, motivo: 'Thread não encontrada.' };
  if (!thread.aberta) return { ok: false, motivo: 'Essa dúvida já foi marcada como resolvida.' };
  if (thread.autorId !== solicitanteId) return { ok: false, motivo: 'Só quem abriu a dúvida pode marcá-la como resolvida.' };
  if (solicitanteId === resolvedorId) return { ok: false, motivo: 'Você não pode marcar a si mesmo como resolvedor.' };

  thread.aberta = false;
  thread.resolvedorId = resolvedorId;
  thread.resolvidaEm = Date.now();
  salvar(db);
  return { ok: true, thread };
}

export function getThread(threadId) {
  return carregar().threads[threadId] || null;
}

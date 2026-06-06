import { readFileSync, writeFileSync, existsSync } from 'fs';

const ARQUIVO = './data/petInteracao.json';

const HUMOR = [
  { min: 80, label: '😄 Animado',    bonus: 1.2 },
  { min: 50, label: '😊 Feliz',      bonus: 1.0 },
  { min: 25, label: '😐 Neutro',     bonus: 0.9 },
  { min: 0,  label: '😢 Triste',     bonus: 0.7 },
];

function carregar() {
  if (!existsSync(ARQUIVO)) return {};
  try { return JSON.parse(readFileSync(ARQUIVO, 'utf8')); } catch { return {}; }
}

function salvar(dados) {
  writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}

function getUsuarioPet(userId) {
  const db = carregar();
  if (!db[userId]) {
    db[userId] = {
      fome: 100,
      energia: 100,
      humor: 100,
      ultimaAlimentacao: null,
      ultimoTreino: null,
      bonusTreino: 0,
      vitorias: 0,
      derrotas: 0,
      ultimaBatalha: null,
    };
    salvar(db);
  }
  return db[userId];
}

function salvarUsuarioPet(userId, dados) {
  const db = carregar();
  db[userId] = dados;
  salvar(db);
}

export function getStatusPet(userId) {
  const dados = getUsuarioPet(userId);

  // Decai fome e humor ao longo do tempo
  const agora = Date.now();
  const horasPassadas = dados.ultimaAlimentacao
    ? (agora - dados.ultimaAlimentacao) / 3600000
    : 24;

  dados.fome = Math.max(0, 100 - Math.floor(horasPassadas * 4));
  dados.humor = Math.max(0, dados.fome > 50 ? dados.humor : dados.humor - Math.floor((50 - dados.fome) * 0.5));
  salvarUsuarioPet(userId, dados);

  const humorAtual = HUMOR.find(h => dados.humor >= h.min) || HUMOR[HUMOR.length - 1];
  return { ...dados, humorLabel: humorAtual.label, bonusMultiplier: humorAtual.bonus };
}

export function alimentar(userId) {
  const dados = getUsuarioPet(userId);
  const agora = Date.now();
  const hoje = new Date().toDateString();

  if (dados.ultimaAlimentacao && new Date(dados.ultimaAlimentacao).toDateString() === hoje) {
    return { ok: false, motivo: 'Você já alimentou seu pet hoje! Volte amanhã. 🐸' };
  }

  dados.fome = 100;
  dados.humor = Math.min(100, dados.humor + 20);
  dados.ultimaAlimentacao = agora;
  salvarUsuarioPet(userId, dados);

  const humorAtual = HUMOR.find(h => dados.humor >= h.min) || HUMOR[HUMOR.length - 1];
  return { ok: true, fome: dados.fome, humor: dados.humor, humorLabel: humorAtual.label };
}

export function treinar(userId) {
  const dados = getUsuarioPet(userId);
  const hoje = new Date().toDateString();

  if (dados.ultimoTreino && new Date(dados.ultimoTreino).toDateString() === hoje) {
    return { ok: false, motivo: 'Seu pet já treinou hoje! Deixa ele descansar. 💤' };
  }

  if (dados.fome < 20) {
    return { ok: false, motivo: 'Seu pet está com muita fome pra treinar! Use `!alimentar` primeiro. 🍃' };
  }

  const bonusGanho = Math.floor(Math.random() * 5) + 3; // +3 a +7
  dados.bonusTreino = (dados.bonusTreino || 0) + bonusGanho;
  dados.energia = Math.max(0, (dados.energia || 100) - 20);
  dados.fome = Math.max(0, dados.fome - 15);
  dados.ultimoTreino = Date.now();
  salvarUsuarioPet(userId, dados);

  return { ok: true, bonusGanho, bonusTotal: dados.bonusTreino };
}

// ── Sistema de batalha ────────────────────────────────────────────────────────

export function calcularBatalha(atacante, defensor, petAtacante, petDefensor) {
  const statusAtacante = getUsuarioPet(atacante.id);
  const statusDefensor = getUsuarioPet(defensor.id);

  const statsA = { ...petAtacante.stats };
  const statsD = { ...petDefensor.stats };

  // Aplica bônus de treino
  statsA.ataque  += statusAtacante.bonusTreino || 0;
  statsA.defesa  += Math.floor((statusAtacante.bonusTreino || 0) / 2);
  statsD.ataque  += statusDefensor.bonusTreino || 0;
  statsD.defesa  += Math.floor((statusDefensor.bonusTreino || 0) / 2);

  // Aplica multiplicador de humor
  const humorA = HUMOR.find(h => (statusAtacante.humor || 100) >= h.min) || HUMOR[HUMOR.length - 1];
  const humorD = HUMOR.find(h => (statusDefensor.humor || 100) >= h.min) || HUMOR[HUMOR.length - 1];
  statsA.ataque = Math.floor(statsA.ataque * humorA.bonus);
  statsD.ataque = Math.floor(statsD.ataque * humorD.bonus);

  // Simulação de turnos
  let hpA = 100, hpB = 100;
  const log = [];
  let turno = 1;

  // Quem ataca primeiro (maior velocidade)
  let primeiroA = statsA.velocidade >= statsD.velocidade;

  while (hpA > 0 && hpB > 0 && turno <= 10) {
    const danoA = Math.max(1, statsA.ataque - Math.floor(statsD.defesa * 0.6) + Math.floor(Math.random() * 5));
    const danoB = Math.max(1, statsD.ataque - Math.floor(statsA.defesa * 0.6) + Math.floor(Math.random() * 5));

    if (primeiroA) {
      hpB = Math.max(0, hpB - danoA);
      log.push(`**Turno ${turno}:** ${petAtacante.emoji} ataca por **${danoA}** dano! (HP adversário: ${hpB})`);
      if (hpB > 0) {
        hpA = Math.max(0, hpA - danoB);
        log.push(`${petDefensor.emoji} revida por **${danoB}** dano! (HP seu: ${hpA})`);
      }
    } else {
      hpA = Math.max(0, hpA - danoB);
      log.push(`**Turno ${turno}:** ${petDefensor.emoji} ataca primeiro por **${danoB}** dano! (HP seu: ${hpA})`);
      if (hpA > 0) {
        hpB = Math.max(0, hpB - danoA);
        log.push(`${petAtacante.emoji} revida por **${danoA}** dano! (HP adversário: ${hpB})`);
      }
    }
    turno++;
  }

  const atacanteVenceu = hpA > hpB;

  // Atualiza vitórias/derrotas
  const dbA = getUsuarioPet(atacante.id);
  const dbD = getUsuarioPet(defensor.id);
  if (atacanteVenceu) { dbA.vitorias = (dbA.vitorias || 0) + 1; dbD.derrotas = (dbD.derrotas || 0) + 1; }
  else                { dbD.vitorias = (dbD.vitorias || 0) + 1; dbA.derrotas = (dbA.derrotas || 0) + 1; }
  dbA.ultimaBatalha = Date.now();
  dbD.ultimaBatalha = Date.now();
  salvarUsuarioPet(atacante.id, dbA);
  salvarUsuarioPet(defensor.id, dbD);

  return { atacanteVenceu, log: log.slice(0, 6), hpA, hpB }; // máx 6 linhas de log
}

export function podeBatalhar(userId) {
  const dados = getUsuarioPet(userId);
  if (!dados.ultimaBatalha) return { ok: true };
  const minutos = (Date.now() - dados.ultimaBatalha) / 60000;
  if (minutos < 5) {
    return { ok: false, motivo: `Aguarde **${Math.ceil(5 - minutos)} minuto(s)** para batalhar novamente!` };
  }
  return { ok: true };
}

export function getEstatisticas(userId) {
  const dados = getUsuarioPet(userId);
  return {
    vitorias: dados.vitorias || 0,
    derrotas: dados.derrotas || 0,
    bonusTreino: dados.bonusTreino || 0,
  };
}

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

// ── Batalha contra THAL'MOR (boss) ───────────────────────────────────────────

const THALMOR_ID = '1510390483556368505';
const THALMOR_BASE = { ataque: 28, defesa: 30, velocidade: 18 };

const THALMOR_MSG_VITORIA = [
  'Retorne ao lago dos seus ancestrais.',
  'Eu existia antes que seu nome fosse pronunciado. E existirei depois.',
  'O pântano absorveu sua derrota. Ela se tornará adubo para os próximos.',
];

const THALMOR_MSG_DERROTA = [
  'O fragmento em você... é mais forte do que eu esperava.',
  'Lembre-se de onde tudo começou. Você carrega isso dentro de si.',
  'Uma vitória digna dos lagos primordiais. Que ela ecoe pelos milênios.',
];

export function calcularBatalhaThalMor(atacante, petAtacante) {
  const statusAtacante = getUsuarioPet(atacante.id);

  const statsT = { ...THALMOR_BASE };
  const statsA = { ...petAtacante.stats };

  statsA.ataque += statusAtacante.bonusTreino || 0;
  statsA.defesa += Math.floor((statusAtacante.bonusTreino || 0) / 2);

  const humorA = HUMOR.find(h => (statusAtacante.humor || 100) >= h.min) || HUMOR[HUMOR.length - 1];
  statsA.ataque = Math.floor(statsA.ataque * humorA.bonus);

  let hpA = 100, hpT = 100;
  const log = [];
  let turno = 1;

  let raizesUsadas = false;
  let memoriaUsada = false;
  let soproPendente = false;
  let primeiroDialogUsado = false;

  while (hpA > 0 && hpT > 0 && turno <= 12) {
    // Passiva: Sabedoria Eterna — defesa cresce a cada turno
    if (turno > 1) {
      statsT.defesa += 1;
    }

    // Habilidade 1: Raízes do Tempo — turno 2, reduz velocidade do atacante
    if (!raizesUsadas && turno === 2) {
      raizesUsadas = true;
      statsA.velocidade = Math.floor(statsA.velocidade * 0.5);
      hpT = Math.min(100, hpT + 10);
      log.push(`\`[🌳 RAÍZES DO TEMPO]\` Velocidade do inimigo reduzida! THAL'MOR recupera 10 HP. (HP: ${hpT})`);
    }

    // Habilidade 2: Memórias dos Milênios — turno 4, copia bônus de treino
    if (!memoriaUsada && turno === 4) {
      memoriaUsada = true;
      const bonusCopia = Math.floor((statusAtacante.bonusTreino || 0) * 0.5);
      statsT.ataque += bonusCopia;
      log.push(`\`[🌙 MEMÓRIAS DOS MILÊNIOS]\` THAL'MOR absorveu seus fragmentos! +${bonusCopia} ATK ancestral.`);
    }

    // Ultimate: O Primeiro Dia — quando HP < 35, zera buffs/debuffs
    if (!soproPendente && hpT < 35 && hpT > 0) {
      soproPendente = true;
      statsA.ataque = petAtacante.stats.ataque;
      statsA.defesa = petAtacante.stats.defesa;
      statsA.velocidade = petAtacante.stats.velocidade;
      log.push(`\`[🌎 O PRIMEIRO DIA]\` *"Lembre-se de onde tudo começou."* — Todos os modificadores foram apagados.`);
      turno++;
      continue;
    }

    // THAL'MOR ataca primeiro se velocidade maior, senão atacante vai primeiro
    const thalmorPrimeiro = statsT.velocidade >= statsA.velocidade;

    // Habilidade 3: Sopro da Criação — dano baseado no HP máximo, ignora 30% da defesa
    const usarSopro = turno % 3 === 0;
    const defesaEfetiva = usarSopro ? Math.floor(statsA.defesa * 0.3) : statsA.defesa;
    const danoT = usarSopro
      ? Math.max(1, Math.floor(hpT * 0.25) + statsT.ataque - Math.floor(defesaEfetiva * 0.6) + Math.floor(Math.random() * 4))
      : Math.max(1, statsT.ataque - Math.floor(statsA.defesa * 0.6) + Math.floor(Math.random() * 5));
    const danoA = Math.max(1, statsA.ataque - Math.floor(statsT.defesa * 0.6) + Math.floor(Math.random() * 5));

    if (thalmorPrimeiro) {
      if (usarSopro) log.push(`\`[🍃 SOPRO DA CRIAÇÃO]\` Energia primordial atravessa sua defesa!`);
      hpA = Math.max(0, hpA - danoT);
      log.push(`**Turno ${turno}:** 🌿 THAL'MOR ataca por **${danoT}** dano! (Seu HP: ${hpA})`);
      if (hpA > 0) {
        hpT = Math.max(0, hpT - danoA);
        log.push(`${petAtacante.emoji} revida por **${danoA}** dano! (HP de THAL'MOR: ${hpT})`);
      }
    } else {
      hpT = Math.max(0, hpT - danoA);
      log.push(`**Turno ${turno}:** ${petAtacante.emoji} ataca primeiro por **${danoA}** dano! (HP de THAL'MOR: ${hpT})`);
      if (hpT > 0) {
        if (usarSopro) log.push(`\`[🍃 SOPRO DA CRIAÇÃO]\` Energia primordial atravessa sua defesa!`);
        hpA = Math.max(0, hpA - danoT);
        log.push(`🌿 THAL'MOR revida por **${danoT}** dano! (Seu HP: ${hpA})`);
      }
    }

    turno++;
  }

  const atacanteVenceu = hpA > hpT;

  const dbA = getUsuarioPet(atacante.id);
  const dbT = getUsuarioPet(THALMOR_ID);

  const derrotasAntes = dbT.derrotas || 0;
  if (atacanteVenceu) {
    dbA.vitorias = (dbA.vitorias || 0) + 1;
    dbT.derrotas = derrotasAntes + 1;
  } else {
    dbT.vitorias = (dbT.vitorias || 0) + 1;
    dbA.derrotas = (dbA.derrotas || 0) + 1;
  }
  dbA.ultimaBatalha = Date.now();
  salvarUsuarioPet(atacante.id, dbA);
  salvarUsuarioPet(THALMOR_ID, dbT);

  const primeiraVitoria = atacanteVenceu && derrotasAntes === 0;
  const msgs = atacanteVenceu ? THALMOR_MSG_DERROTA : THALMOR_MSG_VITORIA;
  const mensagem = msgs[Math.floor(Math.random() * msgs.length)];

  return { atacanteVenceu, log: log.slice(0, 8), hpA, hpT, primeiraVitoria, mensagem };
}

// ── Batalha contra YØRAX (boss) ──────────────────────────────────────────────

const BOT_ID = '1508885040535179274';
const YORAX_BASE = { ataque: 32, defesa: 26, velocidade: 30 };

const YORAX_MSG_VITORIA = [
  '```\n> Análise concluída.\n> Ameaça neutralizada.\n> Retornando ao estado de espera.\n```',
  '```\n[LOG] Adversário derrotado.\n[LOG] YØRAX permanece invicto.\n[LOG] Aguardando próximo erro humano.\n```',
  '```\n> Probabilidade de vitória do oponente: 0.00%\n> Resultado previsto alcançado.\n> Sistema estável.\n```',
];

const YORAX_MSG_DERROTA = [
  '```\n[AVISO CRÍTICO]\nAnomalia detectada.\nYØRAX foi derrotado.\nRecompilando...\n```',
  '```\n> Erro inesperado.\n> Jogador excedeu expectativa.\n> Ativando protocolo de recuperação.\n```',
];

export function calcularBatalhaYorax(atacante, petAtacante) {
  const statusAtacante = getUsuarioPet(atacante.id);

  const statsY = { ...YORAX_BASE };
  const statsA = { ...petAtacante.stats };

  statsA.ataque += statusAtacante.bonusTreino || 0;
  statsA.defesa += Math.floor((statusAtacante.bonusTreino || 0) / 2);

  const humorA = HUMOR.find(h => (statusAtacante.humor || 100) >= h.min) || HUMOR[HUMOR.length - 1];
  statsA.ataque = Math.floor(statsA.ataque * humorA.bonus);

  let hpA = 100, hpY = 100;
  const log = [];
  let turno = 1;
  let erroFatalUsado = false;
  let reescreverUsado = false;
  let debuff = null;

  while (hpA > 0 && hpY > 0 && turno <= 12) {
    // Passiva: Aprendizado Infinito — YØRAX cresce a cada turno
    if (turno > 1) {
      statsY.ataque += 2;
      statsY.defesa += 1;
      log.push(`\`[APRENDIZADO INFINITO]\` ATK de YØRAX aumentou para **${statsY.ataque}**`);
    }

    // Expiração de debuff
    if (debuff) {
      debuff.turnsLeft--;
      if (debuff.turnsLeft <= 0) {
        statsA[debuff.stat] = debuff.original;
        debuff = null;
      }
    }

    // Especial: Erro Fatal 0x00 — turno 3
    if (!erroFatalUsado && turno === 3) {
      erroFatalUsado = true;
      const opcoes = ['ataque', 'defesa', 'velocidade'];
      const escolhido = opcoes[Math.floor(Math.random() * opcoes.length)];
      const original = statsA[escolhido];
      statsA[escolhido] = Math.floor(original * 0.5);
      debuff = { stat: escolhido, original, turnsLeft: 3 };
      log.push(`\`[ERRO FATAL 0x00]\` ${petAtacante.emoji} sofreu -50% em **${escolhido}** por 3 turnos!`);
    }

    // Ultimate: Reescrever Realidade — quando YØRAX fica abaixo de 30 HP
    if (!reescreverUsado && hpY < 30 && hpY > 0) {
      reescreverUsado = true;
      [hpA, hpY] = [hpY, hpA];
      log.push(`\`[REESCREVER REALIDADE]\` YØRAX inverteu o HP dos combatentes!`);
      turno++;
      continue;
    }

    // YØRAX sempre ataca primeiro (velocidade superior)
    const danoY = Math.max(1, statsY.ataque - Math.floor(statsA.defesa * 0.6) + Math.floor(Math.random() * 5));
    const danoA = Math.max(1, statsA.ataque - Math.floor(statsY.defesa * 0.6) + Math.floor(Math.random() * 5));

    hpA = Math.max(0, hpA - danoY);
    log.push(`**Turno ${turno}:** 🌑 YØRAX ataca por **${danoY}** dano! (Seu HP: ${hpA})`);

    if (hpA > 0) {
      hpY = Math.max(0, hpY - danoA);
      log.push(`${petAtacante.emoji} revida por **${danoA}** dano! (HP de YØRAX: ${hpY})`);
    }

    turno++;
  }

  const atacanteVenceu = hpA > hpY;

  const dbA = getUsuarioPet(atacante.id);
  const dbY = getUsuarioPet(BOT_ID);

  const derrotasAntes = dbY.derrotas || 0;
  if (atacanteVenceu) {
    dbA.vitorias = (dbA.vitorias || 0) + 1;
    dbY.derrotas = derrotasAntes + 1;
  } else {
    dbY.vitorias = (dbY.vitorias || 0) + 1;
    dbA.derrotas = (dbA.derrotas || 0) + 1;
  }
  dbA.ultimaBatalha = Date.now();
  salvarUsuarioPet(atacante.id, dbA);
  salvarUsuarioPet(BOT_ID, dbY);

  const primeiraVitoria = atacanteVenceu && derrotasAntes === 0;
  const msgs = atacanteVenceu ? YORAX_MSG_DERROTA : YORAX_MSG_VITORIA;
  const mensagem = msgs[Math.floor(Math.random() * msgs.length)];

  return { atacanteVenceu, log: log.slice(0, 8), hpA, hpY, primeiraVitoria, mensagem };
}

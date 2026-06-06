import { readFileSync, writeFileSync, existsSync } from 'fs';

const DB_PATH = './data/xp.json';

const NIVEIS = [
  { nome: 'Ovo',        emoji: '🥚', minXP: 0    },
  { nome: 'Girino Dev', emoji: '🐛', minXP: 100  },
  { nome: 'Sapo Prog.', emoji: '🐸', minXP: 500  },
  { nome: 'Sapo Eng.',  emoji: '⚙️', minXP: 1500 },
  { nome: 'Sapo Lend.', emoji: '👑', minXP: 5000 },
];

function carregarDB() {
  if (!existsSync(DB_PATH)) return {};
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function salvarDB(db) {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

export function getNivel(xp) {
  for (let i = NIVEIS.length - 1; i >= 0; i--) {
    if (xp >= NIVEIS[i].minXP) return NIVEIS[i];
  }
  return NIVEIS[0];
}

export function getProximoNivel(xp) {
  for (const nivel of NIVEIS) {
    if (xp < nivel.minXP) return nivel;
  }
  return null;
}

export function getUsuario(userId) {
  const db = carregarDB();
  if (!db[userId]) {
    db[userId] = { xp: 0, streak: 0, ultimaQuest: null, resolvedBugs: 0, helped: 0 };
    salvarDB(db);
  }
  return db[userId];
}

export function adicionarXP(userId, quantidade, motivo = '') {
  const db = carregarDB();
  if (!db[userId]) {
    db[userId] = { xp: 0, streak: 0, ultimaQuest: null, resolvedBugs: 0, helped: 0 };
  }

  const nivelAntes = getNivel(db[userId].xp);
  db[userId].xp += quantidade;
  const nivelDepois = getNivel(db[userId].xp);

  salvarDB(db);

  const subiu = nivelAntes.nome !== nivelDepois.nome;
  return { xpTotal: db[userId].xp, nivelAntes, nivelDepois, subiu };
}

export function registrarQuestResolvida(userId) {
  const db = carregarDB();
  if (!db[userId]) {
    db[userId] = { xp: 0, streak: 0, ultimaQuest: null, resolvedBugs: 0, helped: 0 };
  }

  const hoje = new Date().toDateString();
  const ontem = new Date(Date.now() - 86400000).toDateString();

  if (db[userId].ultimaQuest === hoje) return false; // já resolveu hoje

  if (db[userId].ultimaQuest === ontem) {
    db[userId].streak += 1;
  } else if (db[userId].ultimaQuest !== hoje) {
    db[userId].streak = 1;
  }

  db[userId].ultimaQuest = hoje;
  db[userId].resolvedBugs += 1;
  salvarDB(db);
  return true;
}

export function jaResolveuHoje(userId) {
  const db = carregarDB();
  if (!db[userId]) return false;
  return db[userId].ultimaQuest === new Date().toDateString();
}

export function getRanking(top = 10) {
  const db = carregarDB();
  return Object.entries(db)
    .map(([id, dados]) => ({ id, ...dados }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, top);
}

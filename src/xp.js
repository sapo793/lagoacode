import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = './data/xp.json';

function garantirPastaDB() {
  const pasta = dirname(DB_PATH);
  if (!existsSync(pasta)) {
    mkdirSync(pasta, { recursive: true });
  }
}

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
  garantirPastaDB();
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
    db[userId] = { xp: 0, moedas: 0, streak: 0, ultimaQuest: null, resolvedBugs: 0, helped: 0, pets: ['normal'], petEquipado: 'normal' };
    salvarDB(db);
  }
  // migração: garante campos novos em usuários antigos
  if (db[userId].moedas === undefined) db[userId].moedas = 0;
  if (!db[userId].pets) db[userId].pets = ['normal'];
  if (!db[userId].petEquipado) db[userId].petEquipado = 'normal';
  salvarDB(db);
  return db[userId];
}

export function adicionarMoedas(userId, quantidade) {
  const db = carregarDB();
  if (!db[userId]) getUsuario(userId);
  db[userId].moedas = (db[userId].moedas || 0) + quantidade;
  salvarDB(db);
  return db[userId].moedas;
}

export function gastarMoedas(userId, quantidade) {
  const db = carregarDB();
  if (!db[userId]) getUsuario(userId);
  if ((db[userId].moedas || 0) < quantidade) return { ok: false, motivo: 'Moedas insuficientes!' };
  db[userId].moedas -= quantidade;
  salvarDB(db);
  return { ok: true, moedas: db[userId].moedas };
}

export function comprarPet(userId, petId) {
  const db = carregarDB();
  if (!db[userId]) getUsuario(userId);
  if (!db[userId].pets) db[userId].pets = ['normal'];
  if (db[userId].pets.includes(petId)) return { ok: false, motivo: 'Você já possui esse pet!' };
  db[userId].pets.push(petId);
  salvarDB(db);
  return { ok: true };
}

export function equiparPet(userId, petId) {
  const db = carregarDB();
  if (!db[userId]) getUsuario(userId);
  if (!db[userId].pets?.includes(petId)) return { ok: false, motivo: 'Você não possui esse pet! Compre na `!loja`.' };
  db[userId].petEquipado = petId;
  salvarDB(db);
  return { ok: true };
}

export function adicionarXP(userId, quantidade, motivo = '') {
  const db = carregarDB();
  if (!db[userId]) getUsuario(userId);

  const nivelAntes = getNivel(db[userId].xp);
  db[userId].xp += quantidade;
  // moedas = metade do XP ganho
  db[userId].moedas = (db[userId].moedas || 0) + Math.floor(quantidade / 2);
  const nivelDepois = getNivel(db[userId].xp);

  // desbloqueia pet lendário automaticamente ao atingir nível máximo
  if (nivelDepois.nome === 'Sapo Lend.' && !db[userId].pets?.includes('lendario')) {
    if (!db[userId].pets) db[userId].pets = ['normal'];
    db[userId].pets.push('lendario');
  }

  salvarDB(db);

  const subiu = nivelAntes.nome !== nivelDepois.nome;
  return { xpTotal: db[userId].xp, nivelAntes, nivelDepois, subiu, moedas: db[userId].moedas };
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

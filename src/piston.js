import fetch from 'node-fetch';

const PISTON_API = 'https://emkc.org/api/v2/piston';

const LINGUAGENS = {
  python: { language: 'python', version: '3.10.0' },
  py: { language: 'python', version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  js: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  ts: { language: 'typescript', version: '5.0.3' },
  java: { language: 'java', version: '15.0.2' },
  cpp: { language: 'c++', version: '10.2.0' },
  'c++': { language: 'c++', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.50.0' },
  ruby: { language: 'ruby', version: '3.0.1' },
  rb: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' },
  lua: { language: 'lua', version: '5.4.4' },
  bash: { language: 'bash', version: '5.2.0' },
  sh: { language: 'bash', version: '5.2.0' },
};

export function linguagemValida(lang) {
  return LINGUAGENS[lang.toLowerCase()] ?? null;
}

export function listarLinguagens() {
  const unicas = [...new Set(Object.values(LINGUAGENS).map(l => l.language))];
  return unicas.sort();
}

export async function executarCodigo(lang, codigo) {
  const config = linguagemValida(lang);
  if (!config) return null;

  const body = {
    language: config.language,
    version: config.version,
    files: [{ content: codigo }],
  };

  const res = await fetch(`${PISTON_API}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Piston API retornou ${res.status}`);

  const data = await res.json();
  const run = data.run;

  return {
    stdout: run.stdout || '',
    stderr: run.stderr || '',
    codigo: run.code,
  };
}

const GLOT_API = 'https://glot.io/api/run';
const GLOT_TOKEN = process.env.GLOT_TOKEN;

const LINGUAGENS = {
  python: { slug: 'python', arquivo: 'main.py' },
  py: { slug: 'python', arquivo: 'main.py' },
  javascript: { slug: 'javascript', arquivo: 'main.js' },
  js: { slug: 'javascript', arquivo: 'main.js' },
  typescript: { slug: 'typescript', arquivo: 'main.ts' },
  ts: { slug: 'typescript', arquivo: 'main.ts' },
  java: { slug: 'java', arquivo: 'Main.java' },
  cpp: { slug: 'cpp', arquivo: 'main.cpp' },
  'c++': { slug: 'cpp', arquivo: 'main.cpp' },
  c: { slug: 'c', arquivo: 'main.c' },
  go: { slug: 'go', arquivo: 'main.go' },
  rust: { slug: 'rust', arquivo: 'main.rs' },
  ruby: { slug: 'ruby', arquivo: 'main.rb' },
  rb: { slug: 'ruby', arquivo: 'main.rb' },
  php: { slug: 'php', arquivo: 'main.php' },
  lua: { slug: 'lua', arquivo: 'main.lua' },
  bash: { slug: 'bash', arquivo: 'main.sh' },
  sh: { slug: 'bash', arquivo: 'main.sh' },
};

export function linguagemValida(lang) {
  return LINGUAGENS[lang.toLowerCase()] ?? null;
}

export function listarLinguagens() {
  const unicas = [...new Set(Object.values(LINGUAGENS).map(l => l.slug))];
  return unicas.sort();
}

export async function executarCodigo(lang, codigo) {
  const config = linguagemValida(lang);
  if (!config) return null;

  const res = await fetch(`${GLOT_API}/${config.slug}/latest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${GLOT_TOKEN}`,
    },
    body: JSON.stringify({
      files: [{ name: config.arquivo, content: codigo }],
    }),
  });

  if (!res.ok) throw new Error(`Glot API retornou ${res.status}`);

  const data = await res.json();

  return {
    stdout: data.stdout || '',
    stderr: data.stderr || data.error || '',
    codigo: data.stderr || data.error ? 1 : 0,
  };
}

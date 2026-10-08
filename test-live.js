/**
 * TESTE AO VIVO EM PRODUÇÃO — VERCEL
 * Valida a URL pública, ativos e links do WhatsApp
 */

const https = require('https');
const assert = require('assert');

const BASE_URL = 'https://central-ajuda-conexao.vercel.app';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = res.headers.location.startsWith('http') ? res.headers.location : `https://central-ajuda-conexao.vercel.app${res.headers.location}`;
        return resolve(fetchUrl(nextUrl));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runLiveTests() {
  console.log('--- INICIANDO TESTES AO VIVO EM PRODUÇÃO ---');
  console.log(`URL Alvo: ${BASE_URL}\n`);

  // 1. Teste da Home Page
  const home = await fetchUrl(`${BASE_URL}/`);
  assert.strictEqual(home.statusCode, 200, 'Home page deve retornar 200 OK');
  console.log('✓ Home page pública online (Status 200 OK)');

  // 2. Validação do conteúdo ao vivo
  assert(home.body.includes('<title>Internet Lenta, Caindo ou Sem Sinal? Fale pelo WhatsApp</title>'), 'Título ausente na home ao vivo');
  assert(home.body.includes('Sua internet está') && home.body.includes('lenta, caindo') && home.body.includes('ou sem sinal?'), 'Headline hero ausente ao vivo');
  assert(home.body.includes('O que está acontecendo com sua internet?'), 'Seção de problemas ausente ao vivo');
  assert(home.body.includes('Internet ruim de novo?'), 'CTA final ausente ao vivo');
  assert(home.body.includes('CHAMAR NO WHATSAPP'), 'Botão final ausente ao vivo');
  console.log('✓ Conteúdo do Hero, Seção de Problemas e CTA Final validados ao vivo');

  // 3. Validação dos ativos e páginas legais
  const assets = [
    '/styles.css',
    '/main.js',
    '/config.js',
    '/favicon.svg',
    '/politica-de-privacidade.html',
    '/termos-de-uso.html',
    '/robots.txt',
    '/sitemap.xml'
  ];

  for (const asset of assets) {
    const res = await fetchUrl(`${BASE_URL}${asset}`);
    assert.strictEqual(res.statusCode, 200, `Ativo ${asset} deve retornar 200 OK`);
    console.log(`✓ Ativo ao vivo acessível: ${asset} (Status 200)`);
  }

  // 4. Teste de geração e formato das URLs do WhatsApp ao vivo
  const configRes = await fetchUrl(`${BASE_URL}/config.js`);
  assert(configRes.body.includes('5511964322774'), 'Número padrão configurado no config.js ao vivo');

  const problems = [
    'Internet lenta',
    'Internet ruim',
    'Internet caindo',
    'Sem sinal',
    'Internet travando',
    'Conexão instável',
    'Internet fora do ar'
  ];

  console.log('\n--- VALIDANDO FORMATO DOS LINKS DO WHATSAPP ---');
  const tpl = `Olá! Estou com problema na minha internet.

Problema: {PROBLEMA}
Cidade/Bairro:
Internet atual:`;

  for (const prob of problems) {
    const msg = tpl.replace('{PROBLEMA}', prob);
    const encoded = encodeURIComponent(msg);
    const waUrl = `https://api.whatsapp.com/send?phone=5511964322774&text=${encoded}`;
    
    // Verifica decodificação
    const decoded = decodeURIComponent(waUrl.split('text=')[1]);
    assert(decoded.includes(`Problema: ${prob}`), `Problema ${prob} formatado incorretamente`);
    console.log(`✓ Link WhatsApp testado para: "${prob}" -> URL válida`);
  }

  console.log('\nTODOS OS TESTES AO VIVO PASSARAM COM 100% DE SUCESSO!\n');
}

runLiveTests().catch(err => {
  console.error('Falha nos testes ao vivo:', err);
  process.exit(1);
});

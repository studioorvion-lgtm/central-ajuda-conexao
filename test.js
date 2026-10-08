/**
 * TESTES AUTOMATIZADOS DE QUALIDADE E CONFORMIDADE
 * Validação rigorosa dos requisitos de Google Ads, SEO, Mobile e WhatsApp
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- INICIANDO TESTES DE CONFORMIDADE ---');

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const stylesCss = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const mainJs = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf8');
const configJs = fs.readFileSync(path.join(__dirname, 'config.js'), 'utf8');
const config = require('./config.js');

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// 1. Validação de SEO e Metadados
test('Título exato e descritivo configurado', () => {
  assert(indexHtml.includes('<title>Internet Lenta, Caindo ou Sem Sinal? Fale pelo WhatsApp</title>'), 'Título não confere');
});

test('Meta Description exata presente', () => {
  assert(indexHtml.includes('content="Está com internet lenta, caindo, travando ou sem sinal? Fale agora pelo WhatsApp e informe o problema da sua conexão."'), 'Meta description incorreta');
});

// 2. Validação de Relevância e Palavras-Chave
const requiredKeywords = [
  'internet lenta',
  'internet ruim',
  'internet caindo',
  'internet sem sinal',
  'internet fora do ar',
  'internet travando',
  'conexão instável',
  'problema com internet',
  'internet lenta Nio',
  'Nio sem sinal',
  'Nio fora do ar',
  'Nio internet caindo'
];

requiredKeywords.forEach(kw => {
  test(`Palavra-chave presente naturalmente: "${kw}"`, () => {
    const regex = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    assert(regex.test(indexHtml), `Palavra-chave "${kw}" ausente no HTML`);
  });
});

// 3. Validação de Regras Negativas (Sem infringir políticas ou marca)
test('NÃO afirma ser suporte oficial Nio', () => {
  assert(!indexHtml.toLowerCase().includes('suporte oficial nio'), 'Encontrada menção indevida a suporte oficial Nio');
  assert(!indexHtml.toLowerCase().includes('oficial da nio'), 'Encontrada menção indevida a oficial da Nio');
});

test('NÃO possui formulários invasivos', () => {
  assert(!indexHtml.includes('<form'), 'Página contém tag de formulário quando deveria ir direto pro WhatsApp');
});

test('NÃO possui loja ou planos', () => {
  assert(!indexHtml.includes('carrinho'), 'Página contém menção a carrinho de loja');
  assert(!indexHtml.includes('comprar plano'), 'Página contém menção a compra de plano');
});

// 4. Validação dos 7 Problemas Clicáveis
const requiredProblems = [
  'Internet lenta',
  'Internet ruim',
  'Internet caindo',
  'Sem sinal',
  'Internet travando',
  'Conexão instável',
  'Internet fora do ar'
];

requiredProblems.forEach(p => {
  test(`Problema clicável configurado: "${p}"`, () => {
    assert(indexHtml.includes(`data-wa-problem="${p}"`), `Elemento com data-wa-problem="${p}" não encontrado`);
  });
});

// 5. Validação de Seções Obrigatórias
test('Hero contém Headline, Subheadline e CTA principal exatos', () => {
  assert(indexHtml.includes('Sua internet está') && indexHtml.includes('lenta, caindo') && indexHtml.includes('ou sem sinal?'), 'Headline do Hero incorreta');
  assert(indexHtml.includes('Fale agora pelo WhatsApp e informe o problema da sua conexão.'), 'Subheadline incorreta');
  assert(indexHtml.includes('FALAR AGORA PELO WHATSAPP'), 'CTA Principal incorreto');
  assert(indexHtml.includes('Atendimento rápido pelo WhatsApp.'), 'Texto de apoio incorreto');
});

test('Seção de Problemas possui o título exato', () => {
  assert(indexHtml.includes('O que está acontecendo com sua internet?'), 'Título da seção de problemas incorreto');
});

test('Seção de Relevância Nio contextualizada', () => {
  assert(indexHtml.includes('Está pesquisando por internet lenta Nio, Nio sem sinal, internet Nio caindo ou problemas de conexão?'), 'Headline contextual Nio ausente');
});

test('Seção Como Funciona possui 3 passos claros e diretos', () => {
  assert(indexHtml.includes('Escolha o problema'), 'Passo 1 ausente');
  assert(indexHtml.includes('Fale pelo WhatsApp'), 'Passo 2 ausente');
  assert(indexHtml.includes('Informe cidade/bairro'), 'Passo 3 ausente');
});

test('CTA Final possui Headline, texto e botão exatos', () => {
  assert(indexHtml.includes('Internet ruim de novo?'), 'Headline final incorreta');
  assert(indexHtml.includes('Explique o problema e fale agora pelo WhatsApp.'), 'Texto final incorreto');
  assert(indexHtml.includes('CHAMAR NO WHATSAPP'), 'Botão final incorreto');
});

// 6. Validação do Template de Mensagem do WhatsApp
test('Template do WhatsApp está centralizado e segue o padrão exato', () => {
  const tpl = config.MESSAGE_TEMPLATE;
  assert(tpl.includes('Olá! Estou com problema na minha internet.'), 'Saudação ausente no template');
  assert(tpl.includes('Problema:'), 'Campo Problema ausente no template');
  assert(tpl.includes('Cidade/Bairro:'), 'Campo Cidade/Bairro ausente no template');
  assert(tpl.includes('Internet atual:'), 'Campo Internet atual ausente no template');

  const testProblem = 'Internet lenta';
  const formatted = tpl.replace('{PROBLEMA}', testProblem);
  assert(formatted.includes('Problema: Internet lenta'), 'Substituição do problema falhou');
});

// 7. Validação de Tracking (UTMs e GCLID)
test('Tracking preserva utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid', () => {
  const requiredParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
  requiredParams.forEach(param => {
    assert(config.TRACKING_PARAMS.includes(param), `Parâmetro de tracking ${param} ausente em config.js`);
  });
  assert(mainJs.includes('sessionStorage.setItem'), 'Persistência no sessionStorage ausente');
  assert(mainJs.includes('localStorage.setItem'), 'Persistência no localStorage ausente');
});

test('Conversão configurada para disparar APENAS no clique', () => {
  assert(mainJs.includes('triggerAdsConversion'), 'Função de trigger no clique ausente');
  assert(!indexHtml.includes('gtag(\'event\', \'conversion\''), 'Conversão disparando indevidamente no load do HTML');
});

// 8. Validação Mobile e Estilos
test('Botão fixo inferior para mobile presente no HTML e CSS', () => {
  assert(indexHtml.includes('class="mobile-sticky-bar"'), 'Barra fixa mobile ausente no HTML');
  assert(stylesCss.includes('.mobile-sticky-bar'), 'Estilo da barra fixa ausente no CSS');
  assert(stylesCss.includes('overflow-x: hidden'), 'Proteção contra overflow horizontal ausente');
});

console.log(`\nResultado dos testes: ${passed} passaram, ${failed} falharam.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('TODOS OS TESTES FORAM APROVADOS COM SUCESSO!\n');
}

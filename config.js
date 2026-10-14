/**
 * CONFIGURAÇÃO CENTRALIZADA DA APLICAÇÃO
 * CENTRAL DE AJUDA & CONECTIVIDADE — SEGUNDA OPERAÇÃO
 */

const APP_CONFIG = {
  // Número oficial de atendimento WhatsApp: +55 51 98536-0106
  DEFAULT_PHONE: '5551985360106',
  DISPLAY_PHONE: '51985360106',

  // Configurações do Google Ads
  GOOGLE_ADS_ID: 'AW-18476149806',
  GOOGLE_ADS_CONVERSION_LABEL: '', // Preencher com o rótulo de conversão quando configurado

  // Lista de parâmetros de tracking monitorados e preservados
  TRACKING_PARAMS: [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'tel'
  ],

  // Mensagem padrão base preservada
  MESSAGE_TEMPLATE: `Olá! Estou com problema na minha internet.

Problema: {PROBLEMA}
Cidade/Bairro:
Internet atual:`
};

// Exporta globalmente para o navegador ou Node
if (typeof window !== 'undefined') {
  window.APP_CONFIG = APP_CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APP_CONFIG;
}

/**
 * CENTRAL DE AJUDA & CONECTIVIDADE — SCRIPT PRINCIPAL
 * Controle de Tracking (UTMs / GCLID), Conversões Google Ads e Redirecionamento WhatsApp
 */

(function () {
  'use strict';

  const config = window.APP_CONFIG || {
    DEFAULT_PHONE: '5511964322774',
    GOOGLE_ADS_ID: 'AW-18476149806',
    GOOGLE_ADS_CONVERSION_LABEL: '',
    TRACKING_PARAMS: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'tel'],
    MESSAGE_TEMPLATE: 'Olá! Estou com problema na minha internet.\n\nProblema: {PROBLEMA}\nCidade/Bairro:\nInternet atual:'
  };

  /**
   * Captura e preserva parâmetros de rastreamento (UTMs e GCLID)
   */
  function initTracking() {
    const urlParams = new URLSearchParams(window.location.search);
    const tracking = {};

    config.TRACKING_PARAMS.forEach(function (param) {
      const val = urlParams.get(param);
      if (val) {
        tracking[param] = val;
        try {
          sessionStorage.setItem('trk_' + param, val);
          localStorage.setItem('trk_' + param, val);
        } catch (e) {
          console.warn('Storage indisponível', e);
        }
      } else {
        try {
          const stored = sessionStorage.getItem('trk_' + param) || localStorage.getItem('trk_' + param);
          if (stored) {
            tracking[param] = stored;
          }
        } catch (e) {}
      }
    });

    return tracking;
  }

  const trackingData = initTracking();
  const currentPhone = trackingData.tel || config.DEFAULT_PHONE;

  /**
   * Constrói a mensagem exata para envio ao WhatsApp
   */
  function buildMessage(problemText) {
    const problemValue = problemText ? problemText.trim() : '';
    // Substitui o placeholder mantendo a estrutura exata exigida
    return config.MESSAGE_TEMPLATE.replace('{PROBLEMA}', problemValue);
  }

  /**
   * Gera a URL final do WhatsApp com a mensagem codificada
   */
  function getWhatsAppUrl(problemText) {
    const message = buildMessage(problemText);
    const encoded = encodeURIComponent(message);
    const cleanPhone = currentPhone.replace(/\D/g, '');
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
  }

  /**
   * Dispara a conversão no Google Ads somente no clique real
   */
  function triggerAdsConversion(callback) {
    let called = false;
    function done() {
      if (!called) {
        called = true;
        if (typeof callback === 'function') {
          callback();
        }
      }
    }

    // Se houver gtag e identificadores configurados
    if (typeof window.gtag === 'function' && config.GOOGLE_ADS_ID && config.GOOGLE_ADS_CONVERSION_LABEL) {
      const sendTo = `${config.GOOGLE_ADS_ID}/${config.GOOGLE_ADS_CONVERSION_LABEL}`;
      try {
        window.gtag('event', 'conversion', {
          send_to: sendTo,
          event_callback: done
        });
        // Fallback de segurança de 300ms caso o callback do Google Ads demore ou falhe
        setTimeout(done, 300);
        return;
      } catch (err) {
        console.error('Erro ao disparar conversão Google Ads:', err);
      }
    }

    // Caso não haja conversion label ou gtag ainda não carregado
    done();
  }

  /**
   * Gerencia a ação de clique do usuário
   */
  function handleWhatsAppClick(problemText, targetBlank) {
    const waUrl = getWhatsAppUrl(problemText);

    triggerAdsConversion(function () {
      if (targetBlank) {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = waUrl;
      }
    });
  }

  /**
   * Inicializa ouvintes de eventos em botões e cards interativos
   */
  function setupButtons() {
    // Atualiza links com data-wa-problem ou data-wa-action
    const triggers = document.querySelectorAll('[data-wa-action]');

    triggers.forEach(function (el) {
      const problem = el.getAttribute('data-wa-problem') || '';
      const url = getWhatsAppUrl(problem);

      // Se for elemento <a>, atualiza href para acessibilidade e SEO
      if (el.tagName.toLowerCase() === 'a') {
        el.setAttribute('href', url);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }

      el.addEventListener('click', function (e) {
        e.preventDefault();
        // Em mobile, abrir direto na mesma janela ou nova aba
        const isMobile = window.innerWidth <= 768;
        handleWhatsAppClick(problem, !isMobile);
      });
    });

    // Diagnóstico visual dos botões no console
    if (window.location.hostname === 'localhost' || window.location.search.includes('debug=1')) {
      console.log('Central de Conectividade: Inicializada com sucesso.');
      console.log('Telefone Ativo:', currentPhone);
      console.log('Parâmetros de Tracking:', trackingData);
    }
  }

  // Executa após carregamento do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupButtons);
  } else {
    setupButtons();
  }

  // Exporta utilitário de teste global
  window.__centralConexao = {
    getWhatsAppUrl: getWhatsAppUrl,
    buildMessage: buildMessage,
    getTracking: function () { return trackingData; },
    getPhone: function () { return currentPhone; }
  };
})();

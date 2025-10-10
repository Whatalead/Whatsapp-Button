(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const defaults = {
      phone: "", message: "Hello!", helpText: "How can we help you?",
      helpPosition: "top", helpDelayMs: 800, helpDurationMs: 0, 
      helpDismissible: true, rememberHelpClose: false, helpCloseTTLHours: 0, 
      badge: "", badgePulse: true, offset: { bottom: 20, side: 20 }
    };
    const userConfig = window.SetlyyWhatsApp || {};
    // La configuration de l'utilisateur est prioritaire
    const config = { ...defaults, ...userConfig, offset: { ...defaults.offset, ...userConfig.offset } };

    if (!config.phone) {
      console.error("Setlyy Widget: WhatsApp phone number is not defined.");
      return;
    }
    
    const STORAGE_KEY = `setlyy_whatsapp_closed_${config.phone}`;

    function createWidgetElements() {
      const widget = document.createElement('a');
      widget.id = 'setlyy-whatsapp-widget';
      widget.classList.add('setlyy-widget');
      widget.target = '_blank';
      widget.rel = 'noopener noreferrer';
      widget.href = `https://wa.me/${config.phone.replace(/\D/g, '')}?text=${encodeURIComponent(config.message)}`;
      widget.setAttribute('aria-label', 'Contact us on WhatsApp');

      let bubble = null;
      
      // NOUVELLE LOGIQUE : Créer la bulle d'aide uniquement si helpText n'est pas vide
      const hasHelpText = config.helpText && config.helpText.trim().length > 0;
      
      if (hasHelpText) {
          bubble = document.createElement('div');
          bubble.classList.add('setlyy-bubble');
          
          const bubbleText = document.createElement('p');
          bubbleText.textContent = config.helpText;
          bubble.appendChild(bubbleText);
          
          if (config.helpDismissible) {
            const dismissBtn = document.createElement('button');
            dismissBtn.classList.add('setlyy-dismiss-btn');
            dismissBtn.setAttribute('aria-label', 'Dismiss');
            dismissBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`;
            bubble.appendChild(dismissBtn);
          }
      }
      
      const button = document.createElement('div');
      button.classList.add('setlyy-button');
      button.innerHTML = `
        <span class="setlyy-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 439.6c-33.8 0-66.3-8.8-94.3-25.7l-6.7-4-69.8 18.3L72 359.2l-4.5-7c-18.9-29.7-28.9-63.3-28.9-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5c.1 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.8-16.4-53.9-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
        </span>`;

      if (config.badge) {
        const badgeContainer = document.createElement('span');
        badgeContainer.classList.add('setlyy-badge-container');
        if (config.badgePulse) {
          const ping = document.createElement('span');
          ping.classList.add('setlyy-badge-ping');
          badgeContainer.appendChild(ping);
        }
        const badge = document.createElement('span');
        badge.classList.add('setlyy-badge-static');
        badge.textContent = config.badge;
        badgeContainer.appendChild(badge);
        button.appendChild(badgeContainer);
      }
      
      // Ajouter la bulle uniquement si elle a été créée
      if (bubble) {
        widget.appendChild(bubble);
      }

      widget.appendChild(button);
      document.body.appendChild(widget);
      
      return { widget, bubble };
    }

    function injectStyles() {
      let bubblePositionCss = '';
      switch (config.helpPosition) {
        case 'left':
          bubblePositionCss = `right: calc(100% + 12px); bottom: 0; transform-origin: center right;`;
          break;
        case 'top': default:
          bubblePositionCss = `bottom: calc(100% + 12px); right: 0; transform-origin: bottom right;`;
          break;
      }

      const css = `
        .setlyy-widget {
          position: fixed; z-index: 9999;
          bottom: var(--setlyy-offset-bottom, 24px); right: var(--setlyy-offset-side, 24px);
          display: flex; justify-content: flex-end; align-items: flex-end;
        }
        .setlyy-button {
          width: clamp(56px, 14vw, 64px); height: clamp(56px, 14vw, 64px);
          background-color: #22c55e; border-radius: 9999px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          transition: transform 0.2s; position: relative; flex-shrink: 0;
        }
        .setlyy-widget:hover .setlyy-button { transform: scale(1.1); }
        .setlyy-icon {
          width: 50%; height: 50%; color: white;
          display: flex; align-items: center; justify-content: center;
          line-height: 0;
        }
        .setlyy-icon svg {
          display: block;
          width: 100%;
          height: 100%;
          fill: currentColor;
        }
        .setlyy-badge-container {
          position: absolute; top: -0.25rem; right: -0.25rem;
          display: flex; height: 1.25rem; width: 1.25rem;
        }
        .setlyy-badge-static {
          position: relative; display: inline-flex; border-radius: 9999px;
          height: 1.25rem; width: 1.25rem; background-color: #ef4444;
          color: white; font-size: 0.75rem; font-weight: bold;
          align-items: center; justify-content: center;
        }
        .setlyy-badge-ping {
          animation: setlyy-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
          position: absolute; display: inline-flex; height: 100%; width: 100%;
          border-radius: 9999px; background-color: #f87171; opacity: 0.75;
        }
        @keyframes setlyy-ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        .setlyy-bubble {
          position: absolute; background-color: white; border-radius: 0.5rem;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          padding: 0.75rem; transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0; transform: translateY(8px) scale(0.95); pointer-events: none;
          ${bubblePositionCss}
          width: 85vw; max-width: 280px;
        }
        .setlyy-bubble.setlyy-bubble--visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
        .setlyy-bubble p {
          margin: 0; color: #1f2937;
          font-size: clamp(0.8125rem, 4vw, 0.90rem);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        .setlyy-dismiss-btn {
          position: absolute; top: -0.5rem; right: -0.5rem;
          background-color: #e2e8f0; border-radius: 9999px;
          padding: 2px; border: none; cursor: pointer; display: flex;
          align-items: center; justify-content: center; color: #64748b;
        }
        .setlyy-dismiss-btn:hover { color: #1e293b; }
        .setlyy-dismiss-btn svg { width: 1rem; height: 1rem; }
      `;
      const styleSheet = document.createElement("style");
      styleSheet.innerText = css;
      document.head.appendChild(styleSheet);
    }
    
    function initializeLogic(widget, bubble) {
      widget.style.setProperty('--setlyy-offset-bottom', `${config.offset.bottom}px`);
      widget.style.setProperty('--setlyy-offset-side', `${config.offset.side}px`);
      
      widget.addEventListener('click', () => {
        const trackClick = async () => {
          try {
            await fetch('https://api.setlyy.com/webhook/Count-Click-Whatsapp-Button', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: config.phone })
            });
          } catch (error) {
            console.error('Setlyy Widget: Could not track click.', error);
          }
        };
        trackClick();
      });

      // Si bubble est null (helpText vide), on ne continue pas la logique d'affichage de la bulle
      if (!bubble) return;
      
      let wasClosedManually = false;
      let lastClosedTimestamp = 0;
      try {
        const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (storedData) {
          wasClosedManually = !!storedData.manual;
          lastClosedTimestamp = storedData.timestamp || 0;
        }
      } catch (e) {}

      const hoursSinceLastClose = (Date.now() - lastClosedTimestamp) / (3600 * 1000);
      const shouldHideBubble = (config.rememberHelpClose && wasClosedManually && (!config.helpCloseTTLHours || hoursSinceLastClose < config.helpCloseTTLHours));

      if (shouldHideBubble) return;

      const showBubble = () => bubble.classList.add('setlyy-bubble--visible');
      const hideBubble = () => bubble.classList.remove('setlyy-bubble--visible');
      const showTimeout = setTimeout(showBubble, config.helpDelayMs);

      if (config.helpDurationMs > 0) {
        setTimeout(() => {
          hideBubble();
          if (config.rememberAutoClose) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ manual: false, timestamp: Date.now() }));
          }
        }, config.helpDelayMs + config.helpDurationMs);
      }
      
      if (config.helpDismissible) {
        const dismissBtn = bubble.querySelector('.setlyy-dismiss-btn');
        dismissBtn.addEventListener('click', (e) => {
          e.preventDefault(); e.stopPropagation();
          clearTimeout(showTimeout);
          hideBubble();
          if (config.rememberHelpClose) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ manual: true, timestamp: Date.now() }));
          }
        });
      }
    }
    
    injectStyles();
    const { widget, bubble } = createWidgetElements();
    initializeLogic(widget, bubble);
  });
})();

(() => {
  "use strict";
  if (window.__slw_loaded) return; window.__slw_loaded = true;

  const C = Object.assign({
    companyId: null,
    phone: null, message: "Bonjour !",
    helpText: "", helpDelayMs: 1200, helpDurationMs: 0,
    helpPosition: "top", helpDismissible: true,
    rememberHelpClose: true, rememberAutoClose: true, helpCloseTTLHours: 24,
    badge: "", badgePulse: false,
    position: "right", offset: { bottom: 20, side: 20 }
  }, window.SetlyyWhatsApp || {});
  if (!C.phone) { console.error("[SetlyyWhatsApp] phone is required"); return; }

  const phone   = String(C.phone).replace(/\D/g, "");
  const msg     = encodeURIComponent(C.message || "");
  const HELP_KEY = `slw_help_closed_${location.hostname}`;

  // ===== CSS =====
  const css = `
#slw-root *{box-sizing:border-box}
#slw-root{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}
#slw-wrap{position:fixed; z-index:2147483647; display:flex; align-items:center;
  gap:clamp(8px,1.2vw,12px); bottom:${C.offset.bottom}px;}
#slw-wrap.${C.position==='left'?'left':'right'}{${C.position==='left'?'left':'right'}:${C.offset.side}px;}

#slw-btn{
  position:relative; display:inline-flex; align-items:center; justify-content:center;
  width:clamp(52px,9vw,68px); height:clamp(52px,9vw,68px);
  border-radius:999px; border:0; cursor:pointer; background:#25D366; color:#fff;
  box-shadow:0 18px 60px rgba(0,0,0,.18); transition:transform .15s ease;
}
#slw-btn:hover{ transform:scale(1.04) }
#slw-btn:focus-visible{ outline:none; box-shadow:0 0 0 3px rgba(37,211,102,.35) }
#slw-ico{ width:clamp(24px,4vw,32px); height:clamp(24px,4vw,32px); fill:#fff }

#slw-badge{
  display:none; position:absolute; top:-6px; right:-6px;
  min-width:clamp(18px,3vw,22px); height:clamp(18px,3vw,22px);
  border-radius:999px; background:#DC3545; color:#fff;
  font:600 clamp(10px,1.8vw,12px)/1 ui-sans-serif,system-ui;
  padding:0 clamp(4px,.9vw,6px);
  display:flex; align-items:center; justify-content:center;
}

/* Animation pulse si activée */
@keyframes slw-pulse { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
#slw-badge.slw-pulse { animation: slw-pulse 1.6s infinite ease-in-out; }

#slw-help{
  display:none; position:relative; background:#fff; color:#2b2f33;
  border:1px solid #E8ECEF; border-radius:14px;
  padding:clamp(10px,2vw,14px) clamp(14px,2.6vw,18px);
  font-size:clamp(13px,1.9vw,15px); line-height:1.45;
  box-shadow:0 20px 60px rgba(0,0,0,.16); max-width:min(86vw,380px);
}
#slw-help .slw-close{
  display:${C.helpDismissible?'flex':'none'};
  position:absolute; top:8px; right:8px; width:24px; height:24px;
  border-radius:999px; border:0; align-items:center; justify-content:center;
  cursor:pointer; background:#E9F2FF; color:#6B7A90; font-weight:600; font-size:14px;
}
#slw-help .slw-close:hover{ filter:brightness(.96) }

/* flèches de la bulle */
#slw-help::after{content:""; position:absolute; width:0; height:0; --s:12px; border:var(--s) solid transparent;}
#slw-wrap.hp-top    #slw-help{ margin-bottom:8px }
#slw-wrap.hp-bottom #slw-help{ margin-top:8px }
#slw-wrap.hp-left   #slw-help{ margin-right:8px }
#slw-wrap.hp-right  #slw-help{ margin-left:8px }
#slw-wrap.hp-top #slw-help::after{left:calc(50% - var(--s)); bottom:-24px; border-top-color:#fff; border-bottom-width:0; filter:drop-shadow(0 -1px 0 #E8ECEF);}
#slw-wrap.hp-bottom #slw-help::after{left:calc(50% - var(--s)); top:-24px; border-bottom-color:#fff; border-top-width:0; filter:drop-shadow(0 1px 0 #E8ECEF);}
#slw-wrap.hp-left #slw-help::after{top:calc(50% - var(--s)); right:-24px; border-left-color:#fff; border-right-width:0; filter:drop-shadow(1px 0 0 #E8ECEF);}
#slw-wrap.hp-right #slw-help::after{top:calc(50% - var(--s)); left:-24px; border-right-color:#fff; border-left-width:0; filter:drop-shadow(-1px 0 0 #E8ECEF);}
`;
  const style = document.createElement("style");
  style.textContent = css; document.head.appendChild(style);

  // ===== DOM =====
  const root = document.createElement("div");
  root.id = "slw-root";

  let dirStyle = "flex-direction:row;";
  if (C.helpPosition==="left")  dirStyle = "flex-direction:row-reverse;";
  if (C.helpPosition==="top")   dirStyle = "flex-direction:column-reverse;";
  if (C.helpPosition==="bottom")dirStyle = "flex-direction:column;";

  root.innerHTML = `
    <div id="slw-wrap"
         class="${C.position==='left'?'left':'right'} hp-${C.helpPosition}"
         role="region" aria-label="WhatsApp widget" style="${dirStyle}">
      <div id="slw-help" aria-live="polite">
        <button class="slw-close" type="button" aria-label="Fermer le message">×</button>
        <span class="slw-text"></span>
      </div>
      <button id="slw-btn" type="button" aria-label="Contacter via WhatsApp">
        <svg id="slw-ico" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M.06 24l1.69-6.16A11.93 11.93 0 1 1 12 23.89c-1.99 0-3.95-.5-5.69-1.45L.06 24zM6.65 20.2c1.68.99 3.28 1.59 5.35 1.59 5.45 0 9.88-4.43 9.89-9.88C21.9 6.43 17.49 2 12.03 2 6.58 2 2.14 6.43 2.14 11.88c0 2.23.65 3.89 1.75 5.63l-1 3.65 3.76-.96zm11.29-5.46c-.07-.12-.27-.2-.57-.34-.3-.15-1.76-.87-2.04-.97-.28-.1-.47-.15-.67.15-.2.29-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51-.17-.01-.37-.01-.57-.01s-.52.07-.79.37c-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41z"/>
        </svg>
        <div id="slw-badge"></div>
      </button>
    </div>
  `;
  document.body.appendChild(root);

  const help  = root.querySelector("#slw-help");
  const helpTextSpan = help.querySelector(".slw-text");
  const close = help.querySelector(".slw-close");
  const btn   = root.querySelector("#slw-btn");
  const badge = root.querySelector("#slw-badge");

  // badge
  if (C.badge) {
    badge.textContent = String(C.badge);
    badge.style.display = "flex";
    if (C.badgePulse) badge.classList.add("slw-pulse");
  }

  // ==== Persistence helpers ====
  const now   = Date.now();
  const ttlMs = Math.max(0, (C.helpCloseTTLHours || 0) * 3600 * 1000);
  const getExpiry = () => { const raw = localStorage.getItem(HELP_KEY); const n = raw ? parseInt(raw, 10) : 0; return Number.isFinite(n)?n:0; };
  const setClosedUntil = () => { if (!ttlMs) return; try { localStorage.setItem(HELP_KEY, String(now + ttlMs)); } catch {} };
  const isSuppressed = () => { const exp=getExpiry(); if(!exp) return false; if(now<exp) return true; try{localStorage.removeItem(HELP_KEY);}catch{} return false; };

  // show/hide help
  const hideHelp = (reason) => {
    help.style.display = "none";
    if ((reason === "manual" && C.rememberHelpClose) ||
        (reason === "auto"   && C.rememberAutoClose)) {
      setClosedUntil();
    }
  };
  const showHelp = () => {
    if (!C.helpText) return;
    helpTextSpan.textContent = C.helpText;
    help.style.display = "block";
    if (C.helpDurationMs > 0) setTimeout(() => hideHelp("auto"), C.helpDurationMs);
  };

  close.addEventListener("click", () => hideHelp("manual"));
  if (!isSuppressed() && C.helpText && C.helpDelayMs > 0) {
    setTimeout(showHelp, C.helpDelayMs);
  }

  // ===== WhatsApp + API call =====
  async function trackClick() {
    if (!C.companyId) return;
    try {
      await fetch("https://api.setlyy.com/webhook/Count-Click-Whatsapp-Button", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: C.companyId })
      });
    } catch (err) {
      console.warn("[SetlyyWhatsApp] tracking failed", err);
    }
  }

  function openWA() {
    trackClick();
    const url = `https://wa.me/${phone}?text=${msg}`;
    const win = window.open("", "_blank");
    if (win) { win.opener = null; win.location = url; } else { location.href = url; }
  }
  btn.addEventListener("click", openWA);
  btn.addEventListener("keydown", e => {
    if (e.key==="Enter"||e.key===" "){e.preventDefault();openWA();}
  });
})();

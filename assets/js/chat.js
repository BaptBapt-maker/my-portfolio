const API_BASE = "https://api.lefildigital.com";
const PHONE_E164 = "447558895686"; // <-- ton numéro WhatsApp, E.164 SANS '+'

function addBubble(text, who="bot"){
  const log = document.getElementById("lfd-chat-log");
  const p = document.createElement("p");
  p.className = `lfd-chat-bubble ${who}`;
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

// --- ENVOI vers WhatsApp via /send_test/
async function sendMessage(){
  const input = document.getElementById("lfd-chat-msg");
  const message = input.value.trim();
  if(!message) return;

  addBubble(message, "you");
  input.value = "";

  try{
    const res = await fetch(`${API_BASE}/send_test/`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ to: PHONE_E164, msg: message })
    });
    const txt = await res.text();
    let data; try { data = JSON.parse(txt); } catch { data = { raw: txt }; }

    if(!res.ok || (data && data.ok === false)){
      addBubble("❌ Envoi échoué (API Meta)", "bot");
      console.warn("send_test error:", data);
    }
    // sinon OK → rien à faire, on affiche déjà la bulle "you"
  }catch(e){
    addBubble("Erreur réseau : " + e.message, "bot");
  }
}

// --- RECEPTION : poll /chat/pull/?phone=...
let pollTimer = null;
async function pollIncoming(){
  try{
    const res = await fetch(`${API_BASE}/chat/pull/?phone=${encodeURIComponent(PHONE_E164)}`);
    if(!res.ok) return;
    const data = await res.json(); // { messages: [{dir:'in'|'out', text, ts}] }
    const msgs = Array.isArray(data.messages) ? data.messages : [];
    for(const m of msgs){
      if(m.dir === "in") addBubble(m.text, "bot");  // on n’affiche que les entrants
      // (les 'out' sont déjà affichés côté front quand on envoie)
    }
  }catch(e){
    // silencieux
  }
}

function startPolling(){
  if(pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(pollIncoming, 2500);
  pollIncoming(); // premier tir immédiat
}

// --- INIT UI
function initChat(){
  console.log("[chat] init");
  const root   = document.getElementById("lfd-chat");
  const toggle = root.querySelector(".lfd-chat-toggle");
  const close  = root.querySelector(".lfd-chat-close");
  const send   = document.getElementById("lfd-chat-send");
  const input  = document.getElementById("lfd-chat-msg");

  toggle.addEventListener("click", () => {
    const open = root.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    if(open){ input.focus(); startPolling(); }
  });
  close.addEventListener("click", () => {
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded","false");
  });

  send.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => { if(e.key === "Enter") sendMessage(); });

  // ping silencieux (debug)
  fetch(`${API_BASE}/chat/ping/`)
    .then(()=>console.log("[chat] ping ok"))
    .catch(err=>console.warn("[chat] ping fail", err));
}

document.addEventListener("DOMContentLoaded", initChat);
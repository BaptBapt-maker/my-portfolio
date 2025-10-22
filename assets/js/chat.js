const API_BASE = "https://api.lefildigital.com";

function addBubble(text, who="bot"){
  const log = document.getElementById("lfd-chat-log");
  const p = document.createElement("p");
  p.className = `lfd-chat-bubble ${who}`;
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

async function sendMessage(){
  const input = document.getElementById("lfd-chat-msg");
  const message = input.value.trim();
  if(!message) return;
  addBubble(message, "you");
  input.value = "";
  try{
    const res = await fetch(`${API_BASE}/chat/`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    addBubble(data.response ?? JSON.stringify(data), "bot");
  }catch(e){
    addBubble("Erreur réseau : " + e.message, "bot");
  }
}

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
    if(open) input.focus();
  });
  close.addEventListener("click", () => {
    root.classList.remove("is-open");
    toggle.setAttribute("aria-expanded","false");
  });
  send.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => { if(e.key === "Enter") sendMessage(); });

  // ping silencieux (debug console utile)
  fetch(`${API_BASE}/chat/ping/`).then(()=>console.log("[chat] ping ok")).catch(err=>console.warn("[chat] ping fail", err));
}

document.addEventListener("DOMContentLoaded", initChat);

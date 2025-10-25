const API_BASE = "https://api.lefildigital.com";

/* ---------- helpers ---------- */
function addBubble(text, who = "bot") {
  const log = document.getElementById("lfd-chat-log");
  if (!log) return;
  const p = document.createElement("p");
  p.className = `lfd-chat-bubble ${who}`;
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

// very small UUID + cookie store for an anonymous visitor id (optional but useful)
function vidGet() {
  const m = document.cookie.match(/(?:^|;\s*)lfd_vid=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
function vidSet(val) {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  document.cookie = `lfd_vid=${encodeURIComponent(val)}; path=/; expires=${d.toUTCString()}`;
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >>> 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/* ---------- send message to backend ---------- */
async function sendMessage() {
  const input = document.getElementById("lfd-chat-msg");
  const btn   = document.getElementById("lfd-chat-send");
  const message = (input?.value || "").trim();
  if (!message) return;

  // ensure visitor id
  let vid = vidGet();
  if (!vid) { vid = uuid(); vidSet(vid); }

  addBubble(message, "you");
  input.value = "";
  btn?.setAttribute("disabled", "true");

  try {
    const res = await fetch(`${API_BASE}/api/chat/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message, visitor_id: vid })
    });

    if (!res.ok) {
      addBubble("❌ Envoi échoué. Réessaie dans un instant.", "bot");
      console.warn("[chat] send failed", res.status, await res.text());
    }
  } catch (e) {
    addBubble("❌ Erreur réseau : " + e.message, "bot");
    console.error("[chat] network error", e);
  } finally {
    btn?.removeAttribute("disabled");
  }
}

/* ---------- UI init ---------- */
function initChat() {
  const root   = document.getElementById("lfd-chat");
  if (!root) return;

  const toggle = root.querySelector(".lfd-chat-toggle");
  const close  = root.querySelector(".lfd-chat-close");
  const send   = document.getElementById("lfd-chat-send");
  const input  = document.getElementById("lfd-chat-msg");

  toggle?.addEventListener("click", () => {
    const open = root.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    if (open) input?.focus();
  });
  close?.addEventListener("click", () => {
    root.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  });

  send?.addEventListener("click", sendMessage);
  input?.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

  // optional ping (ton endpoint existe)
  fetch(`${API_BASE}/chat/ping/`).catch(()=>{});
}

document.addEventListener("DOMContentLoaded", initChat);
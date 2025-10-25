const API_BASE = "https://api.lefildigital.com/api/chat";

/* ---------- UI helpers ---------- */
function addBubble(text, who = "bot") {
  const log = document.getElementById("lfd-chat-log");
  if (!log) return;
  const p = document.createElement("p");
  p.className = `lfd-chat-bubble ${who}`;
  p.textContent = text;
  log.appendChild(p);
  log.scrollTop = log.scrollHeight;
}

/* ---------- session ---------- */
async function getSessionId() {
  let sid = localStorage.getItem("lfd_session_id");
  if (sid) return sid;

  const res = await fetch(`${API_BASE}/open/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}"
  });
  const data = await res.json();
  if (!res.ok || !data.session_id) throw new Error("open failed");
  sid = data.session_id;
  localStorage.setItem("lfd_session_id", sid);
  return sid;
}

/* ---------- poll back messages ---------- */
let pollTimer = null;
let hasNewMessage = false;

async function startPolling() {
  if (pollTimer) return;
  const sid = await getSessionId();

  const tick = async () => {
    try {
      const r = await fetch(`${API_BASE}/pull/?session_id=${encodeURIComponent(sid)}`, { method: "GET" });
      if (!r.ok) return;
      const data = await r.json();
      const messages = data.messages || [];
      if (!messages.length) return;

      messages.forEach(m => {
        if (m.dir === "agent") {
          addBubble(m.text, "bot");
          const root = document.getElementById("lfd-chat");
          const toggle = root?.querySelector(".lfd-chat-toggle");
          const isOpen = root?.classList.contains("is-open");
          if (!isOpen) {
            hasNewMessage = true;
            toggle?.classList.add("lfd-has-new");
          }
        }
      });
    } catch (_) {}
  };

  await tick(); // premier tir
  pollTimer = setInterval(tick, 2000);
}

/* ---------- send message ---------- */
async function sendMessage() {
  const input = document.getElementById("lfd-chat-msg");
  const btn   = document.getElementById("lfd-chat-send");
  const message = (input?.value || "").trim();
  if (!message) return;

  addBubble(message, "you");
  input.value = "";
  btn?.setAttribute("disabled", "true");

  try {
    const session_id = await getSessionId();
    const res = await fetch(`${API_BASE}/send/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id, text: message })
    });
    if (!res.ok) addBubble("❌ Envoi échoué. Réessaie dans un instant.", "bot");
  } catch (e) {
    addBubble("🌐 Erreur réseau. Réessaie plus tard.", "bot");
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

  // ✅ Un SEUL handler pour le toggle
  toggle?.addEventListener("click", async () => {
    const open = root.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      input?.focus();
      // efface la pastille
      hasNewMessage = false;
      toggle?.classList.remove("lfd-has-new");
      try { await startPolling(); } catch {}
    }
  });

  close?.addEventListener("click", () => {
    root.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  });

  send?.addEventListener("click", sendMessage);
  input?.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });

  fetch(`${API_BASE}/ping/`).catch(()=>{});
}

document.addEventListener("DOMContentLoaded", initChat);

/* ---------- Agent status ---------- */
async function updateAgentStatus() {
  try {
    const res = await fetch(`${API_BASE}/agent/status/`);
    if (!res.ok) return;
    const data = await res.json();
    const el = document.getElementById("lfd-agent-status");
    if (!el) return;

    if (data.typing) {
      el.textContent = "✍️ Baptiste écrit...";
    } else if (data.online) {
      el.textContent = "🟢 Baptiste est en ligne";
    } else {
      el.textContent = "⚪ Baptiste est hors ligne";
    }
  } catch (e) {
    console.warn("[chat] agent status error", e);
  }
}

setInterval(updateAgentStatus, 5000);
updateAgentStatus();

const COLORS = {
  A1: "#94a3b8", A2: "#64748b",
  B1: "#22c55e", B2: "#0ea5e9",
  C1: "#f59e0b", C2: "#ef4444"
};

document.querySelectorAll(".langues img[data-level]").forEach(img => {
  const wrap = document.createElement("span");
  wrap.className = "flag";
  img.parentNode.insertBefore(wrap, img);
  wrap.appendChild(img);

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = img.dataset.level.trim();
  badge.style.background = COLORS[img.dataset.level.trim()] || "#475569";
  wrap.appendChild(badge);
});

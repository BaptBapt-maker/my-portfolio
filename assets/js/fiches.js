

async function loadSummaryFrom(url){
  const res = await fetch(url, { cache: "force-cache" });
  if(!res.ok) throw new Error(`Échec chargement ${url}`);
  const html = await res.text();

  const doc = new DOMParser().parseFromString(html, "text/html");
  const summary = doc.querySelector(".summary");
  if (!summary) throw new Error(`.summary introuvable dans ${url}`);

 
  const node = summary.cloneNode(true);

  const slide = document.createElement("article");
  slide.className = "slide";
  slide.appendChild(node);
  return slide;
}


function getCenteredIndex(container){
  const host = container.getBoundingClientRect();
  const center = host.left + host.width / 2;
  let best = { idx: 0, dist: Infinity };
  [...container.children].forEach((slide, idx) => {
    const r = slide.getBoundingClientRect();
    const c = r.left + r.width / 2;
    const d = Math.abs(c - center);
    if (d < best.dist) best = { idx, dist: d };
  });
  return best.idx;
}


function setActive(container, idx){
  const slides = [...container.children];
  slides.forEach((s, i) => {
    s.classList.toggle("is-active", i === idx);
    s.classList.toggle("is-left",   i <  idx);
    s.classList.toggle("is-right",  i >  idx);
  });
  document.querySelectorAll(".dot").forEach((d,i)=>
    d.classList.toggle("is-active", i === idx)
  );
}


function scrollToIndex(container, idx){
  const target = container.children[idx];
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}


(async function init(){
  const container = document.getElementById("summaries");
  const dotsWrap = document.getElementById("dots");
  const sources = window.SUMMARY_SOURCES || [];

 
  if (location.protocol === "file:") {
    container.insertAdjacentHTML(
      "beforebegin",
      '<p style="margin:12px 0;color:#b00;background:#fee;padding:10px 12px;border:1px solid #f99;border-radius:8px;">' +
      '⚠️ Cette page doit être ouverte via un serveur local (http://…), sinon le chargement des fiches est bloqué par le navigateur.' +
      "</p>"
    );
    return;
  }


  for (const url of sources){
  const slide = await loadSummaryFrom(url);
  container.appendChild(slide);
  document.dispatchEvent(new CustomEvent("summary:added", { detail: { slide, url } }));
}

 
  dotsWrap.innerHTML = sources.map(()=>'<span class="dot"></span>').join('');

  
  setActive(container, 0);

  let ticking = false;
  container.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      setActive(container, getCenteredIndex(container));
      ticking = false;
    });
  }, { passive: true });


  const prev = document.querySelector(".nav-btn.prev");
  const next = document.querySelector(".nav-btn.next");
  prev.addEventListener("click", () =>
    scrollToIndex(container, Math.max(0, getCenteredIndex(container) - 1))
  );
  next.addEventListener("click", () =>
    scrollToIndex(container, Math.min(container.children.length - 1, getCenteredIndex(container) + 1))
  );

 
  dotsWrap.addEventListener("click", (e) => {
    const dot = e.target.closest(".dot"); if (!dot) return;
    const idx = [...dotsWrap.querySelectorAll(".dot")].indexOf(dot);
    scrollToIndex(container, idx);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prev.click();
    if (e.key === "ArrowRight") next.click();
  });

 
  window.addEventListener("resize", () =>
    setActive(container, getCenteredIndex(container))
  );

  document.dispatchEvent(new Event("summaries:ready"));
})();



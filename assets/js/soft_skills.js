
(() => {
  const root = document.getElementById('soft-proof');
  if (!root) return;

  root.querySelectorAll('li').forEach(li => {
    const label = li.dataset.label || 'Soft skill';
    const cases = Math.max(0, Math.min(5, parseInt(li.dataset.cases || '0', 10)));
    const tip = li.dataset.tip || '';


    li.classList.add('item');
    if (tip) li.setAttribute('data-tip', tip);

    li.innerHTML = `
                                    <span class="label">${label}</span>
                                    <div class="dots">${'<span class="dot"></span>'.repeat(5)}</div>`;


    li.querySelectorAll('.dot').forEach((d, i) => {
      if (i < cases) d.classList.add('filled');
    });
  });
})();

(() => {
  const SCALE = 2.2;


  const pins = [...document.querySelectorAll('svg circle[data-key]')];
  pins.forEach(p => p.dataset.baseR = p.getAttribute('r') || 5);


  const list = document.querySelector('.soft-proof');
  if (!list || !pins.length) return;


  const toKeys = s =>
    (s)
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);


  list.addEventListener('pointerenter', (e) => {
    const item = e.target.closest('li');
    if (!item || !list.contains(item)) return;


    const keys = toKeys(item.dataset.pins || item.dataset.pin);

    pins.forEach(p => {
      const base = +p.dataset.baseR;
      const key = (p.dataset.key);
      const hit = keys.includes(key);
      p.setAttribute('r', hit ? base * SCALE : base);

    });
  }, true);

  list.addEventListener('pointerleave', (e) => {
    const item = e.target.closest('li');
    if (!item || !list.contains(item)) return;

    pins.forEach(p => {
      p.setAttribute('r', p.dataset.baseR);
      p.classList.remove('highlight');
    });
  }, true);
})();
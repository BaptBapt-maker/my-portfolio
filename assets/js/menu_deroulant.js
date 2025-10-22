
(function () {
  const sheet = document.querySelector('.summary');
  if (!sheet) return;

  const handle = sheet.querySelector('.summary__handle');
  const content = sheet.querySelector('.summary__content');
  const mq = window.matchMedia('(max-width:1027px)');
  const HANDLE = 56;

  let closedY = 0, startY = 0, startPos = 0, dragging = false;
  let bound = false;

  function computeClosedY() { closedY = sheet.clientHeight - HANDLE; }
  function setOpen(open) {
    sheet.classList.toggle('open', open);
    handle?.setAttribute('aria-expanded', open);
    document.body.classList.toggle('modal-open', open && mq.matches);
    sheet.style.transform = open || !mq.matches ? 'translateY(0)' : `translateY(${closedY}px)`;
  }


  function bindMobile() {
    if (bound || !handle) return;
    bound = true;
    computeClosedY(); setOpen(false);
    addEventListener('resize', () => { computeClosedY(); if (!sheet.classList.contains('open')) setOpen(false); });

    handle.addEventListener('click', () => setOpen(!sheet.classList.contains('open')));

    sheet.addEventListener('touchstart', (e) => {
      if (e.target !== handle && content?.scrollTop > 0) return;
      dragging = true;
      startY = e.touches[0].clientY;
      startPos = sheet.classList.contains('open') ? 0 : closedY;
      sheet.style.transition = 'none';
    }, { passive: true });

    sheet.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      const dy = e.touches[0].clientY - startY;
      let y = Math.min(closedY, Math.max(0, startPos + dy));
      sheet.style.transform = `translateY(${y}px)`;
      //e.preventDefault();
    }, { passive: false });

    sheet.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false; sheet.style.transition = '';
      const m = new DOMMatrixReadOnly(getComputedStyle(sheet).transform);
      const y = m.m42 || 0;
      setOpen(y < closedY / 2);
    });
  }

  function unbindMobile() {
    bound = false;
    document.body.classList.remove('modal-open');
    sheet.classList.remove('open');
    sheet.style.transition = '';
    setOpen(true);
  }


  if (mq.matches) bindMobile(); else unbindMobile();
  mq.addEventListener('change', e => e.matches ? bindMobile() : unbindMobile());
})();

window.addEventListener('load', () => {
  if (!matchMedia('(max-width:900px)').matches) return;

  const scroller = document.querySelector('.map-wrap');
  const svg = scroller?.querySelector('svg');
  if (!scroller || !svg) return;


  const target =

    svg.querySelector('.Angola');

  if (!target) return;


  const tRect = target.getBoundingClientRect();
  const sRect = scroller.getBoundingClientRect();


  const centerX = (tRect.left + tRect.right) / 2 - sRect.left + scroller.scrollLeft;


  const left = Math.max(0, centerX - scroller.clientWidth / 2);

  scroller.scrollTo({ left, behavior: 'instant' });
});
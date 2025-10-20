(function () {

  function setupCarousel(root) {
    if (!root || root.__igReady) return;   
    root.__igReady = true;

    const track   = root.querySelector('.ig-carousel__track');
    const slides  = Array.from(root.querySelectorAll('.ig-carousel__slide'));
    const prevBtn = root.querySelector('.ig-carousel__prev');
    const nextBtn = root.querySelector('.ig-carousel__next');
    const dotsWrap= root.querySelector('.ig-carousel__dots');
    const autoplay= root.getAttribute('data-autoplay') === 'true';

    if (!track || !slides.length) return;

    let index = 0;
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let deltaPx = 0;
    let autoTimer = null;

    // dots
    if (dotsWrap){
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'ig-carousel__dot';
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Aller à l’image ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      });
    }

    function trackTranslate() {
      const base = -index * root.clientWidth;
      return base + deltaPx;
    }

    function update() {
      track.style.transition = isDragging ? 'none' : 'transform .35s ease';
      track.style.transform  = `translateX(${trackTranslate()}px)`;

      if (dotsWrap){
        dotsWrap.querySelectorAll('.ig-carousel__dot')
          .forEach((d, i) => d.classList.toggle('is-active', i === index));
      }

      if (prevBtn) prevBtn.style.opacity = (index === 0) ? .4 : 1;
      if (nextBtn) nextBtn.style.opacity = (index === slides.length - 1) ? .4 : 1;
    }

    function goTo(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      deltaPx = 0;
      update();
      restartAutoplay();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    // drag/touch
    function onPointerDown(e) {
      isDragging = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      currentX = startX;
      deltaPx = 0;
      update();
    }
    function onPointerMove(e) {
      if (!isDragging) return;
      currentX = (e.touches ? e.touches[0].clientX : e.clientX);
      deltaPx = currentX - startX;
      update();
    }
    function onPointerUp() {
      if (!isDragging) return;
      isDragging = false;
      const threshold = root.clientWidth * 0.15;
      if (deltaPx < -threshold) next();
      else if (deltaPx > threshold) prev();
      else goTo(index);
    }

    // autoplay
    function restartAutoplay(){
      if (!autoplay) return;
      clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        if (index >= slides.length - 1) { goTo(0); }
        else { goTo(index + 1); }
      }, 4000);
    }

    // listeners
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    root.addEventListener('mousedown',  onPointerDown);
    root.addEventListener('mousemove',  onPointerMove);
    window.addEventListener('mouseup',  onPointerUp);
    root.addEventListener('touchstart', onPointerDown, { passive: true });
    root.addEventListener('touchmove',  onPointerMove, { passive: true });
    root.addEventListener('touchend',   onPointerUp);

    root.tabIndex = 0;
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft')  prev();
    });

    window.addEventListener('resize', () => update());

    goTo(0);
    restartAutoplay();
  }

  (function bootStandalone(){
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.ig-carousel').forEach(setupCarousel);
      });
    } else {
      document.querySelectorAll('.ig-carousel').forEach(setupCarousel);
    }
  })();

  document.addEventListener('summary:added', (e) => {
    const slide = e.detail && e.detail.slide;
    if (!slide) return;
    slide.querySelectorAll('.ig-carousel').forEach(setupCarousel);
  });

  document.addEventListener('summaries:ready', () => {
    document.querySelectorAll('.ig-carousel').forEach(setupCarousel);
  });

})();
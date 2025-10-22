

document.addEventListener('DOMContentLoaded', () => {
  const mq = window.matchMedia('(max-width: 570px)');
  document.querySelectorAll('.js-toggle').forEach(a => {
    if (location.hash) a.setAttribute('href', location.hash);
  });
  const LABEL_RESULTT = 'Recherche associée : Baptiste Lecaudey Etudes';
  const LABEL_STUDY = 'Recherche associée : Baptiste Lecaudey Experiences';

  function setState(state) {

    document.body.classList.toggle('show-resultT', state === 'resultT');
    document.body.classList.toggle('show-study', state === 'study');
    updateLabels();
  }

  function updateLabels() {
    const showingStudy = document.body.classList.contains('show-study');
    document.querySelectorAll('.js-toggle').forEach(a => {
      a.textContent = showingStudy ? LABEL_STUDY : LABEL_RESULTT;
    });
  }

  function sync() {
    if (mq.matches) {

      setState('resultT');
    } else {

      document.body.classList.remove('show-resultT', 'show-study');
      updateLabels();
    }
  }


  sync();
  mq.addEventListener('change', sync);


  document.addEventListener('click', (e) => {
    const a = e.target.closest('.js-toggle');
    if (!a) return;

    e.preventDefault();
    e.stopPropagation();

    if (!mq.matches) return;

    const next = document.body.classList.contains('show-study') ? 'resultT' : 'study';
    setState(next);
  });
});
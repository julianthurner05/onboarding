/* ================================================================
   TUTORIAL – Schrittsteuerung, Timeline, Kalender-Hover
   ================================================================ */
(() => {
  const steps    = [...document.querySelectorAll('.step')];
  const tlSteps  = [...document.querySelectorAll('.tl-step')];
  const fill     = document.getElementById('timeline-fill');
  const btnBack  = document.getElementById('btn-back');
  const btnNext  = document.getElementById('btn-next');
  const nextLbl  = document.getElementById('btn-next-label');
  const last     = steps.length - 1;

  let current = 0;

  function render() {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === current));

    tlSteps.forEach((t, i) => {
      t.classList.toggle('is-done', i < current);
      t.classList.toggle('is-current', i === current);
    });

    fill.style.setProperty('--progress', last ? current / last : 0);

    btnBack.classList.toggle('is-hidden', current === 0);
    btnNext.classList.toggle('is-hidden', current === last);
    nextLbl.textContent = current === last - 1 ? 'Fertig' : 'Weiter';
  }

  function go(i) {
    const next = Math.max(0, Math.min(last, i));
    if (next === current) return;
    current = next;
    render();
  }

  btnBack.addEventListener('click', () => go(current - 1));
  btnNext.addEventListener('click', () => go(current + 1));
  tlSteps.forEach(t => t.addEventListener('click', () => go(+t.dataset.goto)));

  const restart = document.getElementById('restart');
  if (restart) restart.addEventListener('click', () => go(0));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft')  go(current - 1);
  });

  /* Kalender: belegte Slots klappen beim Überfahren auf (wie im Portal) */
  document.querySelectorAll('.cal-slot--spot').forEach(slot => {
    slot.addEventListener('mouseenter', () => slot.classList.add('is-lit'));
    slot.addEventListener('mouseleave', () => slot.classList.remove('is-lit'));
  });

  render();
})();

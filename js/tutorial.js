/* ================================================================
   TUTORIAL – Schrittsteuerung, Kapitel-Timeline, Kalender-Hover
   ================================================================ */
(() => {
  const steps    = [...document.querySelectorAll('.step')];
  const dots     = [...document.querySelectorAll('.tl-dot')];
  const groups   = [...document.querySelectorAll('.tl-group')];
  const timeline = document.getElementById('timeline');
  const fill     = document.getElementById('timeline-fill');
  const btnBack  = document.getElementById('btn-back');
  const btnNext  = document.getElementById('btn-next');
  const nextLbl  = document.getElementById('btn-next-label');
  const last     = steps.length - 1;      /* 0 = Titelblatt, 1–18 = Schritte */

  let current = 0;

  function paintFill() {
    if (current === 0) { fill.style.width = '0px'; return; }
    const dot = dots[current - 1];
    fill.style.width = `${dot.offsetLeft + dot.offsetWidth / 2 - 14}px`;
  }

  function render() {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === current));
    document.body.classList.toggle('is-cover', current === 0);

    dots.forEach((d, i) => {
      d.classList.toggle('is-done', i < current - 1);
      d.classList.toggle('is-current', i === current - 1);
    });

    groups.forEach(g => {
      const gDots = [...g.querySelectorAll('.tl-dot')];
      g.classList.toggle('is-current', gDots.some(d => d.classList.contains('is-current')));
      g.classList.toggle('is-done', gDots.every(d => d.classList.contains('is-done')));
    });

    paintFill();

    btnBack.classList.toggle('is-hidden', current === 0);
    btnNext.classList.toggle('is-hidden', current === last);
    nextLbl.textContent = current === 0 ? "Los geht's" : 'Weiter';
  }

  function go(i) {
    const next = Math.max(0, Math.min(last, i));
    if (next === current) return;
    current = next;
    render();
  }

  btnBack.addEventListener('click', () => go(current - 1));
  btnNext.addEventListener('click', () => go(current + 1));
  dots.forEach(d => d.addEventListener('click', () => go(+d.dataset.goto)));

  const restart = document.getElementById('restart');
  if (restart) restart.addEventListener('click', () => go(0));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(current + 1);
    if (e.key === 'ArrowLeft') go(current - 1);
  });

  window.addEventListener('resize', paintFill);

  /* Kalender: belegte Slots klappen beim Überfahren auf (wie im Portal) */
  document.querySelectorAll('.cal-slot--spot:not([data-static])').forEach(slot => {
    slot.addEventListener('mouseenter', () => slot.classList.add('is-lit'));
    slot.addEventListener('mouseleave', () => slot.classList.remove('is-lit'));
  });

  render();
})();

/* ================================================================
   TUTORIAL – Schrittsteuerung mit Sub-Steps (Spotlight),
   Bereichs-Timeline, Kalender-Hover
   ================================================================ */
(() => {
  const sections = [...document.querySelectorAll('.step')];
  const dots     = [...document.querySelectorAll('.tl-dot')];
  const groups   = [...document.querySelectorAll('.tl-group')];
  const fill     = document.getElementById('timeline-fill');
  const btnBack  = document.getElementById('btn-back');
  const btnNext  = document.getElementById('btn-next');
  const last     = sections.length - 1;

  /* Sub-Steps: Bullets mit data-part im linken Text */
  const bulletsOf = s => [...s.querySelectorAll('.tut__list li[data-part]')];
  const dotBySection = sections.map(s => s.dataset.dot ? dots.find(d => d.dataset.dot === s.dataset.dot) : null);
  const sectionByDot = {};
  sections.forEach((s, i) => { if (s.dataset.dot) sectionByDot[s.dataset.dot] = i; });

  let current = 0;
  let sub = 0;

  /* Der Punkt, der zum aktuellen Abschnitt gehört: Schritte haben ihren
     eigenen, Kapitelseiten zeigen schon den ERSTEN Punkt ihres Bereichs,
     der Abschluss den letzten. */
  function displayDot() {
    if (dotBySection[current]) return dotBySection[current];
    if (sections[current].classList.contains('step--chapter')) {
      for (let i = current + 1; i < sections.length; i++) {
        if (dotBySection[i]) return dotBySection[i];
      }
    }
    for (let i = current; i >= 0; i--) {
      if (dotBySection[i]) return dotBySection[i];
    }
    return null;
  }

  /* Fortschrittslinie bis zur Mitte dieses Punkts.
     Am Handy füllt sie die Gruppenlinie (--mfill), am Desktop die
     durchgehende Leiste. */
  function paintFill() {
    const dot = displayDot();
    document.querySelectorAll('.tl-group__dots').forEach(g => g.style.setProperty('--mfill', '0px'));
    if (!dot || dot.offsetParent === null) { fill.style.width = '0px'; return; }
    fill.style.width = `${dot.offsetLeft + dot.offsetWidth / 2 - fill.offsetLeft}px`;
    const row = dot.closest('.tl-group__dots');
    if (row) row.style.setProperty('--mfill', `${dot.offsetLeft + dot.offsetWidth / 2 - 4}px`);
  }

  function render() {
    const sec = sections[current];
    sections.forEach((s, i) => s.classList.toggle('is-active', i === current));
    document.body.classList.toggle('is-cover', current === 0);

    /* Sub-Step: aktiver Bullet + zugehörige Teil-Elemente */
    const bullets = bulletsOf(sec);
    const exhibit = sec.querySelector('.exhibit');
    sec.classList.toggle('has-focus', bullets.length > 0);
    if (bullets.length) {
      bullets.forEach((b, i) => b.classList.toggle('is-active', i === sub));
      const active = bullets[sub].dataset.part.split(/\s+/);
      if (exhibit) {
        exhibit.classList.add('has-focus');
        exhibit.querySelectorAll('[data-part]').forEach(el => {
          el.classList.toggle('is-hot', el.dataset.part.split(/\s+/).some(p => active.includes(p)));
        });
      }
    } else if (exhibit) {
      exhibit.classList.remove('has-focus');
    }

    /* Timeline */
    const disp = current === 0 || sections[current].classList.contains('step--outro') ? null : displayDot();
    dots.forEach(d => {
      d.classList.toggle('is-done', sectionByDot[d.dataset.dot] < current);
      d.classList.toggle('is-current', d === disp);
    });

    groups.forEach(g => {
      const gDots = [...g.querySelectorAll('.tl-dot')];
      g.classList.toggle('is-current', g.dataset.group === sec.dataset.group || gDots.includes(disp));
      g.classList.toggle('is-done', gDots.every(d => sectionByDot[d.dataset.dot] < current) && !gDots.includes(disp));
    });

    requestAnimationFrame(paintFill);

    btnBack.classList.toggle('is-hidden', current === 0);
    btnNext.classList.toggle('is-hidden', current === last);
  }

  function goTo(i, s = 0) {
    current = Math.max(0, Math.min(last, i));
    sub = s;
    render();
  }

  function next() {
    const bullets = bulletsOf(sections[current]);
    if (bullets.length && sub < bullets.length - 1) { sub += 1; render(); return; }
    if (current < last) goTo(current + 1);
  }

  function back() {
    if (sub > 0) { sub -= 1; render(); return; }
    if (current > 0) {
      const prev = current - 1;
      const bullets = bulletsOf(sections[prev]);
      goTo(prev, Math.max(0, bullets.length - 1));
    }
  }

  btnBack.addEventListener('click', back);
  btnNext.addEventListener('click', next);
  dots.forEach(d => d.addEventListener('click', () => goTo(sectionByDot[d.dataset.dot])));

  const start = document.getElementById('btn-start');
  if (start) start.addEventListener('click', () => goTo(1));

  /* Neu starten führt zum ersten Schritt, nicht zur Titelseite */
  const restart = document.getElementById('restart');
  if (restart) restart.addEventListener('click', () => goTo(1));

  /* Bullet anklicken springt direkt zum Sub-Step */
  sections.forEach((s, i) => {
    bulletsOf(s).forEach((b, bi) => b.addEventListener('click', () => goTo(i, bi)));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') back();
  });

  window.addEventListener('resize', paintFill);

  /* Kalender: belegte Slots klappen beim Überfahren auf (wie im Portal) */
  document.querySelectorAll('.cal-slot--spot').forEach(slot => {
    slot.addEventListener('mouseenter', () => slot.classList.add('is-lit'));
    slot.addEventListener('mouseleave', () => slot.classList.remove('is-lit'));
  });

  /* Show titles: der Schalter funktioniert wie im Portal */
  document.querySelectorAll('.exhibit--cal .switch').forEach(sw => {
    sw.addEventListener('click', () => {
      const on = sw.classList.toggle('is-on');
      sw.setAttribute('aria-checked', on);
      sw.closest('.calendar-view').querySelector('.cal-grid').classList.toggle('show-titles', on);
    });
  });

  render();
})();

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
    /* nie negativ – ein ungültiger Wert würde still verworfen und die
       Linie bliebe auf ihrer alten Breite stehen */
    fill.style.width = `${Math.max(0, dot.offsetLeft + dot.offsetWidth / 2 - fill.offsetLeft)}px`;
    const row = dot.closest('.tl-group__dots');
    if (row) row.style.setProperty('--mfill', `${Math.max(0, dot.offsetLeft + dot.offsetWidth / 2 - 4)}px`);
  }

  /* Abdunkeln: jeder Teilbaum ohne aktives Element wird an seiner
     obersten Stelle gedimmt; Vorfahren des aktiven Teils bleiben hell,
     damit sich die Deckkraft nicht verschachtelt multipliziert */
  /* Formular-Labels bleiben immer lesbar, sonst verschwinden sie */
  const KEEP = '.sched-form__label';

  function markDim(root) {
    root.querySelectorAll('.is-dim').forEach(el => el.classList.remove('is-dim'));
    (function walk(node) {
      for (const child of node.children) {
        if (child.classList.contains('is-hot') || child.matches(KEEP)) continue;
        if (child.querySelector('.is-hot') || child.querySelector(KEEP)) walk(child);
        else child.classList.add('is-dim');
      }
    })(root);
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
        exhibit.dataset.state = bullets[sub].dataset.state || '';
        exhibit.querySelectorAll('[data-part]').forEach(el => {
          el.classList.toggle('is-hot', el.dataset.part.split(/\s+/).some(p => active.includes(p)));
        });
        markDim(exhibit);
      }
    } else if (exhibit) {
      exhibit.classList.remove('has-focus');
      exhibit.querySelectorAll('.is-dim').forEach(el => el.classList.remove('is-dim'));
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

    paintFill();
    requestAnimationFrame(paintFill);   /* Sicherheitsnetz nach Layout-Änderungen */

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

  /* Kalender-Hover wie im Live-Kalender (embed.js): das Raster verfolgt
     die Maus und lässt alle Slots derselben Durchsage aufleuchten */
  document.querySelectorAll('.exhibit--cal .cal-grid').forEach(grid => {
    let lit = null;
    const setLit = uid => {
      if (uid === lit) return;
      lit = uid;
      grid.querySelectorAll('.cal-hit').forEach(x =>
        x.classList.toggle('is-lit', uid !== null && x.dataset.uid === uid));
    };
    grid.style.pointerEvents = 'auto';
    grid.addEventListener('mousemove', e => {
      const hit = e.target.closest('.cal-hit');
      if (hit) { setLit(hit.dataset.uid); return; }
      if (e.target.closest('.cal-slot, .cal-col__head')) setLit(null);
    });
    grid.addEventListener('mouseleave', () => setLit(null));
  });

  /* Expand/Collapse: der Schalter funktioniert wie im Live-Kalender */
  document.querySelectorAll('.exhibit--cal .density-toggle').forEach(t => {
    t.addEventListener('click', () => {
      const on = t.getAttribute('aria-checked') !== 'true';
      t.setAttribute('aria-checked', on);
      t.dataset.tip = on ? 'Collapse' : 'Expand';
      t.closest('.calendar-view').dataset.density = on ? 'expanded' : 'collapsed';
    });
  });

  render();
})();

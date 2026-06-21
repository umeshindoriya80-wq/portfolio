/* ── Nav: scroll shadow ── */
(function () {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Nav: mobile hamburger ── */
(function () {
  const btn    = document.querySelector('.nav-hamburger');
  const drawer = document.querySelector('.nav-drawer');
  if (!btn || !drawer) return;

  const setOpen = open => {
    drawer.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));

  // Close on drawer link click
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));

  // Close on Escape, return focus to the toggle
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      setOpen(false);
      btn.focus();
    }
  });
})();

/* ── Scroll fade-in ── */
(function () {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;
  const io = new IntersectionObserver(
    entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  els.forEach(el => io.observe(el));
})();

/* ── Hero: MagnetLines background ── */
(function () {
  const container = document.getElementById('magnetLines');
  if (!container) return;
  const ROWS = 13, COLS = 20, BASE = -10;
  container.style.gridTemplateColumns = `repeat(${COLS},1fr)`;
  container.style.gridTemplateRows    = `repeat(${ROWS},1fr)`;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < ROWS * COLS; i++) {
    const s = document.createElement('span');
    s.style.cssText = `--rotate:${BASE}deg;width:3px;height:clamp(20px,3vmin,36px);background:rgba(220,38,38,0.28);border-radius:2px`;
    frag.appendChild(s);
  }
  container.appendChild(frag);
  const items = container.querySelectorAll('span');
  const track = ({x, y}) => items.forEach(el => {
    const r = el.getBoundingClientRect();
    const cx = r.x + r.width/2, cy = r.y + r.height/2;
    const b = x-cx, a = y-cy, c = Math.sqrt(a*a+b*b)||1;
    el.style.setProperty('--rotate', `${((Math.acos(b/c)*180/Math.PI)*(y>cy?1:-1)).toFixed(1)}deg`);
  });
  const isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (isMobile) {
    // Auto wave: virtual cursor follows a slow Lissajous path over the hero
    let t = 0;
    const loop = () => {
      const heroR = container.getBoundingClientRect();
      const cx = heroR.left + heroR.width  / 2;
      const cy = heroR.top  + heroR.height / 2;
      const rx = heroR.width  * 0.38;
      const ry = heroR.height * 0.28;
      const x  = cx + Math.cos(t)       * rx;
      const y  = cy + Math.sin(t * 1.6) * ry;
      track({x, y});
      t += 0.012;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(() => {
      container.classList.add('ready');
      loop();
    });
  } else {
    window.addEventListener('pointermove', track, {passive:true});
    requestAnimationFrame(() => {
      container.classList.add('ready');
      const mid = items[Math.floor(items.length/2)];
      const r = mid.getBoundingClientRect();
      track({x: r.x, y: r.y});
    });
  }
})();

/* ── Hero: torch cursor + clone invert ── */
(function () {
  const hero  = document.getElementById('heroSection');
  const clone = document.getElementById('heroInvertClone');
  if (!hero || !clone) return;

  const move = e => {
    const r = hero.getBoundingClientRect();
    clone.style.setProperty('--torch-x', (e.clientX - r.left) + 'px');
    clone.style.setProperty('--torch-y', (e.clientY - r.top)  + 'px');
  };

  hero.addEventListener('mouseenter', () => { document.body.style.cursor = 'none'; });
  hero.addEventListener('mouseleave', () => {
    document.body.style.cursor = '';
    clone.style.setProperty('--torch-x', '-999px');
  });

  window.addEventListener('pointermove', move, { passive: true });
})();

/* ── CurvedLoop ── */
(function () {
  const TEXT  = '4+ YEARS EXPERIENCE ✶ M.DES IIT GUWAHATI ✶ THOUGHTSPOT ✶ ENTERPRISE UX ✶ AI & ANALYTICS ✶ CONVERSATIONAL AI ✶ B2B SAAS ✶ 0→1 PRODUCT DESIGN ✶ ';
  const SPEED = 0.35;

  const jacket   = document.getElementById('curvedLoop');
  const measure  = document.getElementById('clMeasure');
  const textPath = document.getElementById('clTextPath');
  const pathEl   = document.getElementById('clPath');
  if (!jacket || !measure || !textPath || !pathEl) return;

  pathEl.setAttribute('d', 'M-200,52 L1640,52');
  measure.textContent = TEXT;

  let spacing = 0, offset = 0, dir = -1, dragging = false, lastX = 0, vel = 0;

  function tryInit() {
    spacing = measure.getComputedTextLength();
    if (!spacing) { requestAnimationFrame(tryInit); return; }
    const copies = Math.ceil(3000 / spacing) + 3;
    textPath.textContent = TEXT.repeat(copies);
    offset = -spacing;
    textPath.setAttribute('startOffset', offset + 'px');
    requestAnimationFrame(step);
  }

  function step() {
    if (!dragging) {
      offset += dir * SPEED;
      if (offset <= -spacing) offset += spacing;
      if (offset > 0)         offset -= spacing;
      textPath.setAttribute('startOffset', offset + 'px');
    }
    requestAnimationFrame(step);
  }

  jacket.addEventListener('pointerdown', e => {
    dragging = true; lastX = e.clientX; vel = 0;
    jacket.setPointerCapture(e.pointerId);
  });
  jacket.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; vel = dx;
    offset += dx;
    if (offset <= -spacing) offset += spacing;
    if (offset > 0)         offset -= spacing;
    textPath.setAttribute('startOffset', offset + 'px');
  });
  const endDrag = () => { if (!dragging) return; dragging = false; dir = vel >= 0 ? 1 : -1; };
  jacket.addEventListener('pointerup',    endDrag);
  jacket.addEventListener('pointerleave', endDrag);

  document.fonts.ready.then(() => requestAnimationFrame(tryInit));
})();

/* ── BorderGlow cards ── */
(function () {
  document.querySelectorAll('.project-card:not(.project-card-stub)').forEach(card => {
    // Inject edge-light span + wrap children in border-glow-inner
    const edgeLight = document.createElement('span');
    edgeLight.className = 'edge-light';
    const inner = document.createElement('div');
    inner.className = 'border-glow-inner';
    [...card.childNodes].forEach(n => inner.appendChild(n));
    card.appendChild(edgeLight);
    card.appendChild(inner);

    card.addEventListener('pointermove', e => {
      const r  = card.getBoundingClientRect();
      const x  = e.clientX - r.left;
      const y  = e.clientY - r.top;
      const cx = r.width  / 2;
      const cy = r.height / 2;
      const dx = x - cx, dy = y - cy;
      const kx = dx !== 0 ? cx / Math.abs(dx) : Infinity;
      const ky = dy !== 0 ? cy / Math.abs(dy) : Infinity;
      const edge  = Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
      let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (angle < 0) angle += 360;
      card.style.setProperty('--edge-proximity', (edge * 100).toFixed(2));
      card.style.setProperty('--cursor-angle',   `${angle.toFixed(2)}deg`);
    });
  });
})();

/* ── Active nav link (highlights current page) ── */
(function () {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a, .nav-drawer a').forEach(a => {
    const href = a.getAttribute('href') || '';
    // Mark active if href matches current path suffix
    if (href && path.endsWith(href.replace(/^\.\.\//, '/').replace(/^\.\//, '/'))) {
      a.setAttribute('aria-current', 'page');
    }
  });
})();

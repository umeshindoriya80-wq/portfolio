/* ════════════════════════════════════════════════════════════════════
   DEV SLIDE CONTROLLER  —  iteration tool, NOT part of the final product.

   • Version switch (V1 / V2): each slide belongs to a version via its
     data-version attribute (no attribute = "v1"). Switching versions shows
     only that version's slides and lists only those in the panel.
   • Hide / show each slide (display:none — never deletes from the HTML).
   • Drag a row by its ⠿ handle to reorder slides on the page.
   • "go" scrolls to a slide.  Show all / Hide all batch buttons.
   • Active version, hidden state, and custom order are saved to localStorage
     (per version). The source HTML is never modified — when a layout is
     final, ask to "bake the current order into the file".

   Remove entirely: delete this file + its <script> tag. Nothing depends on it.
   ════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var VERSION_KEY = 'slideController.activeVersion.v1';
  function hideKey(v) { return 'slideController.hidden.' + v; }
  function orderKey(v) { return 'slideController.order.' + v; }

  var main = document.getElementById('main');
  if (!main) return;
  var slides = Array.prototype.slice.call(main.querySelectorAll(':scope > section, :scope > header'));
  if (!slides.length) return;

  /* ---- label + stable key -------------------------------------------- */
  function labelFor(el, i) {
    var firstP = el.querySelector('p');
    if (firstP && /^(Candidate|V2)/.test(firstP.textContent.trim())) return firstP.textContent.trim();
    var snum = el.querySelector('.s-head__top .s-num');
    var lbl = el.querySelector('.s-head__top .label');
    if (snum && lbl) return snum.textContent.trim() + ' · ' + lbl.textContent.trim();
    var h1 = el.querySelector('h1');
    if (h1) return 'Hero — ' + h1.textContent.trim();
    if (el.querySelector('.stat-band')) return 'Stat band';
    var h2 = el.querySelector('h2');
    if (h2) return h2.textContent.trim();
    return 'Section ' + (i + 1);
  }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); }

  var seen = {}, byKey = {};
  var items = slides.map(function (el, i) {
    var label = labelFor(el, i);
    var key = slug(label) || 'slide';
    if (seen[key] != null) key = key + '-' + i;
    seen[key] = true;
    var it = { el: el, label: label, key: key, version: el.getAttribute('data-version') || 'v1' };
    byKey[key] = it;
    return it;
  });

  var versions = [];
  items.forEach(function (it) { if (versions.indexOf(it.version) === -1) versions.push(it.version); });

  /* ---- persistence ---------------------------------------------------- */
  function load(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var active = load(VERSION_KEY);
  if (versions.indexOf(active) === -1) active = versions[0];

  var hiddenByVer = {}, orderByVer = {};
  versions.forEach(function (v) {
    var verItems = items.filter(function (it) { return it.version === v; });
    var h = {};
    (load(hideKey(v)) || []).forEach(function (k) { if (byKey[k]) h[k] = true; });
    hiddenByVer[v] = h;
    var saved = (load(orderKey(v)) || []).filter(function (k) { return byKey[k] && byKey[k].version === v; });
    verItems.forEach(function (it) { if (saved.indexOf(it.key) === -1) saved.push(it.key); });
    orderByVer[v] = saved;
  });

  /* ---- apply state to the page --------------------------------------- */
  function applyVisibility() {
    items.forEach(function (it) {
      var inActive = it.version === active;
      it.el.classList.toggle('version-off', !inActive);
      it.el.classList.toggle('slide-hidden', inActive && !!hiddenByVer[active][it.key]);
    });
  }
  function applyOrder() {
    var anchor = main.querySelector('.cs-pagenav');
    orderByVer[active].forEach(function (k) { if (byKey[k]) main.insertBefore(byKey[k].el, anchor); });
  }
  applyOrder();
  applyVisibility();

  /* ---- styles --------------------------------------------------------- */
  var css = ''
    + '.slide-hidden{display:none !important;}'
    + '#slidectl{position:fixed;right:16px;bottom:16px;z-index:99999;width:320px;max-width:calc(100vw - 32px);'
    + 'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#14141a;background:#fff;'
    + 'border:1px solid #e2e1db;border-radius:12px;box-shadow:0 12px 32px rgba(20,20,26,.18);overflow:hidden;}'
    + '#slidectl.collapsed{width:auto;}#slidectl.collapsed .sc-body{display:none;}'
    + '#slidectl .sc-head{display:flex;align-items:center;gap:8px;cursor:pointer;user-select:none;padding:10px 12px;background:#14141a;color:#fff;}'
    + '#slidectl .sc-title{font-size:12px;font-weight:700;letter-spacing:.3px;flex:1;}'
    + '#slidectl .sc-count{font-size:10px;font-weight:600;color:#bdbcd6;}'
    + '#slidectl .sc-caret{font-size:11px;color:#bdbcd6;transition:transform .15s;}#slidectl.collapsed .sc-caret{transform:rotate(180deg);}'
    + '#slidectl .sc-tabs{display:flex;gap:6px;padding:8px 12px;border-bottom:1px solid #efeee9;background:#faf9f5;}'
    + '#slidectl .sc-tab{flex:1;font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;cursor:pointer;'
    + 'border:1px solid #e2e1db;background:#fff;color:#8b8b94;border-radius:6px;padding:6px 8px;}'
    + '#slidectl .sc-tab.active{background:#5b4bd6;border-color:#5b4bd6;color:#fff;}'
    + '#slidectl .sc-body{max-height:50vh;overflow:auto;}'
    + '#slidectl .sc-actions{display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid #efeee9;}'
    + '#slidectl .sc-actions button{flex:1;font-size:10.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;cursor:pointer;'
    + 'border:1px solid #e2e1db;background:#f7f6f2;color:#14141a;border-radius:6px;padding:6px 8px;}'
    + '#slidectl .sc-actions button:hover{background:#edece6;}'
    + '#slidectl .sc-hint{font-size:10px;color:#9a9a93;padding:6px 12px 2px;}'
    + '#slidectl .sc-row{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid #f3f2ed;font-size:12px;line-height:1.35;background:#fff;}'
    + '#slidectl .sc-row.is-hidden{opacity:.45;}'
    + '#slidectl .sc-row.dragging{opacity:.4;background:#efedfb;}'
    + '#slidectl .sc-grip{cursor:grab;color:#c2c1ba;font-size:13px;flex-shrink:0;line-height:1;}#slidectl .sc-grip:active{cursor:grabbing;}'
    + '#slidectl .sc-row input{margin:0;flex-shrink:0;width:14px;height:14px;cursor:pointer;accent-color:#5b4bd6;}'
    + '#slidectl .sc-row .sc-label{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;}'
    + '#slidectl .sc-row .sc-jump{font-size:10px;color:#8b8b94;flex-shrink:0;text-decoration:none;padding:2px 4px;border-radius:4px;}'
    + '#slidectl .sc-row .sc-jump:hover{background:#edece6;color:#5b4bd6;}';
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---- panel shell ---------------------------------------------------- */
  var panel = document.createElement('div');
  panel.id = 'slidectl';

  var head = document.createElement('div');
  head.className = 'sc-head';
  head.innerHTML = '<span class="sc-title">Slides</span><span class="sc-count"></span><span class="sc-caret">▾</span>';
  panel.appendChild(head);

  var body = document.createElement('div');
  body.className = 'sc-body';

  // version tabs (only if >1 version)
  var tabEls = {};
  if (versions.length > 1) {
    var tabs = document.createElement('div');
    tabs.className = 'sc-tabs';
    versions.forEach(function (v) {
      var t = document.createElement('button');
      t.className = 'sc-tab' + (v === active ? ' active' : '');
      t.textContent = v.toUpperCase();
      t.addEventListener('click', function () { switchVersion(v); });
      tabs.appendChild(t);
      tabEls[v] = t;
    });
    body.appendChild(tabs);
  }

  var actions = document.createElement('div');
  actions.className = 'sc-actions';
  var btnAll = document.createElement('button'); btnAll.textContent = 'Show all';
  var btnNone = document.createElement('button'); btnNone.textContent = 'Hide all';
  actions.appendChild(btnAll); actions.appendChild(btnNone);
  body.appendChild(actions);

  var hint = document.createElement('div');
  hint.className = 'sc-hint';
  hint.textContent = 'Drag ⠿ to reorder · uncheck to hide';
  body.appendChild(hint);

  var countEl = head.querySelector('.sc-count');
  function updateCount() {
    var verItems = items.filter(function (it) { return it.version === active; });
    var h = verItems.filter(function (it) { return hiddenByVer[active][it.key]; }).length;
    countEl.textContent = (active.toUpperCase()) + ' · ' + (h ? (h + ' hidden') : 'all shown');
  }

  function setHidden(it, isHidden, row) {
    if (isHidden) hiddenByVer[active][it.key] = true; else delete hiddenByVer[active][it.key];
    it.el.classList.toggle('slide-hidden', isHidden);
    if (row) row.classList.toggle('is-hidden', isHidden);
    save(hideKey(active), Object.keys(hiddenByVer[active]));
    updateCount();
  }

  function makeRow(it) {
    var row = document.createElement('div');
    row.className = 'sc-row' + (hiddenByVer[active][it.key] ? ' is-hidden' : '');
    row.dataset.key = it.key;
    row.draggable = true;

    var grip = document.createElement('span'); grip.className = 'sc-grip'; grip.textContent = '⠿'; grip.title = 'Drag to reorder';
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !hiddenByVer[active][it.key];
    var label = document.createElement('span'); label.className = 'sc-label'; label.textContent = it.label; label.title = it.label;
    var jump = document.createElement('a'); jump.className = 'sc-jump'; jump.href = '#'; jump.textContent = 'go'; jump.title = 'Scroll to this slide';

    function toggle(isHidden) { cb.checked = !isHidden; setHidden(it, isHidden, row); }
    cb.addEventListener('click', function (e) { e.stopPropagation(); toggle(!cb.checked); });
    label.addEventListener('click', function () { toggle(cb.checked); });
    jump.addEventListener('click', function (e) {
      e.preventDefault();
      if (hiddenByVer[active][it.key]) toggle(false);
      it.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    row.addEventListener('dragstart', function (e) { row.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', it.key); } catch (x) {} });
    row.addEventListener('dragend', function () { row.classList.remove('dragging'); syncOrderFromRows(); });
    row.addEventListener('dragover', function (e) {
      e.preventDefault();
      var dragging = body.querySelector('.sc-row.dragging');
      if (!dragging || dragging === row) return;
      var rect = row.getBoundingClientRect();
      body.insertBefore(dragging, (e.clientY - rect.top) < rect.height / 2 ? row : row.nextSibling);
    });

    row.appendChild(grip); row.appendChild(cb); row.appendChild(label); row.appendChild(jump);
    it._row = row; it._cb = cb;
    return row;
  }

  function renderRows() {
    Array.prototype.forEach.call(body.querySelectorAll('.sc-row'), function (r) { r.remove(); });
    orderByVer[active].forEach(function (k) { if (byKey[k]) body.appendChild(makeRow(byKey[k])); });
  }

  function syncOrderFromRows() {
    orderByVer[active] = Array.prototype.map.call(body.querySelectorAll('.sc-row'), function (r) { return r.dataset.key; });
    applyOrder();
    save(orderKey(active), orderByVer[active]);
  }

  function switchVersion(v) {
    if (v === active) return;
    active = v;
    save(VERSION_KEY, active);
    versions.forEach(function (vv) { if (tabEls[vv]) tabEls[vv].classList.toggle('active', vv === active); });
    applyOrder();
    applyVisibility();
    renderRows();
    updateCount();
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.dispatchEvent(new CustomEvent('slidectl:versionchange', { detail: { version: active } }));
  }

  btnAll.addEventListener('click', function () {
    items.filter(function (it) { return it.version === active; }).forEach(function (it) {
      delete hiddenByVer[active][it.key]; it.el.classList.remove('slide-hidden');
      if (it._cb) it._cb.checked = true; if (it._row) it._row.classList.remove('is-hidden');
    });
    save(hideKey(active), []); updateCount();
  });
  btnNone.addEventListener('click', function () {
    items.filter(function (it) { return it.version === active; }).forEach(function (it) {
      hiddenByVer[active][it.key] = true; it.el.classList.add('slide-hidden');
      if (it._cb) it._cb.checked = false; if (it._row) it._row.classList.add('is-hidden');
    });
    save(hideKey(active), Object.keys(hiddenByVer[active])); updateCount();
  });

  head.addEventListener('click', function () { panel.classList.toggle('collapsed'); });

  renderRows();
  panel.appendChild(body);
  document.body.appendChild(panel);
  updateCount();
})();

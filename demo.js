// demo.js: the web demo's stand-in for the local helper.
// The real console runs a small helper next to this page that launches the games and tells the page what
// to show. Here there are no games, so this file answers the page's calls itself: the fire is lit, both
// games are on the shelf, a launch plays the pick and loading animation and then comes back to the
// campfire, and turning off lets the fire die down and lights a new one. Remove this one <script> tag and
// the page talks to a real helper again, unchanged.
(() => {
  const state = { v: 1, run: 1, n: 1, mode: 'show', games: { zelda: true, wow: true }, who: 'p1',
    saved: '', savedMs: 0, menu: 0, close: 0, dark: false, game: null, up: false, tilt: '' };
  const LOADING_MS = 4500, RELIGHT_MS = 2500;
  const json = o => new Response(JSON.stringify(o), { headers: { 'content-type': 'application/json' } });
  const relight = ms => setTimeout(() => { state.n++ }, ms);

  const routes = {
    '/state': () => json(state),
    '/launch': q => { if (q.get('who')) state.who = q.get('who'); relight(LOADING_MS); return json({ ok: true }) },
    '/power': () => { relight(RELIGHT_MS); return json({ ok: true }) },
    '/quit': () => { relight(RELIGHT_MS); return json({ ok: true }) },
    '/resume': () => json({ ok: true }),
    '/ready': () => json({ ok: true }),
    '/note': () => json({ ok: true }),
  };

  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    const url = typeof input === 'string' ? input : input && input.url;
    if (typeof url === 'string' && url.startsWith('/')) {
      const u = new URL(url, location.origin), route = routes[u.pathname];
      if (route) return Promise.resolve(route(u.searchParams));
      return Promise.resolve(new Response('', { status: 404 }));
    }
    return realFetch(input, init);
  };

  // On the real console the Xbox button opens the campfire menu through the helper. Here: Esc (or a
  // controller's Start / View button) opens it, and Esc backs out of any box, like B.
  const menuOrBack = () => {
    if (typeof dlg === 'undefined') return;
    if (dlg || mode === 'pause') back(); else openCamp();
  };
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { menuOrBack(); e.preventDefault() }
    hint.classList.add('gone');
  });
  let prev = [];
  (function pad() {
    const g = [...(navigator.getGamepads?.() || [])].find(Boolean);
    if (g) { const b = g.buttons.map(v => v.pressed);
      if ((b[8] && !prev[8]) || (b[9] && !prev[9])) { if (typeof dlg !== 'undefined' && !dlg) openCamp() }
      if (b.some(Boolean)) hint.classList.add('gone');
      prev = b }
    requestAnimationFrame(pad) })();

  // a small hint for visitors, gone at the first key or button
  const hint = document.createElement('div');
  hint.id = 'hint';
  hint.innerHTML = 'arrows / d-pad &nbsp;move &nbsp;·&nbsp; enter / A &nbsp;pick &nbsp;·&nbsp; esc / B &nbsp;back &nbsp;·&nbsp; esc / start &nbsp;menu';
  const css = document.createElement('style');
  css.textContent = '#hint{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:10;font:13px/1.4 ui-monospace,Menlo,Consolas,monospace;color:#efdcb4;background:rgba(18,8,3,.78);border:1px solid #71401f;padding:6px 12px;border-radius:4px;white-space:nowrap;transition:opacity .8s;pointer-events:none}#hint.gone{opacity:0}@media (max-width:600px){#hint{white-space:normal;width:calc(100% - 64px);text-align:center}}';
  document.head.appendChild(css);
  addEventListener('DOMContentLoaded', () => document.body.appendChild(hint));
})();

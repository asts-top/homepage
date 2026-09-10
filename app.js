(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const cards = [...document.querySelectorAll('.service-card')];
  // Real HTML links are the single source of truth, including paths/fragments.
  const services = new Map(cards.map((card) => {
    const link = card.querySelector('.service-link');
    link.dataset.visit = card.dataset.id;
    return [card.dataset.id, {
      card, link, id: card.dataset.id, category: card.dataset.category,
      name: card.querySelector('.service-name').firstChild.textContent.trim(),
      host: new URL(link.href).host,
      search: `${card.textContent} ${card.dataset.keywords} ${link.href}`.normalize('NFKC').toLowerCase(),
    }];
  }));
  const recentKey = 'pw.recent.v1';
  const favoritesKey = 'pw.favorites.v1';
  const memory = new Map();
  let storageAvailable = true;
  function storageFailed() {
    storageAvailable = false;
    $('storage-note').textContent = '当前浏览器无法保存记录，本次访问仍可使用';
  }
  function read(key) {
    if (memory.has(key)) return memory.get(key);
    try { return localStorage.getItem(key); }
    catch { storageFailed(); return null; }
  }
  function write(key, value) {
    memory.set(key, value);
    try { localStorage.setItem(key, value); }
    catch { storageFailed(); }
  }
  function parseArray(value) {
    if (!value || value.length > 20000) return [];
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []; }
    catch { return []; }
  }
  function validIds(ids, limit = services.size) {
    return [...new Set(ids)].filter((id) => services.has(id)).slice(0, limit);
  }
  const storedRecent = read(recentKey);
  // Migrate the previous homepage's hostname-only history through known links.
  const legacy = storedRecent === null ? parseArray(read('recentVisits')).map((host) => [...services.values()].find((service) => service.host === host)?.id) : [];
  let recent = validIds(storedRecent === null ? legacy : parseArray(storedRecent), 4);
  if (storedRecent === null && recent.length) write(recentKey, JSON.stringify(recent));
  let favorites = new Set(validIds(parseArray(read(favoritesKey))));
  let activeFilter = 'all';
  const search = $('service-search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    $('toast').hidden = false;
    $('toast').textContent = message;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 2600);
  }
  function applyFilters() {
    const terms = search.value.normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    for (const service of services.values()) {
      const categoryMatches = activeFilter === 'all' || (activeFilter === 'favorites' ? favorites.has(service.id) : service.category === activeFilter);
      const visible = categoryMatches && terms.every((term) => service.search.includes(term));
      service.card.hidden = !visible;
      if (visible) count++;
    }
    $('service-grid').hidden = count === 0;
    $('empty-results').hidden = count !== 0;
    $('search-status').textContent = `显示 ${count} 个服务`;
    $('clear-search').hidden = search.value.length === 0;
    $('search-shortcut').hidden = search.value.length > 0;
    if (activeFilter === 'favorites' && favorites.size === 0) {
      $('empty-title').textContent = '把常用的，留在手边。';
      $('empty-description').textContent = '点亮工具右上角的星标，就能在这里快速找到它。';
    } else {
      $('empty-title').textContent = '还没找到这个工具';
      $('empty-description').textContent = '试试名称、用途，或换一个分类。';
    }
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.filter === activeFilter));
  }
  function syncFavorites() {
    for (const service of services.values()) {
      const button = service.card.querySelector('.favorite-button');
      const selected = favorites.has(service.id);
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', `${selected ? '取消收藏' : '收藏'} ${service.name}`);
      button.title = `${selected ? '取消收藏' : '收藏'} ${service.name}`;
    }
    document.querySelector('[data-count="favorites"]').textContent = favorites.size;
  }
  function selectFilter(filter) { activeFilter = filter; applyFilters(); }
  function resetFilters() {
    search.value = '';
    selectFilter('all');
    search.focus({ preventScroll: true });
  }
  for (const filter of filters) filter.addEventListener('click', () => selectFilter(filter.dataset.filter));
  for (const service of services.values()) {
    const button = service.card.querySelector('.favorite-button');
    button.hidden = false;
    button.addEventListener('click', () => {
      const wasFavorite = favorites.has(service.id);
      if (wasFavorite) favorites.delete(service.id); else favorites.add(service.id);
      write(favoritesKey, JSON.stringify([...favorites]));
      syncFavorites();
      applyFilters();
      if (activeFilter === 'favorites' && wasFavorite) {
        const next = cards.find((card) => !card.hidden);
        (next?.querySelector('.favorite-button') || document.querySelector('[data-filter="favorites"]')).focus({ preventScroll: true });
      }
      notify(wasFavorite ? `已取消收藏 ${service.name}` : `已收藏 ${service.name}${storageAvailable ? '' : '（本次访问）'}`);
    });
  }
  search.addEventListener('input', applyFilters);
  $('clear-search').addEventListener('click', () => { search.value = ''; applyFilters(); search.focus(); });
  $('reset-filters').addEventListener('click', resetFilters);
  document.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    const target = event.target;
    const editing = target instanceof Element && (target.matches('input,textarea,select') || target.isContentEditable);
    if ((!editing && !event.ctrlKey && !event.metaKey && !event.altKey && event.key === '/') || ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k')) {
      event.preventDefault(); search.focus(); search.select();
    }
    if (event.key === 'Escape' && target === search) { event.preventDefault(); search.value = ''; applyFilters(); search.blur(); }
  });

  function arrowIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'icon'); svg.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use'); use.setAttribute('href', '#i-arrow'); svg.append(use); return svg;
  }
  function renderRecent() {
    const fragment = document.createDocumentFragment();
    for (const id of recent) {
      const service = services.get(id);
      const link = document.createElement('a');
      link.className = 'recent-link'; link.href = service.link.href;
      link.target = '_blank'; link.rel = 'noopener noreferrer'; link.dataset.visit = id;
      const icon = service.card.querySelector('.service-icon').cloneNode(true);
      const copy = document.createElement('span'); copy.className = 'recent-copy';
      const name = document.createElement('span'); name.className = 'recent-name'; name.textContent = service.name;
      const host = document.createElement('span'); host.className = 'recent-domain'; host.textContent = service.host;
      copy.append(name, host); link.append(icon, copy, arrowIcon()); fragment.append(link);
    }
    $('recent-list').replaceChildren(fragment);
    $('recent-list').hidden = recent.length === 0;
    $('recent-empty').hidden = recent.length > 0;
    $('clear-recent').hidden = recent.length === 0;
  }
  function recordVisit(event) {
    if (event.type === 'auxclick' && event.button !== 1) return;
    const link = event.target instanceof Element ? event.target.closest('a[data-visit]') : null;
    const id = link?.dataset.visit;
    if (!services.has(id)) return;
    recent = [id, ...recent.filter((item) => item !== id)].slice(0, 4);
    write(recentKey, JSON.stringify(recent));
    // Defer replacing a history link until its native navigation has completed.
    setTimeout(renderRecent, 0);
  }
  document.addEventListener('click', recordVisit);
  document.addEventListener('auxclick', recordVisit);
  $('clear-recent').addEventListener('click', () => {
    recent = []; write(recentKey, '[]'); renderRecent();
    $('recent-title').tabIndex = -1; $('recent-title').focus({ preventScroll: true });
    notify('最近访问已清空');
  });

  const themeMedia = matchMedia('(prefers-color-scheme: dark)');
  let themeChoice = read('pw.theme');
  if (themeChoice !== 'light' && themeChoice !== 'dark') themeChoice = null;
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const next = theme === 'dark' ? '浅色' : '深色';
    $('theme-toggle').setAttribute('aria-label', `切换到${next}主题`);
    $('theme-toggle').title = `切换到${next}主题`;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#171e1a' : '#f7f7f2';
  }
  setTheme(themeChoice || (themeMedia.matches ? 'dark' : 'light'));
  $('theme-toggle').hidden = false;
  $('theme-toggle').addEventListener('click', () => {
    themeChoice = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    write('pw.theme', themeChoice); setTheme(themeChoice);
  });
  themeMedia.addEventListener('change', (event) => { if (!themeChoice) setTheme(event.matches ? 'dark' : 'light'); });

  let clockTimer;
  const clockFormat = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const dateFormat = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  function updateClock() {
    clearTimeout(clockTimer);
    const now = new Date(), hour = now.getHours();
    const time = clockFormat.format(now);
    $('local-time').textContent = time; $('local-time').dateTime = time;
    $('local-date').textContent = dateFormat.format(now);
    $('year').textContent = now.getFullYear();
    $('time-period').textContent = 'LOCAL';
    const night = hour < 6 || hour >= 19;
    document.querySelector('.moment-sun use').setAttribute('href', night ? '#i-moon' : '#i-sun');
    $('time-greeting').textContent = hour < 6 ? '夜深了，也别忘了休息。' : hour < 12 ? '新的一天，慢慢展开。' : hour < 18 ? '给灵感一点自由时间。' : '忙碌过后，随意逛逛。';
    // One aligned update per minute; hidden tabs perform no clock work.
    if (!document.hidden) clockTimer = setTimeout(updateClock, 60000 - (Date.now() % 60000) + 25);
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(clockTimer); else updateClock(); });
  // Reflect changes made in another tab without losing the current filter.
  window.addEventListener('storage', (event) => {
    if (event.key === favoritesKey || event.key === null) {
      memory.delete(favoritesKey); favorites = new Set(validIds(parseArray(read(favoritesKey)))); syncFavorites(); applyFilters();
    }
    if (event.key === recentKey || event.key === null) {
      memory.delete(recentKey); recent = validIds(parseArray(read(recentKey)), 4); renderRecent();
    }
    if (event.key === 'pw.theme' || event.key === null) {
      memory.delete('pw.theme'); const value = read('pw.theme'); themeChoice = value === 'light' || value === 'dark' ? value : null; setTheme(themeChoice || (themeMedia.matches ? 'dark' : 'light'));
    }
  });
  for (const category of ['all', 'daily', 'ai', 'manage']) {
    document.querySelector(`[data-count="${category}"]`).textContent = category === 'all' ? services.size : [...services.values()].filter((service) => service.category === category).length;
  }
  syncFavorites(); renderRecent(); applyFilters(); updateClock();
  for (const id of ['search-field', 'filter-row', 'moment-card', 'recent-section']) $(id).hidden = false;
  document.querySelector('.favorite-note').hidden = false;
})();

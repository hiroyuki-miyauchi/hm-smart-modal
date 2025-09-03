if (typeof window.HM_SM_DATA==='undefined'){window.HM_SM_DATA={settings:{sets:[]},i18n:{}};}
// Front JS (vanilla) - extended features
(function(){
  // GA4送信用の薄いラッパー（存在しない場合は何もしない）
  function hmSmSendEvent(name, params){
    try{
      if (typeof window.gtag === 'function') { window.gtag('event', name, params || {}); }
    }catch(e){ /* no-op */ }
  }

  if (typeof window.HM_SM_DATA === 'undefined') return;
  const CFG = window.HM_SM_DATA.settings || {};
  const CURRENT = window.HM_SM_DATA.current || {};
  const I18N = window.HM_SM_DATA.i18n || {};

  function hmSmAbKey(idx){ return 'hm_sm_ab_'+idx; }
  function hmSmAbAssigned(set, idx){
    try{
      if (!set.ab || !set.ab.enabled) return true;
      const key = hmSmAbKey(idx);
      const prev = sessionStorage.getItem(key);
      if (prev !== null) return prev === '1';
      const p = Math.max(0, Math.min(100, Number(set.ab.show_percent ?? 100)));
      const assign = (Math.random()*100) < p ? 1 : 0;
      sessionStorage.setItem(key, String(assign));
      try{ if (typeof window.gtag==='function'){ window.gtag('event','hm_modal_ab_assign',{set_index:idx,assigned:assign,percent:p,title:set.title||''}); } }catch(e){}
      return assign === 1;
    }catch(e){ return true; }
  }


  function hmSmMatchUrl(set){
    try{
      if (!set.apply_on_urls_enabled) return true;
      const mode = set.apply_on_urls_mode || 'list';
      const rulesText = (set.apply_on_urls || '').split('\n').map(s=>s.trim()).filter(Boolean);
      if (!rulesText.length) return true;
      const url = location.href;
      let matched = false;
      for (const rule of rulesText){
        const isNeg = rule.startsWith('!');
        const pat = isNeg ? rule.slice(1).trim() : rule;
        let ok = false;
        if (mode === 'list'){
          const esc = pat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*');
          ok = new RegExp(esc).test(url);
        }else if (mode === 'prefix'){
          ok = url.startsWith(pat);
        }else if (mode === 'regex'){
          try{ ok = new RegExp(pat).test(url); }catch(e){ ok = false; }
        }
        if (isNeg && ok) return false;
        if (ok) matched = true;
      }
      return matched;
    }catch(e){ return true; }
  }


  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  function hexToRgba(hex, opacity){
    try {
      const h = hex.replace('#','');
      const r = parseInt(h.substring(0,2), 16);
      const g = parseInt(h.substring(2,4), 16);
      const b = parseInt(h.substring(4,6), 16);
      const a = clamp(parseFloat(opacity), 0, 1);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    } catch(e) { return hex; }
  }
  function parseParamsJSON(txt){
    if (!txt || !txt.trim()) return {};
    try { return JSON.parse(txt); } catch(e){ return {}; }
  }
  function getQueryParam(key){
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  }
  function getDevice(spMax, tabMax){
    const w = window.innerWidth;
    if (w <= spMax) return 'sp';
    if (w <= tabMax) return 'tab';
    return 'pc';
  }
  function nowWithinSchedule(sc){
    if (!sc || !sc.enabled) return true;
    const now = new Date();
    if (sc.date_start) { const ds = new Date(sc.date_start + 'T00:00:00'); if (now < ds) return false; }
    if (sc.date_end) { const de = new Date(sc.date_end + 'T23:59:59'); if (now > de) return false; }
    if (Array.isArray(sc.days) && sc.days.length > 0) { const d = now.getDay(); if (!sc.days.includes(d)) return false; }
    function hmToMin(s){ if (!s || s.indexOf(':')<0) return null; const [h,m]=s.split(':').map(x=>parseInt(x,10)); return h*60+m; }
    const ts = hmToMin(sc.time_start), te = hmToMin(sc.time_end);
    if (ts !== null && te !== null) { const cur=now.getHours()*60+now.getMinutes(); if (!(cur>=ts && cur<=te)) return false; }
    return true;
  }
  function sendGa4(set, type, extra){
    try{
      if (!set.ga4 || !set.ga4.enabled) return;
      if (typeof window.gtag !== 'function') return;
      let ev = set.ga4.event_open;
      if (type==='close') ev = set.ga4.event_close;
      if (type==='link') ev = set.ga4.event_link;
      const base = { hm_set_title: set.title || '', hm_set_index: (''+set._index) };
      const custom = parseParamsJSON(set.ga4.params_json || '');
      window.gtag('event', ev || 'hm_modal_event', Object.assign(base, custom, extra||{}));
    }catch(e){}
  }
  function shadowValue(preset, custom){
    const map = { none:'none', sm:'0 4px 10px rgba(0,0,0,.10)', md:'0 10px 30px rgba(0,0,0,.15)', lg:'0 20px 50px rgba(0,0,0,.25)', xl:'0 30px 70px rgba(0,0,0,.35)' };
    if (preset === 'custom' && custom && custom.trim()) return custom;
    return map[preset] || map.md;
  }
  function radiusValue(preset, raw, unit){
    const map = { none:'0px', sm:'6px', md:'12px', lg:'20px', full:'9999px' };
    if (preset && preset !== 'custom') return map[preset] || '0px';
    return (raw||0) + (unit||'px');
  }
  function matchUrl(listText, currentUrl){
    if (!listText) return true;
    const lines = listText.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
    if (lines.length === 0) return true;
    return lines.some(s => currentUrl.indexOf(s) !== -1);
  }
  function matchPostType(allowed, currentPt, isSingular){
    if (!Array.isArray(allowed) || allowed.length === 0) return true;
    if (!isSingular) return false;
    if (!currentPt) return false;
    return allowed.includes(currentPt);
  }

  function styleAndBindTrigger(el, set, mode, zTrigger){
    const pos = (mode === 'sp') ? (set.button.position_sp || 'bottom-center')
              : (mode === 'tab') ? (set.button.position_tab || 'bottom-center')
              : (set.button.position_pc || 'bottom-center');
    const shape = (mode === 'sp') ? (set.button.shape_sp || 'rect')
               : (mode === 'tab') ? (set.button.shape_tab || 'rect')
               : (set.button.shape_pc || 'rect');
    el.classList.add('hm-sm-trigger', `hm-sm-trigger--${pos}`);
    el.setAttribute('data-hm-sm-index', String(set._index));
    el.setAttribute('aria-haspopup', set.trigger_type === 'modal' ? 'dialog' : 'false');
    el.style.zIndex = zTrigger ? String(zTrigger) : '';
    const font = (mode==='sp') ? (set.button.font_size_px||15) : (mode==='tab') ? (set.button.font_size_px_tab||set.button.font_size_px||15) : (set.button.font_size_px_pc||set.button.font_size_px||15);
    el.style.fontSize = font + 'px';
    const hex = (c)=> (typeof c === 'string' ? c : '#000000');
    const bg = hexToRgba(hex(set.button.bg_color || '#000000'), set.button.bg_opacity ?? 1);
    const border = hexToRgba(hex(set.button.border_color || '#000000'), set.button.border_opacity ?? 1);
    el.style.background = bg;
    el.style.color = hex(set.button.text_color || '#FFFFFF');
    el.style.borderWidth = (set.button.border_width_px || 0) + 'px';
    el.style.borderColor = border;
    el.style.borderStyle = 'solid';
    el.style.transition = (set.button.hover_transition_sec ? `all ${set.button.hover_transition_sec}s` : 'none');
    el.style.boxShadow = shadowValue(set.button.shadow_trigger || 'none', set.button.shadow_trigger_custom || '');
    const radius = radiusValue(set.button.radius_preset||'custom', set.button.radius_value, set.button.radius_unit);
    if (shape === 'circle') {
      const w = (mode==='sp') ? (set.button.w_circle_px||50) : (mode==='tab') ? (set.button.w_circle_px_tab||set.button.w_circle_px||50) : (set.button.w_circle_px_pc||set.button.w_circle_px||50);
      const h = (mode==='sp') ? (set.button.h_circle_px||50) : (mode==='tab') ? (set.button.h_circle_px_tab||set.button.h_circle_px||50) : (set.button.h_circle_px_pc||set.button.h_circle_px||50);
      el.style.width = w + 'px'; el.style.height = h + 'px'; el.style.borderRadius = '9999px'; el.style.padding = '0';
    } else {
      el.style.borderRadius = radius; el.style.padding = '10px 16px';
    }
    if (set.button.hover_bg_color || set.button.hover_text_color) {
      const hoverBg = hexToRgba(hex(set.button.hover_bg_color || '#000000'), set.button.hover_bg_opacity ?? 0.8);
      const normalBg = bg; const normalText = el.style.color; const hoverText = hex(set.button.hover_text_color || normalText);
      el.addEventListener('mouseenter', () => { el.style.background = hoverBg; el.style.color = hoverText; });
      el.addEventListener('mouseleave', () => { el.style.background = normalBg; el.style.color = normalText; });
    }
    if (set.trigger_type === 'link') {
      el.setAttribute('href', set.link_url || '#');
      if (set.link_new_tab) el.setAttribute('target', '_blank');
      if (set.link_rel_noopener !== false) el.setAttribute('rel', 'noopener noreferrer');
    } else {
      el.addEventListener('click', function(ev){ ev.preventDefault(); openModalForSet(set); });
    }
    if (!el.textContent || el.textContent.trim()==='') el.textContent = set.button.text || '応募する';
  }

  function injectTrigger(set, mode, zTrigger){
    const el = document.createElement(set.trigger_type === 'link' ? 'a' : 'button');
    styleAndBindTrigger(el, set, mode, zTrigger);
    document.body.appendChild(el);
  }

  function cloneContentForSet(set, onDone){
    let node = null;
    try{ node = document.querySelector(set.selector_to_clone || 'body'); }catch(e){ node = null; }
    if (node) { onDone(node.cloneNode(true)); return; }
    if (set.dynamic_dom && set.dynamic_dom.watch) {
      const timeout = Math.max(0, parseInt(set.dynamic_dom.timeout_ms||3000, 10));
      const start = performance.now();
      const obs = new MutationObserver(()=>{
        try{
          const n = document.querySelector(set.selector_to_clone || 'body');
          if (n) { obs.disconnect(); onDone(n.cloneNode(true)); }
          else if (performance.now() - start > timeout) { obs.disconnect(); onDone(null); }
        }catch(e){ obs.disconnect(); onDone(null); }
      });
      obs.observe(document.documentElement, { childList:true, subtree:true });
      setTimeout(()=>{ try{ obs.disconnect(); }catch(e){} }, timeout+50);
    } else { onDone(null); }
  }

  function lockScroll(){
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventDefaultPassive, { passive:false });
  }
  function unlockScroll(){
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.removeEventListener('touchmove', preventDefaultPassive, { passive:false });
  }
  function preventDefaultPassive(e){
    const content = document.getElementById('hm-sm-content');
    if (content && content.contains(e.target)) return;
    e.preventDefault();
  }

  function openModalForSet(set){
    const root = document.getElementById('hm-sm-root');
    const overlay = root.querySelector('.hm-sm__overlay');
    const dialog = root.querySelector('.hm-sm__dialog');
    const content = root.querySelector('#hm-sm-content');
    const bottomBtn = root.querySelector('.hm-sm__btn-close');

    overlay.style.background = hexToRgba(set.modal.overlay_color || '#000000', set.modal.overlay_opacity ?? 0.5);
    dialog.style.boxShadow = shadowValue(set.modal.shadow_modal || 'lg', set.modal.shadow_modal_custom || '');
    dialog.classList.remove('hm-sm__dialog--sm','hm-sm__dialog--md','hm-sm__dialog--lg');
    dialog.classList.add(`hm-sm__dialog--${set.modal.size || 'md'}`);
    content.style.maxHeight = (set.modal.max_height_px || 600) + 'px';
    if (set.modal.scroll_body) { content.classList.add('hm-sm__content--scroll'); content.classList.remove('hm-sm__content--no-scroll'); }
    else { content.classList.remove('hm-sm__content--scroll'); content.classList.add('hm-sm__content--no-scroll'); }

    const respect = set.modal.respect_reduced_motion !== false && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dur = respect ? 0 : (set.modal.anim_sec ?? 0.25);
    const ease = set.modal.anim_ease || 'ease';
    dialog.style.setProperty('--hm-sm-anim', dur + 's');
    dialog.style.setProperty('--hm-sm-ease', ease);

    root.classList.remove('hm-sm--hidden','hm-sm--leave');
    root.classList.add('hm-sm--enter');
    content.innerHTML = '';
    /* __HM_SM_TRANSFORM_LINKS__ */
    

    cloneContentForSet(set, function(clone){
      if (clone) content.appendChild(clone);
      else { const p = document.createElement('p'); p.textContent = '指定のセレクタが見つかりませんでした。'; content.appendChild(p); }

      const linkSel = (set.internal_link_selector && set.internal_link_selector.trim()) ? set.internal_link_selector : 'a';
      let targets = []; try { targets = content.querySelectorAll(linkSel); } catch(e) { targets = content.querySelectorAll('a'); }

      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridGap = (set.layout && set.layout.gap_px != null ? set.layout.gap_px : 15) + 'px';
      const spMax = parseInt(CURRENT.spMax || 767, 10);
      const tabMax = parseInt(CURRENT.tabMax || 1024, 10);
      const mode = getDevice(spMax, tabMax);
      const cols = (mode === 'sp') ? (set.layout.sp_cols||1) : (mode === 'tab') ? (set.layout.tab_cols||2) : (set.layout.pc_cols||3);
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      grid.style.justifyItems = (mode==='sp' && cols===1) ? 'center' : 'stretch';

      targets.forEach((a)=>{
        a.classList.add('hm-sm__btn');
        a.style.display = 'inline-flex';
        a.style.alignItems = 'center';
        a.style.justifyContent = 'center';
        a.style.textDecoration = 'none';
        a.style.padding = '10px 12px';
        a.style.margin = '6px';
        a.style.borderRadius = '10px';
        a.style.border = '1px solid #111827';
        a.style.background = '#111827';
        a.style.color = '#fff';
        a.style.fontWeight = '600';
        a.setAttribute('rel', (a.getAttribute('rel') || '') + ' noopener noreferrer');
        a.addEventListener('click', ()=> sendGa4(set, 'link', { hm_link: a.href||'' }));
        grid.appendChild(a);
      });
      if (targets.length > 0) content.appendChild(grid);
    });

    bottomBtn.textContent = set.modal.bottom_close_text || (I18N.closeLabel || '閉じる');
    bottomBtn.parentElement.style.display = set.modal.bottom_close_enabled ? 'flex' : 'none';

    const prevFocus = document.activeElement;
    dialog.setAttribute('tabindex', '-1'); dialog.focus(); root._hmSmPrevFocus = prevFocus || null;

    function lockScroll(){ document.documentElement.style.overflow='hidden'; document.body.style.overflow='hidden'; }
    function unlockScroll(){ document.documentElement.style.overflow=''; document.body.style.overflow=''; }
    lockScroll();

    function doClose(){
      root.classList.remove('hm-sm--enter'); root.classList.add('hm-sm--leave');
      setTimeout(()=>{ root.classList.add('hm-sm--hidden'); root.classList.remove('hm-sm--leave'); const c = document.getElementById('hm-sm-content'); if (c) c.innerHTML=''; }, Math.max(0, (dur||0) * 1000));
      unlockScroll();
      if (root._hmSmPrevFocus && root._hmSmPrevFocus.focus) root._hmSmPrevFocus.focus();
      sendGa4(set, 'close');
      overlay.removeEventListener('click', onOverlay); root.removeEventListener('keydown', onKey); closes.forEach(c => c.removeEventListener('click', doClose));
    }
    function onKey(ev){ if (ev.key === 'Escape') doClose(); }
    function onOverlay(e){ if (e.target === overlay) doClose(); }

    const closes = root.querySelectorAll('[data-hm-sm-close]');
    closes.forEach(c => c.addEventListener('click', doClose));
    overlay.addEventListener('click', onOverlay);
    root.addEventListener('keydown', onKey);

    sendGa4(set, 'open');
  }

  function setupAutoOpen(set){
    if (!set.auto_open || !set.auto_open.enabled) return;
    if (set.auto_open.after_sec && set.auto_open.after_sec > 0) { setTimeout(()=> openModalForSet(set), Math.floor(set.auto_open.after_sec * 1000)); }
    if (set.auto_open.on_exit) {
      let fired = false;
      document.addEventListener('mouseleave', (e)=>{ if (fired) return; if (e.clientY <= 0) { fired = true; openModalForSet(set); } });
    }
    if (set.auto_open.on_scroll_percent && set.auto_open.on_scroll_percent > 0) {
      let hit = false;
      window.addEventListener('scroll', ()=>{
        if (hit) return;
        const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const winH = window.innerHeight;
        const scrolled = window.scrollY + winH;
        const pct = (scrolled / docH) * 100;
        if (pct >= set.auto_open.on_scroll_percent) { hit = true; openModalForSet(set); }
      }, { passive:true });
    }
  }

  function setupUrlTrigger(set){
    if (!set.url_trigger || !set.url_trigger.enabled) return;
    const key = set.url_trigger.query_key || 'hm_modal';
    const val = getQueryParam(key);
    if (val !== null) {
      if (!set.url_trigger.query_value || set.url_trigger.query_value === '' || set.url_trigger.query_value === val) {
        openModalForSet(set); return;
      }
    }
    const h = (window.location.hash||'').replace(/^#/,'');
    if (set.url_trigger.hash && h === set.url_trigger.hash) { openModalForSet(set); }
  }

  try{
    const sets = Array.isArray(CFG.sets) ? CFG.sets : [];
    const spMax = parseInt(CURRENT.spMax || 767, 10);
    const tabMax = parseInt(CURRENT.tabMax || 1024, 10);
    const zRoot = parseInt(CURRENT.zRoot || 999999, 10);
    const zTrigger = parseInt(CURRENT.zTrigger || 999998, 10);
    const root = document.getElementById('hm-sm-root');
    if (root) { root.style.zIndex = String(zRoot); }

    document.querySelectorAll('[data-hm-sm-index][data-hm-sm-manual]').forEach((el)=>{
      const idx = parseInt(el.getAttribute('data-hm-sm-index'), 10);
      const set = sets[idx]; if (!set) return;
      set._index = idx;
      const mode = getDevice(spMax, tabMax);
      styleAndBindTrigger(el, set, mode, zTrigger);
    });

    sets.forEach((set, idx)=>{
      set._index = idx;
      if (!set || !set.enabled) return;
      if (!matchUrl(set.apply_on_urls || '', CURRENT.url || location.href)) { return; }
      if (!matchPostType(set.post_types || [], CURRENT.postType || '', !!CURRENT.isSingular)) { return; }
      if (!nowWithinSchedule(set.schedule || {})) { return; }
      const mode = getDevice(spMax, tabMax);
      if (set.auto_inject !== false) injectTrigger(set, mode, zTrigger);
      setupAutoOpen(set);
      setupUrlTrigger(set);
    });
  }catch(e){ console.error('[HM Smart Modal] init failed', e); }
})();

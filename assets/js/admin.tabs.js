
// HM Smart Modal – Admin Tabs (non-destructive, no DOM moves)
(function(){
  'use strict';
  if (!document.getElementById('hm-sm-sets')) return;

  function onReady(fn){ if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  // Tab definitions (order fixed)
  const TAB_SPECS = [
    {key:'動作タイプ', test:(t)=>/動作タイプ/.test(t)},
    {key:'トリガーボタン', test:(t)=>/トリガーボタン/.test(t)},
    {key:'モーダル', test:(t)=>/^モーダル$/.test(t)},
    {key:'レイアウト・スケジュール', test:(t)=>/レイアウト\s*[\/・]\s*スケジュール/.test(t)},
    {key:'条件', test:(t)=>/対象URL|対象の投稿タイプ|条件/.test(t)},
    {key:'自動表示', test:(t)=>/自動オープン|自動表示|URLトリガー|動的DOM/.test(t)},
    {key:'GA4', test:(t)=>/GA4/i.test(t)},
  ];

  // Assign a tab key to each .hm-sm-admin__field based on its subhead text (without moving nodes)
  function tagFieldsWithTabKeys(contentEl){
    const fields = Array.from(contentEl.querySelectorAll('.hm-sm-admin__field'));
    let anyTagged = false;
    fields.forEach(f=>{
      const head = f.querySelector(':scope > .hm-sm-admin__subhead');
      const title = head ? head.textContent.trim() : '';
      const spec = TAB_SPECS.find(s => s.test(title));
      const key = spec ? spec.key : null;
      if (key){
        if (f.dataset.hmTabKey !== key){ f.dataset.hmTabKey = key; anyTagged = true; }
      }else{
        // leave untagged; will show in all tabs (rare)
      }
    });
    return anyTagged;
  }

  // Build tab bar once per set
  function ensureTabBar(setEl){
    const content = setEl.querySelector('.hm-sm-admin__content');
    if (!content) return null;
    let bar = content.querySelector(':scope > .hm-sm-admin__tabs');
    if (bar) return bar;

    // Create tab bar
    bar = document.createElement('div');
    bar.className = 'hm-sm-admin__tabs';
    // Insert at top of content
    content.insertBefore(bar, content.firstChild);
    return bar;
  }

  function applyTabVisibility(contentEl, activeKey){
    const fields = Array.from(contentEl.querySelectorAll('.hm-sm-admin__field'));
    fields.forEach(f=>{
      const key = f.dataset.hmTabKey;
      if (!key){ 
        f.classList.remove('hm-sm-admin__section');
        f.style.display = ''; // show everywhere when not classified
        return;
      }
      // card look for classified blocks
      f.classList.add('hm-sm-admin__section');
      f.style.display = (key === activeKey) ? '' : 'none';
    });
  }

  function buildTabsForSet(setEl){
    try{
      const content = setEl.querySelector('.hm-sm-admin__content');
      if (!content) return;
      // tag fields (does not move them)
      tagFieldsWithTabKeys(content);

      // If there are less than 2 distinct keys, skip tab UI
      const keys = Array.from(new Set(Array.from(content.querySelectorAll('.hm-sm-admin__field[data-hm-tab-key]')).map(f=>f.dataset.hmTabKey)));
      if (keys.length < 2) return;

      const bar = ensureTabBar(setEl);
      if (!bar) return;
      if (bar.childElementCount) return; // already built

      // Build buttons that exist for this set, following TAB_SPECS order
      TAB_SPECS.forEach(spec=>{
        if (!keys.includes(spec.key)) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'button button-secondary';
        btn.textContent = spec.key;
        btn.dataset.tab = spec.key;
        bar.appendChild(btn);
        btn.addEventListener('click', ()=>{
          bar.querySelectorAll('.button').forEach(b=>b.classList.remove('is-active'));
          btn.classList.add('is-active');
          applyTabVisibility(content, spec.key);
        });
      });

      // Activate default (動作タイプ) or first
      const defBtn = bar.querySelector('[data-tab="動作タイプ"]') || bar.querySelector('.button');
      if (defBtn) defBtn.click();

      // Also convert radio (modal/link) to mini-switch, but do not move elements
      enhanceTriggerSwitch(setEl);
    }catch(e){ /* swallow to keep admin stable */ }
  }

  function enhanceTriggerSwitch(setEl){
    const wrap = setEl.querySelector('[data-trigger-wrap]');
    if (!wrap || wrap.__hm_switched) return;
    wrap.__hm_switched = true;
    // radios
    const radios = wrap.querySelectorAll('input[type="radio"][name*="[trigger_type]"]');
    if (radios.length < 2) return;
    let radioModal=null, radioLink=null;
    radios.forEach(r=>{ if(r.value==='modal') radioModal=r; if(r.value==='link') radioLink=r; });
    if(!radioModal || !radioLink) return;

    const switcher = document.createElement('div');
    switcher.className='hm-sm-switchtabs';
    const b1=document.createElement('button'); b1.type='button'; b1.className='hm-sm-pill'; b1.textContent='モーダルで表示';
    const b2=document.createElement('button'); b2.type='button'; b2.className='hm-sm-pill'; b2.textContent='ただのリンク';
    switcher.appendChild(b1); switcher.appendChild(b2);
    const sub = wrap.querySelector('.hm-sm-admin__subhead');
    wrap.insertBefore(switcher, sub? sub.nextSibling : wrap.firstChild);

    function sync(){
      const isLink = radioLink.checked;
      b1.classList.toggle('is-active', !isLink);
      b2.classList.toggle('is-active',  isLink);
      wrap.querySelectorAll('[data-only-link]').forEach(n=> n.style.display = isLink?'':'none');
      wrap.querySelectorAll('[data-only-modal]').forEach(n=> n.style.display = isLink?'none':'');
    }
    b1.addEventListener('click', ()=>{ if(!radioModal.checked){ radioModal.checked=true; radioModal.dispatchEvent(new Event('change',{bubbles:true})); } sync(); });
    b2.addEventListener('click', ()=>{ if(!radioLink.checked){ radioLink.checked=true; radioLink.dispatchEvent(new Event('change',{bubbles:true})); } sync(); });
    wrap.querySelectorAll('label>input[type="radio"]').forEach(inp=>{
      const lab = inp.closest('label'); if (lab) lab.classList.add('hm-sm-visually-hidden');
    });
    sync();
  }

  // Debounced observer to avoid loops on save/re-render
  function setupObserver(){
    const root = document.getElementById('hm-sm-sets');
    if (!root) return;
    let queued = false;
    const mo = new MutationObserver(()=>{
      if (queued) return; queued = true;
      setTimeout(()=>{ queued = false; try{
        document.querySelectorAll('.hm-sm-admin__set').forEach(buildTabsForSet);
      }catch(e){} }, 120);
    });
    mo.observe(root, {childList:true, subtree:true});
  }

  onReady(()=>{
    try{
      document.querySelectorAll('.hm-sm-admin__set').forEach(buildTabsForSet);
      setupObserver();
    }catch(e){}
  });

})();

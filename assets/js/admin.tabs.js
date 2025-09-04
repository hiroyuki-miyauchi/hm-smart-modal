
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
    var $wrap = jQuery(setEl).find('[data-trigger-wrap]');
    if(!$wrap.length || $wrap.data('hm-switched')) return;
    $wrap.data('hm-switched', true);
    var $modal = $wrap.find('input[type="radio"][name*="[trigger_type]"][value="modal"]');
    var $link  = $wrap.find('input[type="radio"][name*="[trigger_type]"][value="link"]');
    if(!$modal.length || !$link.length) return;

    var $switch = jQuery('<div class="hm-sm-switchtabs"></div>');
    var $b1 = jQuery('<button type="button" class="hm-sm-pill">モーダルで表示</button>');
    var $b2 = jQuery('<button type="button" class="hm-sm-pill">ただのリンク</button>');
    $switch.append($b1, $b2);
    var $sub = $wrap.children('.hm-sm-admin__subhead').first();
    if($sub.length){ $switch.insertAfter($sub); } else { $wrap.prepend($switch); }

    function sync(){
      var isLink = $link.prop('checked');
      $b1.toggleClass('is-active', !isLink);
      $b2.toggleClass('is-active',  isLink);
      $wrap.find('[data-only-link]').toggle(isLink);
      $wrap.find('[data-only-modal]').toggle(!isLink);
    }
    $b1.on('click', function(){
      if(!$modal.prop('checked')){ $modal.prop('checked', true).trigger('change'); }
      sync();
    });
    $b2.on('click', function(){
      if(!$link.prop('checked')){ $link.prop('checked', true).trigger('change'); }
      sync();
    });
    $wrap.find('label>input[type="radio"]').each(function(){
      jQuery(this).parent('label').addClass('hm-sm-visually-hidden');
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

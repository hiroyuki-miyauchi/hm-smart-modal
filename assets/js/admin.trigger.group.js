
// HM Smart Modal – Grouping inside Trigger Button field (non-moving, show/hide)
(function(){
  'use strict';
  if (!document.getElementById('hm-sm-sets')) return;
  function onReady(fn){ if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  const CATS = [
    {key:'text',     label:'テキスト/サイズ', test:(t)=>/ボタンテキスト|文字サイズ/.test(t)},
    {key:'position', label:'位置',            test:(t)=>/位置/.test(t)},
    {key:'colors',   label:'色',              test:(t)=>/背景|文字色/.test(t)},
    {key:'border',   label:'枠線/角丸',       test:(t)=>/枠線|角丸/.test(t)},
    {key:'hover',    label:'ホバー',          test:(t)=>/ホバー|トランジション/.test(t)},
    {key:'shadow',   label:'影',              test:(t)=>/影/.test(t)},
  ];

  function enhanceField(field){
    if (field.__hm_grouped) return;
    field.__hm_grouped = true;
    const sub = field.querySelector(':scope > .hm-sm-admin__subhead');
    if (!sub) return;
    if (sub.textContent.trim()!=='トリガーボタン（SP/Tablet/PC）') return;

    // tag rows with category (by their first label text)
    const rows = Array.from(field.querySelectorAll(':scope > .hm-sm-admin__two, :scope > .hm-sm-admin__row'));
    rows.forEach(r=>{
      const firstLabel = r.querySelector('label');
      const title = firstLabel ? firstLabel.textContent.trim() : '';
      const cat = CATS.find(c => c.test(title));
      if (cat){ r.dataset.hmSubcat = cat.key; }
    });

    // If tagging resulted in at least 2 categories, build filters
    const foundCats = Array.from(new Set(rows.map(r=>r.dataset.hmSubcat).filter(Boolean)));
    if (foundCats.length < 2) return;

    const bar = document.createElement('div');
    bar.className = 'hm-sm-admin__tabs hm-sm-admin__tabs--mini';
    CATS.forEach(c=>{
      if (!foundCats.includes(c.key)) return;
      const b = document.createElement('button');
      b.type='button'; b.className='button button-secondary'; b.textContent=c.label; b.dataset.subcat=c.key;
      bar.appendChild(b);
      b.addEventListener('click', ()=>{
        bar.querySelectorAll('.button').forEach(x=>x.classList.remove('is-active'));
        b.classList.add('is-active');
        rows.forEach(r=>{
          const k = r.dataset.hmSubcat;
          if (!k) { r.style.display = 'none'; return; } // 未分類は隠す
          r.style.display = (k===c.key)? '' : 'none';
        });
      });
    });
    sub.insertAdjacentElement('afterend', bar);
    // activate first tab
    const first = bar.querySelector('.button');
    if (first) first.click();
  }

  function enhanceAll(){
    document.querySelectorAll('.hm-sm-admin__field').forEach(enhanceField);
  }

  function setupObserver(){
    const root = document.getElementById('hm-sm-sets');
    if (!root) return;
    let queued=false;
    const mo = new MutationObserver(()=>{
      if (queued) return; queued=true;
      setTimeout(()=>{ queued=false; try{ enhanceAll(); }catch(e){} }, 120);
    });
    mo.observe(root, {childList:true, subtree:true});
  }

  onReady(()=>{ try{ enhanceAll(); setupObserver(); }catch(e){} });

})();
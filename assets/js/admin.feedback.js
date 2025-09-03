
// HM Smart Modal – Admin Save Feedback (auto fade-out)
(function(){
  'use strict';
  function onReady(fn){ if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  onReady(function(){
    var el = document.getElementById('hm-sm-save-feedback');
    if (!el) return;
    var timer1=null, timer2=null;
    // Observe text/attr changes to trigger fade-out
    var mo = new MutationObserver(function(){
      var has = (el.textContent||'').trim().length>0;
      if (!has){ return; }
      el.style.display = '';           // show box
      el.classList.remove('is-fade');  // reset opacity
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      timer1 = setTimeout(function(){
        el.classList.add('is-fade');   // start fade
        timer2 = setTimeout(function(){
          el.textContent = '';
          el.classList.remove('hm-sm-admin__save-feedback--ok','hm-sm-admin__save-feedback--ng','hm-sm-admin__save-feedback--progress','is-fade');
          el.style.display = 'none';   // hide the whole bar (緑帯を消す)
        }, 700); // fade duration
      }, 2200); // visible duration
    });
    mo.observe(el, {childList:true, characterData:true, subtree:true, attributes:true});
  });
})();
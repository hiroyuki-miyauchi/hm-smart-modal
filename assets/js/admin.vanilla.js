
/* HM Smart Modal – Admin (Vanilla JS, Tabbed UI)
 * Tabs: 基本 / 表示 / 条件 / 自動表示 / GA4 / 高度
 */
(function(){
  'use strict';
  if (typeof window.HM_SM_ADMIN_DATA === 'undefined') return;
  const D = document, CFG = window.HM_SM_ADMIN_DATA || {};
  const root = D.getElementById('hm-sm-admin'); if (!root) return;
  const $ = (s,c)=> (c||D).querySelector(s);
  const $$ = (s,c)=> Array.from((c||D).querySelectorAll(s));
  const el = (t,a={},h='')=>{ const n=D.createElement(t); for(const k in a){ if(a[k]!=null)n.setAttribute(k,a[k]); } if(h) n.innerHTML=h; return n; };
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

  // contrast helpers
  function hexToRgb(h){h=(h||'').replace('#',''); if(h.length!==6) return [0,0,0]; return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
  function lum(rgb){const a=rgb.map(v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
  function contrast(a,b){const L1=lum(hexToRgb(a)),L2=lum(hexToRgb(b));return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);}

  let settings = CFG.settings || { sets:[], breakpoint_sp_max:767, breakpoint_tab_max:1024, z_index_root:999999, z_index_trigger:999998 };
  if (!Array.isArray(settings.sets)) settings.sets = [];
  const POST_TYPES = CFG.post_types || [];

  // Header
  root.innerHTML = '';
  const header = el('div',{class:'hm-sm-admin__header'},`
    <h1 class="hm-sm-admin__title">HM Smart Modal</h1>
    <div class="hm-sm-admin__actions">
      <button id="hm-sm-add" class="button button-secondary">＋ セットを追加</button>
      <button id="hm-sm-export" class="button">エクスポート</button>
      <label class="button"><input id="hm-sm-import-file" type="file" accept="application/json" style="display:none;">インポート</label>
      <button id="hm-sm-save" class="button button-primary">保存（更新）</button>
    </div>
    <p class="description">バージョン：${CFG.version || '1.0.1'}</p>
  `);
  root.appendChild(header);

  // Global options (breakpoints / z-index)
  const globalBox = el('fieldset',{class:'hm-sm-admin__global'},`
    <legend>グローバル設定</legend>
    <div class="hm-sm-admin__two">
      <label>SP最大幅(px)<input type="number" min="320" max="9999" step="1" data-g="breakpoint_sp_max" value="${settings.breakpoint_sp_max??767}"></label>
      <label>Tablet最大幅(px)<input type="number" min="480" max="9999" step="1" data-g="breakpoint_tab_max" value="${settings.breakpoint_tab_max??1024}"></label>
    </div>
    <div class="hm-sm-admin__two">
      <label>z-index（root）<input type="number" min="1" max="2147483647" step="1" data-g="z_index_root" value="${settings.z_index_root??999999}"></label>
      <label>z-index（trigger）<input type="number" min="1" max="2147483647" step="1" data-g="z_index_trigger" value="${settings.z_index_trigger??999998}"></label>
    </div>
    <p class="description">ブレークポイントは SP ≤ 値 / Tablet ≤ 値 として扱います。</p>
  `);
  root.appendChild(globalBox);
  globalBox.addEventListener('change', (e)=>{
    const t=e.target, k=t.getAttribute('data-g'); if(!k) return;
    settings[k] = (t.type==='number')? Number(t.value): t.value;
  });

  const wrap = el('div',{class:'hm-sm-admin__wrap'}); root.appendChild(wrap);

  function render(){
    wrap.innerHTML='';
    settings.sets.forEach((set, idx)=>{
      // defaults
      set.enabled = !!set.enabled;
      set.trigger_type = set.trigger_type || 'modal';
      set.internal_link_selector = set.internal_link_selector || 'a';
      set.apply_on_urls_mode = set.apply_on_urls_mode || 'list';
      set.auto_open = set.auto_open || {enabled:false, after_sec:'', on_exit:false, on_scroll_percent:''};
      set.modal = set.modal || { size:'md', max_height_px:600, scroll_body:false, anim_type:'fade', anim_sec:.25, anim_ease:'ease', respect_reduced_motion:true, overlay_color:'#000000', overlay_opacity:.5, bottom_close_enabled:true, bottom_close_text:'閉じる', shadow_modal:'lg', shadow_modal_custom:'' };
      set.button = set.button || { text:'応募する', font_size_px:15, bg_color:'#000000', bg_opacity:1, text_color:'#FFFFFF', border_color:'#000000', border_width_px:0, border_opacity:1, radius_value:0, radius_unit:'px', radius_preset:'custom', hover_enabled:true, hover_bg_color:'#000000', hover_bg_opacity:.8, hover_text_color:'#FFFFFF', hover_transition_sec:.4, position_sp:'bottom-center', position_tab:'bottom-center', position_pc:'bottom-center', shape_sp:'rect', shape_tab:'rect', shape_pc:'rect', w_circle_px:50, h_circle_px:50, w_circle_px_tab:50, h_circle_px_tab:50, w_circle_px_pc:50, h_circle_px_pc:50, shadow_trigger:'none', shadow_trigger_custom:'' };
      set.ga4 = set.ga4 || { enabled:false, event_open:'hm_modal_open', event_close:'hm_modal_close', event_link:'hm_modal_link_click', params_json:'' };
      set.schedule = set.schedule || { enabled:false, date_start:'', date_end:'', days:[], time_start:'', time_end:'' };
      set.ab = set.ab || { enabled:false, show_percent:100, group:'' };
      set.post_types = Array.isArray(set.post_types)? set.post_types : [];

      const panel = el('div',{class:'hm-sm-admin__set'});
      panel.innerHTML = `
        <div class="hm-sm-admin__set-header">
          <label><input type="checkbox" data-k="enabled" ${set.enabled?'checked':''}> 有効</label>
          <input type="text" class="widefat" data-k="title" placeholder="セット名（例：応募導線）" value="${set.title||''}">
          <button class="button-link-delete" data-act="remove">削除</button>
        </div>

        <div class="hm-sm-admin__tabs">
          <button class="button button-secondary is-active" data-tab="basic">基本</button>
          <button class="button button-secondary" data-tab="display">表示</button>
          <button class="button button-secondary" data-tab="conditions">条件</button>
          <button class="button button-secondary" data-tab="auto">自動表示</button>
          <button class="button button-secondary" data-tab="ga4">GA4</button>
          <button class="button button-secondary" data-tab="advanced">高度</button>
        </div>

        <div class="hm-sm-admin__tabpanes">

          <!-- 基本 -->
          <section class="hm-sm-admin__tabpane is-active" data-pane="basic">
            <div class="hm-sm-admin__grid">
              <div class="hm-sm-admin__col">
                <label>モード
                  <select data-k="trigger_type">
                    <option value="modal" ${set.trigger_type==='modal'?'selected':''}>モーダル</option>
                    <option value="link" ${set.trigger_type==='link'?'selected':''}>リンク</option>
                  </select>
                </label>
                <label>複製元セレクタ
                  <input type="text" data-k="selector_to_clone" value="${set.selector_to_clone||''}" placeholder="#entry .cta / [data-foo=&quot;bar&quot;]">
                </label>
                <label>内部リンクの対象セレクタ
                  <input type="text" data-k="internal_link_selector" value="${set.internal_link_selector||'a'}">
                </label>
              </div>
              <div class="hm-sm-admin__col" data-link-only style="${set.trigger_type==='link'?'':'display:none'}">
                <label>リンクURL<input type="text" data-k="link_url" value="${set.link_url||''}" placeholder="https:// / #anchor"></label>
                <label><input type="checkbox" data-k="link_new_tab" ${set.link_new_tab?'checked':''}> 新しいタブ</label>
                <label><input type="checkbox" data-k="link_rel_noopener" ${set.link_rel_noopener!==false?'checked':''}> rel="noopener noreferrer"</label>
              </div>
            </div>
          </section>

          <!-- 表示 -->
          <section class="hm-sm-admin__tabpane" data-pane="display">
            <div class="hm-sm-admin__grid">
              <div class="hm-sm-admin__col">
                <h4>ボタン（文言・色・枠）</h4>
                <label>テキスト<input type="text" data-k="button.text" value="${set.button.text}"></label>
                <label>文字サイズ(px)<input type="number" min="10" max="30" step="1" data-k="button.font_size_px" value="${set.button.font_size_px}"></label>
                <label>背景色<input type="text" data-k="button.bg_color" value="${set.button.bg_color}"></label>
                <label>背景 透過(0–1)<input type="number" min="0" max="1" step="0.05" data-k="button.bg_opacity" value="${set.button.bg_opacity}"></label>
                <label>文字色<input type="text" data-k="button.text_color" value="${set.button.text_color}"></label>
                <label>枠線色<input type="text" data-k="button.border_color" value="${set.button.border_color}"></label>
                <label>枠線幅(px)<input type="number" min="0" max="20" step="1" data-k="button.border_width_px" value="${set.button.border_width_px}"></label>
                <label>枠線 透過(0–1)<input type="number" min="0" max="1" step="0.05" data-k="button.border_opacity" value="${set.button.border_opacity}"></label>
                <label>角丸プリセット
                  <select data-k="button.radius_preset">
                    <option value="custom" ${set.button.radius_preset==='custom'?'selected':''}>custom</option>
                    <option value="xs" ${set.button.radius_preset==='xs'?'selected':''}>xs</option>
                    <option value="sm" ${set.button.radius_preset==='sm'?'selected':''}>sm</option>
                    <option value="md" ${set.button.radius_preset==='md'?'selected':''}>md</option>
                    <option value="lg" ${set.button.radius_preset==='lg'?'selected':''}>lg</option>
                    <option value="xl" ${set.button.radius_preset==='xl'?'selected':''}>xl</option>
                  </select>
                </label>
                <div class="hm-sm-admin__two">
                  <label>角丸数値<input type="number" step="1" data-k="button.radius_value" value="${set.button.radius_value}"></label>
                  <label>単位
                    <select data-k="button.radius_unit">
                      <option value="px" ${set.button.radius_unit==='px'?'selected':''}>px</option>
                      <option value="%" ${set.button.radius_unit==='%'?'selected':''}>%</option>
                    </select>
                  </label>
                </div>
                <div class="hm-sm-admin__audit" data-audit="contrast"></div>
              </div>

              <div class="hm-sm-admin__col">
                <h4>配置・形状</h4>
                <label>配置(SP)
                  <select data-k="button.position_sp">
                    ${['bottom-center','right-bottom','left-bottom','right-center','left-center','top-center'].map(v=>`<option value="${v}" ${set.button.position_sp===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <label>配置(Tablet)
                  <select data-k="button.position_tab">
                    ${['bottom-center','right-bottom','left-bottom','right-center','left-center','top-center'].map(v=>`<option value="${v}" ${set.button.position_tab===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <label>配置(PC)
                  <select data-k="button.position_pc">
                    ${['bottom-center','right-bottom','left-bottom','right-center','left-center','top-center'].map(v=>`<option value="${v}" ${set.button.position_pc===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <label>形状(SP)
                  <select data-k="button.shape_sp">
                    ${['rect','circle'].map(v=>`<option value="${v}" ${set.button.shape_sp===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <label>形状(Tablet)
                  <select data-k="button.shape_tab">
                    ${['rect','circle'].map(v=>`<option value="${v}" ${set.button.shape_tab===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <label>形状(PC)
                  <select data-k="button.shape_pc">
                    ${['rect','circle'].map(v=>`<option value="${v}" ${set.button.shape_pc===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <div class="hm-sm-admin__two">
                  <label>円の幅(SP,px)<input type="number" min="24" max="200" step="1" data-k="button.w_circle_px" value="${set.button.w_circle_px}"></label>
                  <label>円の高さ(SP,px)<input type="number" min="24" max="200" step="1" data-k="button.h_circle_px" value="${set.button.h_circle_px}"></label>
                </div>
                <div class="hm-sm-admin__two">
                  <label>円の幅(Tablet,px)<input type="number" min="24" max="200" step="1" data-k="button.w_circle_px_tab" value="${set.button.w_circle_px_tab}"></label>
                  <label>円の高さ(Tablet,px)<input type="number" min="24" max="200" step="1" data-k="button.h_circle_px_tab" value="${set.button.h_circle_px_tab}"></label>
                </div>
                <div class="hm-sm-admin__two">
                  <label>円の幅(PC,px)<input type="number" min="24" max="200" step="1" data-k="button.w_circle_px_pc" value="${set.button.w_circle_px_pc}"></label>
                  <label>円の高さ(PC,px)<input type="number" min="24" max="200" step="1" data-k="button.h_circle_px_pc" value="${set.button.h_circle_px_pc}"></label>
                </div>
                <label>トリガー影
                  <select data-k="button.shadow_trigger">
                    ${['none','sm','md','lg','xl','custom'].map(v=>`<option value="${v}" ${set.button.shadow_trigger===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <label>影（カスタムCSS値）<input type="text" data-k="button.shadow_trigger_custom" value="${set.button.shadow_trigger_custom||''}"></label>
              </div>

              <div class="hm-sm-admin__col">
                <h4>ホバー</h4>
                <label><input type="checkbox" data-k="button.hover_enabled" ${set.button.hover_enabled?'checked':''}> 有効</label>
                <label>背景色（hover）<input type="text" data-k="button.hover_bg_color" value="${set.button.hover_bg_color}"></label>
                <label>背景 透過（hover,0–1）<input type="number" min="0" max="1" step="0.05" data-k="button.hover_bg_opacity" value="${set.button.hover_bg_opacity}"></label>
                <label>文字色（hover）<input type="text" data-k="button.hover_text_color" value="${set.button.hover_text_color}"></label>
                <label>トランジション秒（hover）<input type="number" min="0" max="5" step="0.1" data-k="button.hover_transition_sec" value="${set.button.hover_transition_sec}"></label>
              </div>

              <div class="hm-sm-admin__col">
                <h4>モーダル</h4>
                <label>サイズ
                  <select data-k="modal.size">
                    ${['sm','md','lg'].map(v=>`<option value="${v}" ${set.modal.size===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <label>最大高さ(px)<input type="number" min="200" max="1600" step="10" data-k="modal.max_height_px" value="${set.modal.max_height_px}"></label>
                <label><input type="checkbox" data-k="modal.scroll_body" ${set.modal.scroll_body?'checked':''}> 本文スクロール</label>
                <label>アニメ種類
                  <select data-k="modal.anim_type">
                    ${['fade','zoom','slide-up'].map(v=>`<option value="${v}" ${set.modal.anim_type===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <div class="hm-sm-admin__two">
                  <label>アニメ秒数<input type="number" min="0" max="3" step="0.05" data-k="modal.anim_sec" value="${set.modal.anim_sec}"></label>
                  <label>イージング<input type="text" data-k="modal.anim_ease" value="${set.modal.anim_ease}"></label>
                </div>
                <label><input type="checkbox" data-k="modal.respect_reduced_motion" ${set.modal.respect_reduced_motion!==false?'checked':''}> reduced-motion を尊重</label>
                <div class="hm-sm-admin__two">
                  <label>背景色<input type="text" data-k="modal.overlay_color" value="${set.modal.overlay_color}"></label>
                  <label>背景 透過(0–1)<input type="number" min="0" max="1" step="0.05" data-k="modal.overlay_opacity" value="${set.modal.overlay_opacity}"></label>
                </div>
                <label>モーダル影
                  <select data-k="modal.shadow_modal">
                    ${['none','sm','md','lg','xl','custom'].map(v=>`<option value="${v}" ${set.modal.shadow_modal===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <label>影（カスタムCSS値）<input type="text" data-k="modal.shadow_modal_custom" value="${set.modal.shadow_modal_custom||''}"></label>
                <div class="hm-sm-admin__two">
                  <label><input type="checkbox" data-k="modal.bottom_close_enabled" ${set.modal.bottom_close_enabled?'checked':''}> 下部に閉じるボタン</label>
                  <label>閉じる文言<input type="text" data-k="modal.bottom_close_text" value="${set.modal.bottom_close_text||'閉じる'}"></label>
                </div>
              </div>
            </div>
          </section>

          <!-- 条件 -->
          <section class="hm-sm-admin__tabpane" data-pane="conditions">
            <div class="hm-sm-admin__grid">
              <div class="hm-sm-admin__col">
                <h4>URL条件</h4>
                <label><input type="checkbox" data-k="apply_on_urls_enabled" ${set.apply_on_urls_enabled?'checked':''}> URL指定ON</label>
                <label>マッチ方式
                  <select data-k="apply_on_urls_mode">
                    ${['list','prefix','regex'].map(v=>`<option value="${v}" ${set.apply_on_urls_mode===v?'selected':''}>${v}</option>`).join('')}
                  </select>
                </label>
                <textarea data-k="apply_on_urls" rows="5" placeholder="/entry/*&#10;!/entry/thanks">${set.apply_on_urls||''}</textarea>
                <p class="description">空行無視、先頭「!」で除外、「*」は任意文字列。</p>
              </div>
              <div class="hm-sm-admin__col">
                <h4>投稿タイプ</h4>
                <div class="hm-sm-admin__checkgrid">
                  ${POST_TYPES.map(pt=>`<label><input type="checkbox" data-k="post_types" value="${pt}" ${set.post_types.includes(pt)?'checked':''}> ${pt}</label>`).join('')}
                </div>
              </div>
              <div class="hm-sm-admin__col">
                <h4>スケジュール</h4>
                <label><input type="checkbox" data-k="schedule.enabled" ${set.schedule.enabled?'checked':''}> 有効</label>
                <div class="hm-sm-admin__two">
                  <label>開始日<input type="date" data-k="schedule.date_start" value="${set.schedule.date_start||''}"></label>
                  <label>終了日<input type="date" data-k="schedule.date_end" value="${set.schedule.date_end||''}"></label>
                </div>
                <label>曜日（0=日〜6=土）<input type="text" data-k="schedule.days" value="${Array.isArray(set.schedule.days)? set.schedule.days.join(',') : ''}" placeholder="例：1,2,3"></label>
                <div class="hm-sm-admin__two">
                  <label>開始時刻(HH:MM)<input type="time" data-k="schedule.time_start" value="${set.schedule.time_start||''}"></label>
                  <label>終了時刻(HH:MM)<input type="time" data-k="schedule.time_end" value="${set.schedule.time_end||''}"></label>
                </div>
              </div>
              <div class="hm-sm-admin__col">
                <h4>A/Bテスト</h4>
                <label><input type="checkbox" data-k="ab.enabled" ${set.ab.enabled?'checked':''}> 有効</label>
                <label>表示割合(%)<input type="number" min="0" max="100" step="1" data-k="ab.show_percent" value="${set.ab.show_percent}"></label>
                <label>グループ名（任意）<input type="text" data-k="ab.group" value="${set.ab.group||''}"></label>
              </div>
            </div>
          </section>

          <!-- 自動表示 -->
          <section class="hm-sm-admin__tabpane" data-pane="auto">
            <div class="hm-sm-admin__grid">
              <div class="hm-sm-admin__col">
                <label><input type="checkbox" data-k="auto_open.enabled" ${set.auto_open.enabled?'checked':''}> 有効</label>
                <label>秒後に自動オープン<input type="number" min="0" max="600" step="0.1" data-k="auto_open.after_sec" value="${set.auto_open.after_sec||''}"></label>
                <label><input type="checkbox" data-k="auto_open.on_exit" ${set.auto_open.on_exit?'checked':''}> 離脱意図時（Exit Intent）</label>
                <label>スクロール%でオープン<input type="number" min="0" max="100" step="1" data-k="auto_open.on_scroll_percent" value="${set.auto_open.on_scroll_percent||''}"></label>
              </div>
            </div>
          </section>

          <!-- GA4 -->
          <section class="hm-sm-admin__tabpane" data-pane="ga4">
            <div class="hm-sm-admin__grid">
              <div class="hm-sm-admin__col">
                <label><input type="checkbox" data-k="ga4.enabled" ${set.ga4.enabled?'checked':''}> GA4イベント送信</label>
                <label>openイベント名<input type="text" data-k="ga4.event_open" value="${set.ga4.event_open}"></label>
                <label>closeイベント名<input type="text" data-k="ga4.event_close" value="${set.ga4.event_close}"></label>
                <label>linkイベント名<input type="text" data-k="ga4.event_link" value="${set.ga4.event_link}"></label>
                <label>追加params(JSON)<textarea data-k="ga4.params_json" rows="3">${set.ga4.params_json||''}</textarea></label>
              </div>
            </div>
          </section>

          <!-- 高度 -->
          <section class="hm-sm-admin__tabpane" data-pane="advanced">
            <div class="hm-sm-admin__grid">
              <div class="hm-sm-admin__col">
                <label>カスタムCSS<textarea data-k="custom_css" rows="6">${set.custom_css||''}</textarea></label>
                <label>メモ<textarea data-k="memo" rows="3">${set.memo||''}</textarea></label>
              </div>
            </div>
          </section>

        </div>
      `;

      // Tab switch
      panel.querySelector('.hm-sm-admin__tabs').addEventListener('click',(e)=>{
        const btn = e.target.closest('[data-tab]'); if(!btn) return;
        $$('.hm-sm-admin__tabs .button', panel).forEach(b=>b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const name = btn.getAttribute('data-tab');
        $$('.hm-sm-admin__tabpane', panel).forEach(p=> p.classList.toggle('is-active', p.getAttribute('data-pane')===name));
      });

      // Change handler for all fields
      panel.addEventListener('change', (ev)=>{
        const t=ev.target;
        // post_types multi
        if (t.getAttribute('data-k')==='post_types'){
          const val = t.value;
          const arr = new Set(settings.sets[idx].post_types);
          if (t.checked) arr.add(val); else arr.delete(val);
          settings.sets[idx].post_types = Array.from(arr);
          return;
        }
        // schedule days array
        if (t.getAttribute('data-k')==='schedule.days'){
          const list = String(t.value||'').split(',').map(s=>s.trim()).filter(s=>s!=='').map(s=>parseInt(s,10)).filter(n=>!isNaN(n));
          settings.sets[idx].schedule.days = list;
          return;
        }
        // generic path write
        if (!t.matches('[data-k]')) return;
        const path = t.getAttribute('data-k').split('.');
        let ref = settings.sets[idx]; for (let i=0;i<path.length-1;i++){ const k=path[i]; if(typeof ref[k]!=='object'||!ref[k]) ref[k]={}; ref=ref[k]; }
        const last = path[path.length-1];
        const val = (t.type==='checkbox')? t.checked : (t.type==='number'? Number(t.value): t.value);
        ref[last] = val;

        if (t.getAttribute('data-k').startsWith('button.')){
          // live contrast audit
          const msg = panel.querySelector('[data-audit="contrast"]');
          if (msg){
            const bg = settings.sets[idx].button.bg_color;
            const fg = settings.sets[idx].button.text_color;
            const r = contrast(bg, fg);
            msg.textContent = (r<4.5)?`⚠ コントラスト不足（${r.toFixed(2)}）`:`OK コントラスト ${r.toFixed(2)}`;
          }
        }
        if (t.getAttribute('data-k')==='trigger_type'){
          const isLink = t.value==='link';
          const box = panel.querySelector('[data-link-only]');
          if (box) box.style.display = isLink?'block':'none';
        }
      });

      // Remove
      panel.addEventListener('click', (ev)=>{
        if (ev.target.matches('[data-act="remove"]')){
          ev.preventDefault(); settings.sets.splice(idx,1); render();
        }
      });

      wrap.appendChild(panel);

      // Initial audits
      const msg = panel.querySelector('[data-audit="contrast"]');
      if (msg){
        const r = contrast(set.button.bg_color, set.button.text_color);
        msg.textContent = (r<4.5)?`⚠ コントラスト不足（${r.toFixed(2)}）`:`OK コントラスト ${r.toFixed(2)}`;
      }
    });
  }

  // Top actions
  $('#hm-sm-add').addEventListener('click', ()=>{
    settings.sets.push({ enabled:true });
    render();
  });
  $('#hm-sm-export').addEventListener('click', ()=>{
    const payload = settings; payload.version = CFG.version || '1.0.1'; payload.exported_at = new Date().toISOString();
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob); const a=D.createElement('a'); a.href=url; a.download='hm-smart-modal-settings.json'; a.click(); URL.revokeObjectURL(url);
  });
  $('#hm-sm-import-file').addEventListener('change', (e)=>{
    const f=e.target.files[0]; if(!f) return; const fr=new FileReader();
    fr.onload=()=>{ try{ const j=JSON.parse(fr.result); if(j&&j.sets){ settings=j; render(); } }catch(err){ alert('JSONの読み込みに失敗しました'); } };
    fr.readAsText(f,'utf-8');
  });
  $('#hm-sm-save').addEventListener('click', ()=>{
    const form=D.createElement('form'); form.method='post';
    form.innerHTML='<input type="hidden" name="hm_sm_settings_json" value="'+encodeURIComponent(JSON.stringify(settings))+'">';
    D.body.appendChild(form); form.submit();
  });

  render();
})();
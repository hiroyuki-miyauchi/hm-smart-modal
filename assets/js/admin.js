// Admin JS (wp-admin only) with accordion & visibility control
function hmSmRenderSet(set, idx) {
  const isOpen = (window.hmSmOpen && window.hmSmOpen.has(idx)) || (window.hmSmForceOpenIndex === idx);
  const enabled = !!set.enabled;
  const badgeClass = enabled ? 'hm-sm-admin__badge hm-sm-admin__badge--on' : 'hm-sm-admin__badge hm-sm-admin__badge--off';
  const badgeText = enabled ? HM_SM_ADMIN_DATA.texts.enabled : HM_SM_ADMIN_DATA.texts.disabled;

  const el = jQuery(`
    <div class="hm-sm-admin__set ${isOpen ? 'is-open' : ''}" data-index="${idx}">
      <div class="hm-sm-admin__set-header" data-accordion="toggle">
        <div class="hm-sm-admin__left">
          <div class="hm-sm-admin__toggle" aria-label="${HM_SM_ADMIN_DATA.texts.toggle}">${isOpen ? '−' : '+'}</div>
          <input type="text" class="widefat hm-sm-admin__set-titleinput" name="sets[${idx}][title]" value="${set.title || ''}" placeholder="例：応募導線（記事下コンテンツをモーダル表示）">
        </div>
        <div class="hm-sm-admin__status">
          <span class="${badgeClass}" data-status-badge>${badgeText}</span>
        </div>
      </div>

      <div class="hm-sm-admin__content">
        <div class="hm-sm-admin__row">
          <label><input type="checkbox" name="sets[${idx}][enabled]" ${enabled ? 'checked' : ''}> このセットを有効にする</label>
          <label style="margin-left:16px"><input type="checkbox" name="sets[${idx}][auto_inject]" ${set.auto_inject !== false ? 'checked' : ''}> 自動でトリガーを固定配置する</label>
        </div>
        <div class="hm-sm-admin__row">
          <label>メモ（エクスポートに含まれます）</label>
        </div>
        <textarea class="widefat" rows="2" name="sets[${idx}][memo]">${set.memo || ''}</textarea>

        <div class="hm-sm-admin__hr"></div>

        <div class="hm-sm-admin__grid">
          <div class="hm-sm-admin__field">
            <div class="hm-sm-admin__subhead">対象URL</div>
            <label><input type="checkbox" name="sets[${idx}][apply_on_urls_enabled]" ${set.apply_on_urls_enabled ? 'checked' : ''}> URLでページを指定する</label>
            <textarea class="widefat" rows="3" name="sets[${idx}][apply_on_urls]" placeholder="1行に1つ、含まれていればOKの部分文字列">${set.apply_on_urls || ''}</textarea>
            <p class="hm-sm-admin__help">例：<code>/campaign/</code> と書くとURLにこの文字が含まれるページで動きます。複数行OK。</p>
          </div>

          <div class="hm-sm-admin__field">
            <div class="hm-sm-admin__subhead">対象の投稿タイプ</div>
            <div class="hm-sm-admin__row">
              ${(HM_SM_ADMIN_DATA.postTypes || []).map(pt => {
                const on = (set.post_types || []).includes(pt.name) ? 'checked' : '';
                return `<label style="margin-right:12px"><input type="checkbox" name="sets[${idx}][post_types][]" value="${pt.name}" ${on}> ${pt.label}</label>`;
              }).join('')}
            </div>
            <p class="hm-sm-admin__help">チェックした投稿タイプのページで動きます。</p>
          </div>
        </div>

        <div class="hm-sm-admin__field" data-trigger-wrap>
          <div class="hm-sm-admin__subhead">動作タイプ</div>
          <label><input type="radio" name="sets[${idx}][trigger_type]" value="modal" ${set.trigger_type === 'link' ? '' : 'checked'}> モーダルで表示</label>
          <label style="margin-left:16px"><input type="radio" name="sets[${idx}][trigger_type]" value="link" ${set.trigger_type === 'link' ? 'checked' : ''}> ただのリンク</label>

          <div class="hm-sm-admin__two" style="margin-top:8px">
            <div data-only-link>
              <label>リンクURL（trigger=linkの時）</label>
              <input type="url" class="widefat" name="sets[${idx}][link_url]" value="${set.link_url || '#'}" placeholder="例：https://example.com/">
              <div class="hm-sm-admin__row">
                <label><input type="checkbox" name="sets[${idx}][link_new_tab]" ${set.link_new_tab ? 'checked' : ''}> 別タブで開く</label>
                <label style="margin-left:16px"><input type="checkbox" name="sets[${idx}][link_rel_noopener]" ${set.link_rel_noopener !== false ? 'checked' : ''}> rel="noopener noreferrer"を付ける（推奨）</label>
              </div>
              <p class="hm-sm-admin__help">「ただのリンク」を選んだ時だけ有効です。</p>
            </div>
            <div data-only-modal>
              <label>複製元セレクタ（trigger=modalの時）</label>
              <input type="text" class="widefat" name="sets[${idx}][selector_to_clone]" value="${set.selector_to_clone || ''}" placeholder="例：.entry-content .cta, [data-foo='bar']">
              <p class="hm-sm-admin__help">ページ内からこのセレクタに合う要素を見つけて、その中身をモーダルへ複製します。</p>
            </div>
          </div>

          <div class="hm-sm-admin__row">
            <label>モーダル内のボタンにしたい要素のセレクタ</label>
          </div>
          <input type="text" class="widefat" name="sets[${idx}][internal_link_selector]" value="${set.internal_link_selector || 'a'}" placeholder="例：.entry-content a.btn, a[href*='apply']">
          <p class="hm-sm-admin__help">一致する要素をボタン風に整えます。未入力なら<a>タグが対象。</p>

          <div class="hm-sm-admin__row">
            <label>カスタムCSS</label>
          </div>
          <textarea class="widefat" rows="3" name="sets[${idx}][custom_css]">${set.custom_css || ''}</textarea>
        </div>

        <div class="hm-sm-admin__field">
          <div class="hm-sm-admin__subhead">トリガーボタン（SP/Tablet/PC）</div>
          <div class="hm-sm-admin__two">
            <div><label>ボタンテキスト</label><input type="text" class="widefat" name="sets[${idx}][button][text]" value="${set.button?.text || '応募する'}"></div>
            <div><label>文字サイズ(SP,px)</label><input type="number" min="1" max="30" step="1" name="sets[${idx}][button][font_size_px]" value="${set.button?.font_size_px ?? 15}"></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>文字サイズ(Tablet,px)</label><input type="number" min="1" max="30" step="1" name="sets[${idx}][button][font_size_px_tab]" value="${set.button?.font_size_px_tab ?? set.button?.font_size_px ?? 15}"></div>
            <div><label>文字サイズ(PC,px)</label><input type="number" min="1" max="30" step="1" name="sets[${idx}][button][font_size_px_pc]" value="${set.button?.font_size_px_pc ?? set.button?.font_size_px ?? 15}"></div>
          </div>

          <div class="hm-sm-admin__two">
            <div>
              <label>SP位置</label>
              <select name="sets[${idx}][button][position_sp]">
                ${['right-center','left-center','right-bottom','top-center','bottom-center','left-bottom'].map(v => {
                  const sel = (set.button?.position_sp || 'bottom-center') === v ? 'selected' : '';
                  return `<option value="${v}" ${sel}>${v}</option>`;
                }).join('')}
              </select>
            </div>
            <div>
              <label>Tablet位置</label>
              <select name="sets[${idx}][button][position_tab]">
                ${['right-center','left-center','right-bottom','top-center','bottom-center','left-bottom'].map(v => {
                  const sel = (set.button?.position_tab || 'bottom-center') === v ? 'selected' : '';
                  return `<option value="${v}" ${sel}>${v}</option>`;
                }).join('')}
              </select>
            </div>
          </div>
          <div class="hm-sm-admin__two">
            <div>
              <label>PC位置</label>
              <select name="sets[${idx}][button][position_pc]">
                ${['right-center','left-center','right-bottom','top-center','bottom-center','left-bottom'].map(v => {
                  const sel = (set.button?.position_pc || 'bottom-center') === v ? 'selected' : '';
                  return `<option value="${v}" ${sel}>${v}</option>`;
                }).join('')}
              </select>
            </div>
            <div>
              <label>角丸プリセット</label>
              <select name="sets[${idx}][button][radius_preset]">
                ${['custom','none','sm','md','lg','full'].map(v => {
                  const sel = (set.button?.radius_preset || 'custom') === v ? 'selected' : '';
                  return `<option value="${v}" ${sel}>${v}</option>`;
                }).join('')}
              </select>
            </div>
          </div>

          <div class="hm-sm-admin__two">
            <div><label>角丸 値</label><input type="number" min="0" max="200" step="1" name="sets[${idx}][button][radius_value]" value="${set.button?.radius_value ?? 0}"></div>
            <div><label>角丸 単位</label><select name="sets[${idx}][button][radius_unit]">
              ${['px','%'].map(u => `<option value="${u}" ${(set.button?.radius_unit||'px')===u?'selected':''}>${u}</option>`).join('')}
            </select></div>
          </div>

          <div class="hm-sm-admin__two">
            <div><label>形状(SP)</label><select name="sets[${idx}][button][shape_sp]">${['rect','circle'].map(v => `<option value="${v}" ${(set.button?.shape_sp||'rect')===v?'selected':''}>${v}</option>`).join('')}</select></div>
            <div><label>形状(Tablet)</label><select name="sets[${idx}][button][shape_tab]">${['rect','circle'].map(v => `<option value="${v}" ${(set.button?.shape_tab||'rect')===v?'selected':''}>${v}</option>`).join('')}</select></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>形状(PC)</label><select name="sets[${idx}][button][shape_pc]">${['rect','circle'].map(v => `<option value="${v}" ${(set.button?.shape_pc||'rect')===v?'selected':''}>${v}</option>`).join('')}</select></div>
            <div><label>影(Trigger)</label><select name="sets[${idx}][button][shadow_trigger]">${['none','sm','md','lg','xl','custom'].map(v => `<option value="${v}" ${(set.button?.shadow_trigger||'none')===v?'selected':''}>${v}</option>`).join('')}</select></div>
          </div>

          <div class="hm-sm-admin__two">
            <div><label>円の幅(SP,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][w_circle_px]" value="${set.button?.w_circle_px ?? 50}"></div>
            <div><label>円の高さ(SP,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][h_circle_px]" value="${set.button?.h_circle_px ?? 50}"></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>円の幅(Tablet,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][w_circle_px_tab]" value="${set.button?.w_circle_px_tab ?? set.button?.w_circle_px ?? 50}"></div>
            <div><label>円の高さ(Tablet,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][h_circle_px_tab]" value="${set.button?.h_circle_px_tab ?? set.button?.h_circle_px ?? 50}"></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>円の幅(PC,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][w_circle_px_pc]" value="${set.button?.w_circle_px_pc ?? set.button?.w_circle_px ?? 50}"></div>
            <div><label>円の高さ(PC,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][h_circle_px_pc]" value="${set.button?.h_circle_px_pc ?? set.button?.h_circle_px ?? 50}"></div>
          </div>

          <div class="hm-sm-admin__two">
            <div><label>背景色</label><input type="text" class="hm-sm-color" name="sets[${idx}][button][bg_color]" value="${set.button?.bg_color || '#000000'}"></div>
            <div><label>背景 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][button][bg_opacity]" value="${set.button?.bg_opacity ?? 1.0}"></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>文字色</label><input type="text" class="hm-sm-color" name="sets[${idx}][button][text_color]" value="${set.button?.text_color || '#FFFFFF'}"></div>
            <div><label>枠線色</label><input type="text" class="hm-sm-color" name="sets[${idx}][button][border_color]" value="${set.button?.border_color || '#000000'}"></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>枠線幅(px)</label><input type="number" min="0" max="20" step="1" name="sets[${idx}][button][border_width_px]" value="${set.button?.border_width_px ?? 0}"></div>
            <div><label>枠線 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][button][border_opacity]" value="${set.button?.border_opacity ?? 1.0}"></div>
          </div>

          <div class="hm-sm-admin__two">
            <div><label>ホバー背景</label><input type="text" class="hm-sm-color" name="sets[${idx}][button][hover_bg_color]" value="${set.button?.hover_bg_color || '#000000'}"></div>
            <div><label>ホバー 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][button][hover_bg_opacity]" value="${set.button?.hover_bg_opacity ?? 0.8}"></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>ホバー文字色</label><input type="text" class="hm-sm-color" name="sets[${idx}][button][hover_text_color]" value="${set.button?.hover_text_color || '#FFFFFF'}"></div>
            <div><label>トランジション秒数</label><input type="number" min="0" max="5" step="0.1" name="sets[${idx}][button][hover_transition_sec]" value="${set.button?.hover_transition_sec ?? 0.4}"></div>
          </div>
          <div class="hm-sm-admin__row">
            <label>Trigger影（custom時は自由入力）</label>
            <input type="text" class="widefat" name="sets[${idx}][button][shadow_trigger_custom]" value="${set.button?.shadow_trigger_custom || ''}" placeholder="例：0 10px 30px rgba(0,0,0,.2)">
          </div>
        </div>

        <div class="hm-sm-admin__field">
          <div class="hm-sm-admin__subhead">モーダル</div>
          <div class="hm-sm-admin__two">
            <div><label>サイズ</label><select name="sets[${idx}][modal][size]">${['sm','md','lg'].map(v => `<option value="${v}" ${(set.modal?.size||'md')===v?'selected':''}>${v}</option>`).join('')}</select></div>
            <div><label>最大高さ(px)</label><input type="number" min="200" max="2000" step="10" name="sets[${idx}][modal][max_height_px]" value="${set.modal?.max_height_px ?? 600}"></div>
          </div>

          <div class="hm-sm-admin__two">
            <div><label>アニメーション</label><select name="sets[${idx}][modal][anim_type]">${['fade','zoom','slide-up'].map(v => `<option value="${v}" ${(set.modal?.anim_type||'fade')===v?'selected':''}>${v}</option>`).join('')}</select></div>
            <div><label>アニメ秒数</label><input type="number" min="0" max="3" step="0.05" name="sets[${idx}][modal][anim_sec]" value="${set.modal?.anim_sec ?? 0.25}"></div>
          </div>
          <div class="hm-sm-admin__row">
            <label>イージング</label>
            <input type="text" class="widefat" name="sets[${idx}][modal][anim_ease]" value="${set.modal?.anim_ease || 'ease'}" placeholder="例：ease / ease-out / cubic-bezier(0.4,0,0.2,1)">
            <p class="hm-sm-admin__help">アニメの動き方。未入力なら ease。</p>
          </div>

          <div class="hm-sm-admin__row">
            <label><input type="checkbox" name="sets[${idx}][modal][scroll_body]" ${set.modal?.scroll_body ? 'checked' : ''}> 本文だけスクロールにする</label>
            <label style="margin-left:16px"><input type="checkbox" name="sets[${idx}][modal][respect_reduced_motion]" ${set.modal?.respect_reduced_motion !== false ? 'checked' : ''}> reduced-motion を尊重</label>
          </div>

          <div class="hm-sm-admin__two">
            <div><label>背景(オーバーレイ)色</label><input type="text" class="hm-sm-color" name="sets[${idx}][modal][overlay_color]" value="${set.modal?.overlay_color || '#000000'}"></div>
            <div><label>背景 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][modal][overlay_opacity]" value="${set.modal?.overlay_opacity ?? 0.5}"></div>
          </div>

          <div class="hm-sm-admin__two">
            <div><label><input type="checkbox" name="sets[${idx}][modal][bottom_close_enabled]" ${set.modal?.bottom_close_enabled ? 'checked' : ''}> 下部に「閉じる」ボタンを表示</label></div>
            <div><label>閉じるボタン文言</label><input type="text" class="widefat" name="sets[${idx}][modal][bottom_close_text]" value="${set.modal?.bottom_close_text || '閉じる'}"></div>
          </div>

          <div class="hm-sm-admin__two">
            <div><label>影(Modal)</label><select name="sets[${idx}][modal][shadow_modal]">${['none','sm','md','lg','xl','custom'].map(v => `<option value="${v}" ${(set.modal?.shadow_modal||'lg')===v?'selected':''}>${v}</option>`).join('')}</select></div>
            <div><label>影(Modal, custom)</label><input type="text" class="widefat" name="sets[${idx}][modal][shadow_modal_custom]" value="${set.modal?.shadow_modal_custom || ''}" placeholder="例：0 20px 50px rgba(0,0,0,.3)"></div>
          </div>
        </div>

        <div class="hm-sm-admin__field">
          <div class="hm-sm-admin__subhead">GA4イベント</div>
          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][ga4][enabled]" ${set.ga4?.enabled ? 'checked' : ''}> GA4に送信</label></div>
          <div class="hm-sm-admin__two">
            <div><label>openイベント名</label><input type="text" class="widefat" name="sets[${idx}][ga4][event_open]" value="${set.ga4?.event_open || 'hm_modal_open'}"></div>
            <div><label>closeイベント名</label><input type="text" class="widefat" name="sets[${idx}][ga4][event_close]" value="${set.ga4?.event_close || 'hm_modal_close'}"></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>linkイベント名</label><input type="text" class="widefat" name="sets[${idx}][ga4][event_link]" value="${set.ga4?.event_link || 'hm_modal_link_click'}"></div>
            <div><label>追加パラメータ(JSON)</label><input type="text" class="widefat" name="sets[${idx}][ga4][params_json]" value="${set.ga4?.params_json || ''}" placeholder='{"foo":"bar"}'></div>
          </div>
        </div>

        <div class="hm-sm-admin__field">
          <div class="hm-sm-admin__subhead">自動オープン / URLトリガー / 動的DOM</div>
          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][auto_open][enabled]" ${set.auto_open?.enabled ? 'checked' : ''}> 自動オープンを有効化</label></div>
          <div class="hm-sm-admin__two">
            <div><label>読み込み後 秒</label><input type="number" min="0" max="120" step="0.1" name="sets[${idx}][auto_open][after_sec]" value="${set.auto_open?.after_sec ?? 0}"></div>
            <div><label>スクロール %</label><input type="number" min="0" max="100" step="1" name="sets[${idx}][auto_open][on_scroll_percent]" value="${set.auto_open?.on_scroll_percent ?? 0}"></div>
          </div>
          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][auto_open][on_exit]" ${set.auto_open?.on_exit ? 'checked' : ''}> 離脱意図（Exit Intent）</label></div>

          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][url_trigger][enabled]" ${set.url_trigger?.enabled ? 'checked' : ''}> URLで開く</label></div>
          <div class="hm-sm-admin__two">
            <div><label>クエリキー</label><input type="text" class="widefat" name="sets[${idx}][url_trigger][query_key]" value="${set.url_trigger?.query_key || 'hm_modal'}" placeholder="hm_modal"></div>
            <div><label>クエリ値(任意)</label><input type="text" class="widefat" name="sets[${idx}][url_trigger][query_value]" value="${set.url_trigger?.query_value || ''}" placeholder="例：open"></div>
          </div>
          <div class="hm-sm-admin__row">
            <label>ハッシュ(#)</label><input type="text" class="widefat" name="sets[${idx}][url_trigger][hash]" value="${set.url_trigger?.hash || ''}" placeholder="例：hm-modal">
          </div>

          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][dynamic_dom][watch]" ${set.dynamic_dom?.watch ? 'checked' : ''}> 遅延DOMを監視してターゲットを待機</label></div>
          <div class="hm-sm-admin__row"><label>監視タイムアウト(ms)</label><input type="number" min="0" max="10000" step="100" name="sets[${idx}][dynamic_dom][timeout_ms]" value="${set.dynamic_dom?.timeout_ms ?? 3000}"></div>
        </div>

        <div class="hm-sm-admin__field">
          <div class="hm-sm-admin__subhead">レイアウト / スケジュール</div>
          <div class="hm-sm-admin__two">
            <div><label>PC列数</label><input type="number" min="1" max="6" step="1" name="sets[${idx}][layout][pc_cols]" value="${set.layout?.pc_cols ?? 3}"></div>
            <div><label>Tablet列数</label><input type="number" min="1" max="6" step="1" name="sets[${idx}][layout][tab_cols]" value="${set.layout?.tab_cols ?? 2}"></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>SP列数</label><input type="number" min="1" max="6" step="1" name="sets[${idx}][layout][sp_cols]" value="${set.layout?.sp_cols ?? 1}"></div>
            <div><label>列間隔(px)</label><input type="number" min="0" max="60" step="1" name="sets[${idx}][layout][gap_px]" value="${set.layout?.gap_px ?? 15}"></div>
          </div>

          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][schedule][enabled]" ${set.schedule?.enabled ? 'checked' : ''}> スケジュールを有効化</label></div>
          <div class="hm-sm-admin__two">
            <div><label>開始日(YYYY-MM-DD)</label><input type="text" class="widefat" name="sets[${idx}][schedule][date_start]" value="${set.schedule?.date_start || ''}"></div>
            <div><label>終了日(YYYY-MM-DD)</label><input type="text" class="widefat" name="sets[${idx}][schedule][date_end]" value="${set.schedule?.date_end || ''}"></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>開始時刻(HH:MM)</label><input type="text" class="widefat" name="sets[${idx}][schedule][time_start]" value="${set.schedule?.time_start || ''}" placeholder="09:00"></div>
            <div><label>終了時刻(HH:MM)</label><input type="text" class="widefat" name="sets[${idx}][schedule][time_end]" value="${set.schedule?.time_end || ''}" placeholder="18:00"></div>
          </div>
          <div class="hm-sm-admin__row">
            <label>曜日</label>
            ${[0,1,2,3,4,5,6].map(d => {
              const on = (set.schedule?.days||[]).includes(d) ? 'checked' : '';
              const labels = ['日','月','火','水','木','金','土'];
              return `<label style="margin-right:12px"><input type="checkbox" name="sets[${idx}][schedule][days][]" value="${d}" ${on}> ${labels[d]}</label>`;
            }).join('')}
          </div>
        </div>

        <div class="hm-sm-admin__actions">
          <button type="button" class="button hm-sm-admin__remove" data-remove="${idx}">このセットを削除</button>
          <button type="button" class="button" data-duplicate="${idx}">セットを複製</button>
          <button type="button" class="button" data-moveup="${idx}">上へ</button>
          <button type="button" class="button" data-movedown="${idx}">下へ</button>
        </div>
      </div>
    </div>
  `);
  return el;
}

function hmSmRenderAll() {
  const root = jQuery('#hm-sm-sets').empty();
  (window.hmSmState.sets || []).forEach((set, idx) => {
    const el = hmSmRenderSet(set, idx);
    root.append(el);
  });
  jQuery('.hm-sm-color').wpColorPicker();

  root.find('.hm-sm-admin__set').each(function(){
    hmSmUpdateTriggerVisibility(jQuery(this));
  });
}

function hmSmUpdateTriggerVisibility($setWrap){
  const idx = $setWrap.data('index');
  const type = $setWrap.find(`[name="sets[${idx}][trigger_type]"]:checked`).val();
  const $onlyLink = $setWrap.find('[data-only-link]');
  const $onlyModal = $setWrap.find('[data-only-modal]');
  if (type === 'link') { 
    $onlyLink.show(); 
    $onlyModal.hide();  // ただのリンクの時は複製元セレクタを非表示
  } else { 
    $onlyLink.hide(); 
    $onlyModal.show();  // モーダルの時だけ表示
  }
}

function hmSmReadForm() {
  const wrap = jQuery('#hm-sm-sets');
  const setsEl = wrap.children('.hm-sm-admin__set');
  const sets = [];
  setsEl.each(function() {
    const el = jQuery(this);
    const idx = el.data('index');
    const s = {};
    s.title = el.find(`[name="sets[${idx}][title]"]`).val() || '';
    s.memo  = el.find(`[name="sets[${idx}][memo]"]`).val() || '';
    s.enabled = el.find(`[name="sets[${idx}][enabled]"]`).prop('checked');
    s.auto_inject = el.find(`[name="sets[${idx}][auto_inject]"]`).prop('checked');
    s.apply_on_urls_enabled = el.find(`[name="sets[${idx}][apply_on_urls_enabled]"]`).prop('checked');
    s.apply_on_urls = el.find(`[name="sets[${idx}][apply_on_urls]"]`).val() || '';
    s.post_types = [];
    el.find(`[name="sets[${idx}][post_types][]"]:checked`).each(function(){ s.post_types.push(jQuery(this).val()); });
    s.trigger_type = el.find(`[name="sets[${idx}][trigger_type]"]:checked`).val();
    s.link_url = el.find(`[name="sets[${idx}][link_url]"]`).val() || '#';
    s.link_new_tab = el.find(`[name="sets[${idx}][link_new_tab]"]`).prop('checked');
    s.link_rel_noopener = el.find(`[name="sets[${idx}][link_rel_noopener]"]`).prop('checked');
    s.selector_to_clone = el.find(`[name="sets[${idx}][selector_to_clone]"]`).val() || '';
    s.internal_link_selector = el.find(`[name="sets[${idx}][internal_link_selector]"]`).val() || 'a';
    s.custom_css = el.find(`[name="sets[${idx}][custom_css]"]`).val() || '';

    s.button = {
      text: el.find(`[name="sets[${idx}][button][text]"]`).val() || '応募する',
      font_size_px: parseInt(el.find(`[name="sets[${idx}][button][font_size_px]"]`).val() || '15', 10),
      font_size_px_tab: parseInt(el.find(`[name="sets[${idx}][button][font_size_px_tab]"]`).val() || '15', 10),
      font_size_px_pc: parseInt(el.find(`[name="sets[${idx}][button][font_size_px_pc]"]`).val() || '15', 10),
      position_sp: el.find(`[name="sets[${idx}][button][position_sp]"]`).val(),
      position_tab: el.find(`[name="sets[${idx}][button][position_tab]"]`).val(),
      position_pc: el.find(`[name="sets[${idx}][button][position_pc]"]`).val(),
      shape_sp: el.find(`[name="sets[${idx}][button][shape_sp]"]`).val(),
      shape_tab: el.find(`[name="sets[${idx}][button][shape_tab]"]`).val(),
      shape_pc: el.find(`[name="sets[${idx}][button][shape_pc]"]`).val(),
      w_circle_px: parseInt(el.find(`[name="sets[${idx}][button][w_circle_px]"]`).val() || '50', 10),
      h_circle_px: parseInt(el.find(`[name="sets[${idx}][button][h_circle_px]"]`).val() || '50', 10),
      w_circle_px_tab: parseInt(el.find(`[name="sets[${idx}][button][w_circle_px_tab]"]`).val() || '50', 10),
      h_circle_px_tab: parseInt(el.find(`[name="sets[${idx}][button][h_circle_px_tab]"]`).val() || '50', 10),
      w_circle_px_pc: parseInt(el.find(`[name="sets[${idx}][button][w_circle_px_pc]"]`).val() || '50', 10),
      h_circle_px_pc: parseInt(el.find(`[name="sets[${idx}][button][h_circle_px_pc]"]`).val() || '50', 10),
      bg_color: el.find(`[name="sets[${idx}][button][bg_color]"]`).val() || '#000000',
      bg_opacity: parseFloat(el.find(`[name="sets[${idx}][button][bg_opacity]"]`).val() || '1'),
      text_color: el.find(`[name="sets[${idx}][button][text_color]"]`).val() || '#FFFFFF',
      border_color: el.find(`[name="sets[${idx}][button][border_color]"]`).val() || '#000000',
      border_width_px: parseInt(el.find(`[name="sets[${idx}][button][border_width_px]"]`).val() || '0', 10),
      border_opacity: parseFloat(el.find(`[name="sets[${idx}][button][border_opacity]"]`).val() || '1'),
      radius_value: parseFloat(el.find(`[name="sets[${idx}][button][radius_value]"]`).val() || '0'),
      radius_unit: el.find(`[name="sets[${idx}][button][radius_unit]"]`).val() || 'px',
      radius_preset: el.find(`[name="sets[${idx}][button][radius_preset]"]`).val() || 'custom',
      hover_bg_color: el.find(`[name="sets[${idx}][button][hover_bg_color]"]`).val() || '#000000',
      hover_bg_opacity: parseFloat(el.find(`[name="sets[${idx}][button][hover_bg_opacity]"]`).val() || '0.8'),
      hover_text_color: el.find(`[name="sets[${idx}][button][hover_text_color]"]`).val() || '#FFFFFF',
      hover_transition_sec: parseFloat(el.find(`[name="sets[${idx}][button][hover_transition_sec]"]`).val() || '0.4'),
      shadow_trigger: el.find(`[name="sets[${idx}][button][shadow_trigger]"]`).val() || 'none',
      shadow_trigger_custom: el.find(`[name="sets[${idx}][button][shadow_trigger_custom]"]`).val() || '',
    };

    s.modal = {
      size: el.find(`[name="sets[${idx}][modal][size]"]`).val() || 'md',
      max_height_px: parseInt(el.find(`[name="sets[${idx}][modal][max_height_px]"]`).val() || '600', 10),
      scroll_body: el.find(`[name="sets[${idx}][modal][scroll_body]"]`).prop('checked'),
      anim_type: el.find(`[name="sets[${idx}][modal][anim_type]"]`).val() || 'fade',
      anim_sec: parseFloat(el.find(`[name="sets[${idx}][modal][anim_sec]"]`).val() || '0.25'),
      anim_ease: el.find(`[name="sets[${idx}][modal][anim_ease]"]`).val() || 'ease',
      respect_reduced_motion: el.find(`[name="sets[${idx}][modal][respect_reduced_motion]"]`).prop('checked'),
      overlay_color: el.find(`[name="sets[${idx}][modal][overlay_color]"]`).val() || '#000000',
      overlay_opacity: parseFloat(el.find(`[name="sets[${idx}][modal][overlay_opacity]"]`).val() || '0.5'),
      bottom_close_enabled: el.find(`[name="sets[${idx}][modal][bottom_close_enabled]"]`).prop('checked'),
      bottom_close_text: el.find(`[name="sets[${idx}][modal][bottom_close_text]"]`).val() || '閉じる',
      shadow_modal: el.find(`[name="sets[${idx}][modal][shadow_modal]"]`).val() || 'lg',
      shadow_modal_custom: el.find(`[name="sets[${idx}][modal][shadow_modal_custom]"]`).val() || '',
    };

    s.ga4 = {
      enabled: el.find(`[name="sets[${idx}][ga4][enabled]"]`).prop('checked'),
      event_open: el.find(`[name="sets[${idx}][ga4][event_open]"]`).val() || 'hm_modal_open',
      event_close: el.find(`[name="sets[${idx}][ga4][event_close]"]`).val() || 'hm_modal_close',
      event_link: el.find(`[name="sets[${idx}][ga4][event_link]"]`).val() || 'hm_modal_link_click',
      params_json: el.find(`[name="sets[${idx}][ga4][params_json]"]`).val() || ''
    };

    s.auto_open = {
      enabled: el.find(`[name="sets[${idx}][auto_open][enabled]"]`).prop('checked'),
      after_sec: parseFloat(el.find(`[name="sets[${idx}][auto_open][after_sec]"]`).val() || '0'),
      on_exit: el.find(`[name="sets[${idx}][auto_open][on_exit]"]`).prop('checked'),
      on_scroll_percent: parseFloat(el.find(`[name="sets[${idx}][auto_open][on_scroll_percent]"]`).val() || '0'),
    };

    s.url_trigger = {
      enabled: el.find(`[name="sets[${idx}][url_trigger][enabled]"]`).prop('checked'),
      query_key: el.find(`[name="sets[${idx}][url_trigger][query_key]"]`).val() || 'hm_modal',
      query_value: el.find(`[name="sets[${idx}][url_trigger][query_value]"]`).val() || '',
      hash: el.find(`[name="sets[${idx}][url_trigger][hash]"]`).val() || '',
    };

    s.dynamic_dom = {
      watch: el.find(`[name="sets[${idx}][dynamic_dom][watch]"]`).prop('checked'),
      timeout_ms: parseInt(el.find(`[name="sets[${idx}][dynamic_dom][timeout_ms]"]`).val() || '3000', 10),
    };

    s.layout = {
      pc_cols: parseInt(el.find(`[name="sets[${idx}][layout][pc_cols]"]`).val() || '3', 10),
      tab_cols: parseInt(el.find(`[name="sets[${idx}][layout][tab_cols]"]`).val() || '2', 10),
      sp_cols: parseInt(el.find(`[name="sets[${idx}][layout][sp_cols]"]`).val() || '1', 10),
      gap_px: parseInt(el.find(`[name="sets[${idx}][layout][gap_px]"]`).val() || '15', 10),
    };

    s.schedule = {
      enabled: el.find(`[name="sets[${idx}][schedule][enabled]"]`).prop('checked'),
      date_start: el.find(`[name="sets[${idx}][schedule][date_start]"]`).val() || '',
      date_end: el.find(`[name="sets[${idx}][schedule][date_end]"]`).val() || '',
      days: [],
      time_start: el.find(`[name="sets[${idx}][schedule][time_start]"]`).val() || '',
      time_end: el.find(`[name="sets[${idx}][schedule][time_end]"]`).val() || '',
    };
    el.find(`[name="sets[${idx}][schedule][days][]"]:checked`).each(function(){ s.schedule.days.push(parseInt(jQuery(this).val(),10)); });

    sets.push(s);
  });

  const sp = parseInt(jQuery('#hm-sm-breakpoint-sp').val() || '767', 10);
  const tab = parseInt(jQuery('#hm-sm-breakpoint-tab').val() || '1024', 10);
  const zroot = parseInt(jQuery('#hm-sm-z-root').val() || '999999', 10);
  const ztrig = parseInt(jQuery('#hm-sm-z-trigger').val() || '999998', 10);
  return { breakpoint_sp_max: sp, breakpoint_tab_max: tab, z_index_root: zroot, z_index_trigger: ztrig, sets };
}


function hmSmShowNotice(type, message){
  const $area = jQuery('#hm-sm-notices');
  const cls = (type === 'success') ? 'notice notice-success is-dismissible' : 'notice notice-error is-dismissible';
  const html = '<div class="' + cls + '"><p>' + message.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</p></div>';
  $area.html(html);
  setTimeout(()=>{ $area.find('.notice').fadeOut(200, function(){ jQuery(this).remove(); }); }, 4000);
}


function hmSmBottomFeedback(type, message, scrollTo=true){
  const $el = jQuery('#hm-sm-save-feedback');
  if ($el.length === 0) return;
  $el.removeClass('hm-sm-admin__save-feedback--ok hm-sm-admin__save-feedback--ng hm-sm-admin__save-feedback--progress');
  if (type === 'success') $el.addClass('hm-sm-admin__save-feedback--ok');
  else if (type === 'error') $el.addClass('hm-sm-admin__save-feedback--ng');
  else $el.addClass('hm-sm-admin__save-feedback--progress');
  $el.text(message || '');
  if (scrollTo) { $el[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}

jQuery(function($){
  window.hmSmState = HM_SM_ADMIN_DATA.settings || { sets: [], breakpoint_sp_max: 767, breakpoint_tab_max: 1024, z_index_root: 999999, z_index_trigger: 999998 };
  if (!Array.isArray(window.hmSmState.sets)) window.hmSmState.sets = [];
  window.hmSmOpen = new Set();

  function captureOpenStates(){
    window.hmSmOpen.clear();
    $('#hm-sm-sets .hm-sm-admin__set').each(function(i){
      if ($(this).hasClass('is-open')) window.hmSmOpen.add(i);
    });
  }

  hmSmRenderAll();

  $('#hm-sm-add-set').on('click', function(){
    captureOpenStates();
    window.hmSmForceOpenIndex = window.hmSmState.sets.length; // 追加される新規セットのみ開く
    window.hmSmState.sets.push({
      enabled: true, auto_inject: true, title: '', memo: '',
      apply_on_urls_enabled: false, apply_on_urls: '',
      post_types: ['post','page'],
      trigger_type: 'modal',
      link_url: '#', link_new_tab: false, link_rel_noopener: true,
      selector_to_clone: '', internal_link_selector: 'a', custom_css: '',
      ga4: { enabled:false, event_open:'hm_modal_open', event_close:'hm_modal_close', event_link:'hm_modal_link_click', params_json:'' },
      auto_open: { enabled:false, after_sec:0, on_exit:false, on_scroll_percent:0 },
      url_trigger: { enabled:false, query_key:'hm_modal', query_value:'', hash:'' },
      dynamic_dom: { watch:false, timeout_ms:3000 },
      layout: { pc_cols:3, tab_cols:2, sp_cols:1, gap_px:15 },
      button: {
        text:'応募する',
        font_size_px:15, font_size_px_tab:15, font_size_px_pc:15,
        position_sp:'bottom-center', position_tab:'bottom-center', position_pc:'bottom-center',
        shape_sp:'rect', shape_tab:'rect', shape_pc:'rect',
        w_circle_px:50, h_circle_px:50,
        w_circle_px_tab:50, h_circle_px_tab:50,
        w_circle_px_pc:50, h_circle_px_pc:50,
        bg_color:'#000000', bg_opacity:1, text_color:'#FFFFFF',
        border_color:'#000000', border_width_px:0, border_opacity:1,
        radius_value:0, radius_unit:'px', radius_preset:'custom',
        hover_bg_color:'#000000', hover_bg_opacity:0.8, hover_text_color:'#FFFFFF', hover_transition_sec:0.4,
        shadow_trigger:'none', shadow_trigger_custom:''
      },
      modal: {
        size:'md', max_height_px:600, scroll_body:true,
        anim_type:'fade', anim_sec:0.25, anim_ease:'ease', respect_reduced_motion:true,
        overlay_color:'#000000', overlay_opacity:0.5,
        bottom_close_enabled:true, bottom_close_text:'閉じる',
        shadow_modal:'lg', shadow_modal_custom:''
      },
      schedule: { enabled:false, date_start:'', date_end:'', days:[], time_start:'', time_end:'' }
    });
    hmSmRenderAll();
  });

  // Accordion toggle
  $('#hm-sm-sets').on('click', '.hm-sm-admin__set-header', function(e){
    if ($(e.target).is('input, textarea, select, label')) return;
    const $set = $(this).closest('.hm-sm-admin__set');
    $set.toggleClass('is-open');
    $set.find('.hm-sm-admin__toggle').text($set.hasClass('is-open') ? '−' : '+');
  });

  // Enabled badge update
  $('#hm-sm-sets').on('change', 'input[name*="[enabled]"]', function(){
    const name = (this && this.name) ? this.name.trim() : '';
    if (!/^sets\[\d+\]\[enabled\]$/.test(name)) { return; }
    const $set = $(this).closest('.hm-sm-admin__set');
    const on = $(this).prop('checked');
    const $b = $set.find('[data-status-badge]');
    $b.text(on ? HM_SM_ADMIN_DATA.texts.enabled : HM_SM_ADMIN_DATA.texts.disabled);
    $b.removeClass('hm-sm-admin__badge--on hm-sm-admin__badge--off');
    $b.addClass(on ? 'hm-sm-admin__badge--on' : 'hm-sm-admin__badge--off');
});;

  // trigger_type visibility
  $('#hm-sm-sets').on('change', 'input[name*="[trigger_type]"]', function(){
    const $set = $(this).closest('.hm-sm-admin__set');
    hmSmUpdateTriggerVisibility($set);
  });

  // Remove/Duplicate/Move
  $('#hm-sm-sets').on('click', '.hm-sm-admin__remove', function(){
    const idx = parseInt($(this).data('remove'), 10);
    if (!window.confirm('このセットを削除します。よろしいですか？')) return;
    captureOpenStates();
    if (Number.isInteger(idx)) { window.hmSmState.sets.splice(idx, 1); hmSmRenderAll(); }
  });
  $('#hm-sm-sets').on('click', '[data-duplicate]', function(){
    captureOpenStates();
    const idx = parseInt($(this).data('duplicate'), 10);
    const copy = JSON.parse(JSON.stringify(window.hmSmState.sets[idx]));
    copy.title = (copy.title || '') + ' (コピー)';
    window.hmSmState.sets.splice(idx+1, 0, copy);
    window.hmSmForceOpenIndex = idx + 1;
    hmSmRenderAll();
  });
  $('#hm-sm-sets').on('click', '[data-moveup]', function(){
    captureOpenStates();
    const idx = parseInt($(this).data('moveup'), 10);
    if (idx > 0) {
      const arr = window.hmSmState.sets;
      [arr[idx-1], arr[idx]] = [arr[idx], arr[idx-1]];
      hmSmRenderAll();
    }
  });
  $('#hm-sm-sets').on('click', '[data-movedown]', function(){
    captureOpenStates();
    const idx = parseInt($(this).data('movedown'), 10);
    const arr = window.hmSmState.sets;
    if (idx < arr.length - 1) {
      [arr[idx+1], arr[idx]] = [arr[idx], arr[idx+1]];
      hmSmRenderAll();
    }
  });

  // Export
  $('#hm-sm-export').on('click', function(){
    const payload = hmSmReadForm();
    payload.version = (window.HM_SM_ADMIN_DATA && HM_SM_ADMIN_DATA.version) || '1.0.1';
    payload.exported_at = new Date().toISOString();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hm-smart-modal-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  });
  // Import
  $('#hm-sm-import').on('change', function(ev){
    const file = ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
      try {
        const data = JSON.parse(e.target.result);
        window.hmSmState = data;
        hmSmRenderAll();
        alert('読み込みました。保存ボタンで確定してください。');
      } catch(err) {
        alert('JSONの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    $(this).val('');
  });

  // Save
  
  // Save button click (form has novalidate to avoid HTML5 validation blocking)
  $('#hm-sm-save').on('click', function(){
    const payload = hmSmReadForm();
    payload.version = (window.HM_SM_ADMIN_DATA && HM_SM_ADMIN_DATA.version) || '1.0.1';
    payload.exported_at = new Date().toISOString();
    // clamp z-index to >= 0
    payload.z_index_root = Math.max(0, parseInt(payload.z_index_root || 0, 10));
    payload.z_index_trigger = Math.max(0, parseInt(payload.z_index_trigger || 0, 10));
    const nonce = HM_SM_ADMIN_DATA.nonce;

    const $saveBtn = jQuery('#hm-sm-save');
    hmSmBottomFeedback('progress', '保存中…', true);
    $saveBtn.prop('disabled', true);
    const url = ajaxurl + '?action=hm_sm_save&nonce=' + encodeURIComponent(nonce);
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(async (res) => {
      const txt = await res.text();
      try { return JSON.parse(txt); } catch(e){ return { success:false, data:{ message: txt || 'サーバーエラー' } }; }
    })
    .then(json => {
      if (json && json.success) {
        window.hmSmState = json.data.settings;
        hmSmShowNotice('success', '保存しました。');
        hmSmBottomFeedback('success', '保存しました。', true);
        hmSmRenderAll();
      } else {
        hmSmShowNotice('error', (json && json.data && json.data.message) ? json.data.message : '保存に失敗しました。');
        hmSmBottomFeedback('error', (json && json.data && json.data.message) ? json.data.message : '保存に失敗しました。', true);
      }
    })
    .catch(err => {
      console.error(err);
      hmSmShowNotice('error', '通信エラーが発生しました。');
      hmSmBottomFeedback('error', '通信エラーが発生しました。', true);
    })
    .finally(()=>{
      $saveBtn.prop('disabled', false);
    });
  });

});

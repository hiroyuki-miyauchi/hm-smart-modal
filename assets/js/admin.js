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

        <div class="hm-sm-admin__grid hm-sm-admin__grid--set">
          <div class="hm-sm-admin__field">
            <div class="hm-sm-admin__subhead">対象URL</div>
            <label><input type="checkbox" name="sets[${idx}][apply_on_urls_enabled]" ${set.apply_on_urls_enabled ? 'checked' : ''}> URLでページを指定する</label>
            <textarea class="widefat" rows="3" name="sets[${idx}][apply_on_urls]" placeholder="1行に1つ、含まれていればOKの部分文字列">${set.apply_on_urls || ''}</textarea>
            <p class="hm-sm-admin__help">例：<code>/campaign/</code> と書くとURLにこの文字が含まれるページで動きます。複数行OK。</p>
          </div>

          <div class="hm-sm-admin__field">
            <div class="hm-sm-admin__subhead">対象の投稿タイプ</div>
<div class="hm-sm-ptype-grid">
  ${(HM_SM_ADMIN_DATA.postTypes || []).map(pt => {
    const on = (set.post_types || []).includes(pt.name) ? 'checked' : '';
    return `<label><input type="checkbox" name="sets[${idx}][post_types][]" value="${pt.name}" ${on}> ${pt.label}</label>`;
  }).join('')}
</div>
<p class="hm-sm-admin__help">チェックした投稿タイプのページで動きます。</p>
        </div>

        <div class="hm-sm-admin__field" data-trigger-wrap>
          <div class="hm-sm-admin__subhead">動作タイプ</div>
<div class="hm-sm-radio-tabs" data-radio-tabs>
  <label><input type="radio" name="sets[${idx}][trigger_type]" value="modal" ${set.trigger_type === 'modal' ? 'checked' : ''}> モーダルで表示</label>
  <label><input type="radio" name="sets[${idx}][trigger_type]" value="link" ${set.trigger_type === 'link' ? 'checked' : ''}> ただのリンク</label>
</div>
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

          <div class="hm-sm-admin__row" data-only-modal><label>モーダル内のボタンにしたい要素のセレクタ</label></div>
          <input type="text" class="widefat" data-only-modal name="sets[${idx}][internal_link_selector]" value="${set.internal_link_selector || 'a'}" placeholder="例：.entry-content a.btn, a[href*='apply']">
          <p class="hm-sm-admin__help" data-only-modal>一致する要素をボタン風に整えます。未入力なら<a>タグが対象。</p>
          <div data-only-modal>
            <!-- removed: deprecated cleanup field -->

          <div class="hm-sm-group" data-only-modal>
            <div class="hm-sm-group__title">モーダル内ボタンの色 / 枠線</div>
            <div class="hm-sm-admin__two">
              <div><label>背景色</label><input type="text" class="hm-sm-color" name="sets[${idx}][modal_button][bg_color]" value="${set.modal_button?.bg_color || '#000000'}"><p class="hm-sm-admin__help">ボタン背景色（未指定時はトリガーと同様）。</p></div>
              <div><label>背景 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][modal_button][bg_opacity]" value="${set.modal_button?.bg_opacity ?? ''}"><p class="hm-sm-admin__help">背景色の透明度。</p></div>
            </div>
            <div class="hm-sm-admin__two">
              <div><label>文字色</label><input type="text" class="hm-sm-color" name="sets[${idx}][modal_button][text_color]" value="${set.modal_button?.text_color || ''}"><p class="hm-sm-admin__help">テキスト色（未指定時はトリガーと同様）。</p></div>
              <div><label>枠線色</label><input type="text" class="hm-sm-color" name="sets[${idx}][modal_button][border_color]" value="${set.modal_button?.border_color || '#000000'}"><p class="hm-sm-admin__help">枠線色。</p></div>
            </div>
            <div class="hm-sm-admin__two">
              <div><label>枠線幅(px)</label><input type="number" min="0" max="10" step="1" name="sets[${idx}][modal_button][border_width_px]" value="${set.modal_button?.border_width_px ?? 1}"><p class="hm-sm-admin__help">枠線の太さ（0でなし）。</p></div>
              <div><label>枠線 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][modal_button][border_opacity]" value="${set.modal_button?.border_opacity ?? 1}"><p class="hm-sm-admin__help">枠線色の透明度。</p></div>
            </div>
          </div>

          <div class="hm-sm-group" data-only-modal>
            <div class="hm-sm-group__title">モーダル内ボタン（ホバー）</div>
            <div class="hm-sm-admin__two">
              <div><label>ホバー背景</label><input type="text" class="hm-sm-color" name="sets[${idx}][modal_button][hover_bg_color]" value="${set.modal_button?.hover_bg_color || '#000000'}"><p class="hm-sm-admin__help">ホバー時の背景色。</p></div>
              <div><label>ホバー 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][modal_button][hover_bg_opacity]" value="${set.modal_button?.hover_bg_opacity ?? 0.8}"><p class="hm-sm-admin__help">ホバー背景の透明度。</p></div>
            </div>
            <div class="hm-sm-admin__two">
              <div><label>ホバー文字色</label><input type="text" class="hm-sm-color" name="sets[${idx}][modal_button][hover_text_color]" value="${set.modal_button?.hover_text_color || ''}"><p class="hm-sm-admin__help">ホバー時の文字色。</p></div>
              <div><label>トランジション秒数</label><input type="number" min="0" max="5" step="0.05" name="sets[${idx}][modal_button][hover_transition_sec]" value="${set.modal_button?.hover_transition_sec ?? (set.button?.hover_transition_sec ?? 0.4)}"><p class="hm-sm-admin__help">ホバーのアニメ秒数。</p></div>
            </div>
          </div>
                    <div class="hm-sm-admin__row">
              <label>カスタムCSS（モーダル用）</label>
            </div>
            <textarea class="widefat" rows="3" name="sets[${idx}][custom_css_modal]">${set.custom_css_modal || ""}</textarea>
            <p class="hm-sm-admin__help">モーダル内の白いボックスや複製コンテンツの見た目を調整します。<strong>body.hm-sm-open--${idx}</strong> を先頭に付けるとこのセットの表示中にだけ適用できます。</p>
          </div>
          <div class="hm-sm-admin__row">
            <label>カスタムCSS（トリガー/リンク用）</label>
          </div>
          <textarea class="widefat" rows="3" name="sets[${idx}][custom_css]">${set.custom_css || ''}</textarea>
          <p class="hm-sm-admin__help">トリガーボタン／ただのリンクのデザインや位置を調整します（ページ読み込み時に適用）。特定のセットだけに当てる場合は「.hm-sm-trigger--${idx}」を先頭に付けてください。例：.hm-sm-trigger--${idx}{ position: fixed; right: 16px; bottom: 24px; }</p>
        </div>

        <div class="hm-sm-admin__field">
          <div class="hm-sm-admin__subhead">トリガーボタン（SP/Tablet/PC）</div>
<div class="hm-sm-admin__two">
  <div><label>ボタンテキスト</label><input type="text" class="widefat" name="sets[${idx}][button][text]" value="${set.button?.text || '応募する'}">
          <p class="hm-sm-admin__help">サイト上に表示するトリガーボタンの文言です。</p></div>
  <div><label>文字サイズ(SP,px)</label><input type="number" min="8" max="40" step="1" name="sets[${idx}][button][font_size_px]" value="${set.button?.font_size_px ?? 15}">
          <p class="hm-sm-admin__help">スマホ表示時のボタン文字サイズ（単位はpx）。</p></div>
</div>
<div class="hm-sm-admin__two">
  <div><label>文字サイズ(Tablet,px)</label><input type="number" min="8" max="40" step="1" name="sets[${idx}][button][font_size_px_tab]" value="${set.button?.font_size_px_tab ?? set.button?.font_size_px ?? 15}">
          <p class="hm-sm-admin__help">タブレット表示時のボタン文字サイズ（px）。</p></div>
  <div><label>文字サイズ(PC,px)</label><input type="number" min="8" max="40" step="1" name="sets[${idx}][button][font_size_px_pc]" value="${set.button?.font_size_px_pc ?? set.button?.font_size_px ?? 15}">
          <p class="hm-sm-admin__help">PC表示時のボタン文字サイズ（px）。</p></div>
</div>

<div class="hm-sm-group">
  <div class="hm-sm-group__title">配置 / 角丸プリセット</div>
  <div class="hm-sm-admin__two">
    <div>
      <label>SP位置</label>
      <select name="sets[${idx}][button][position_sp]">
        ${['right-center','left-center','right-bottom','top-center','bottom-center','left-bottom'].map(v => {
          const sel = (set.button?.position_sp || 'bottom-center') === v ? 'selected' : '';
          return `<option value="${v}" ${sel}>${v}</option>`;
        }).join('')}
      </select>
          <p class="hm-sm-admin__help">スマホでのボタンの固定位置です。</p>
    </div>
    <div>
      <label>Tablet位置</label>
      <select name="sets[${idx}][button][position_tab]">
        ${['right-center','left-center','right-bottom','top-center','bottom-center','left-bottom'].map(v => {
          const sel = (set.button?.position_tab || 'bottom-center') === v ? 'selected' : '';
          return `<option value="${v}" ${sel}>${v}</option>`;
        }).join('')}
      </select>
          <p class="hm-sm-admin__help">タブレットでのボタンの固定位置です。</p>
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
          <p class="hm-sm-admin__help">PCでのボタンの固定位置です。</p>
    </div>
    <div>
      <label>角丸プリセット</label>
      <select name="sets[${idx}][button][radius_preset]">
        ${['custom','none','sm','md','lg','full'].map(v => {
          const sel = (set.button?.radius_preset || 'custom') === v ? 'selected' : '';
          return `<option value="${v}" ${sel}>${v}</option>`;
        }).join('')}
      </select>
          <p class="hm-sm-admin__help">角の丸みのプリセット。custom時は下の値/単位を使用します。</p>
    </div>
  </div>
  <div class="hm-sm-admin__two">
    <div><label>角丸 値</label><input type="number" min="0" max="100" step="1" name="sets[${idx}][button][radius_value]" value="${set.button?.radius_value ?? 0}">
          <p class="hm-sm-admin__help">角丸の大きさ。数値のみを入力します。</p></div>
    <div><label>角丸 単位</label><select name="sets[${idx}][button][radius_unit]">
      ${['px','%'].map(u => `<option value="${u}" ${(set.button?.radius_unit||'px')===u?'selected':''}>${u}</option>`).join('')}
    </select>
          <p class="hm-sm-admin__help">角丸の単位（px か %）。</p></div>
  </div>
</div>

<div class="hm-sm-group">
  <div class="hm-sm-group__title">形状 / 影（Trigger）</div>
  <div class="hm-sm-admin__two">
    <div><label>形状(SP)</label><select name="sets[${idx}][button][shape_sp]">${['rect','circle'].map(v=>`<option value="${v}" ${(set.button?.shape_sp||'rect')===v?'selected':''}>${v}</option>`).join('')}</select>
          <p class="hm-sm-admin__help">スマホ時のボタンの形（四角/円）。</p></div>
    <div><label>形状(Tablet)</label><select name="sets[${idx}][button][shape_tab]">${['rect','circle'].map(v=>`<option value="${v}" ${(set.button?.shape_tab||'rect')===v?'selected':''}>${v}</option>`).join('')}</select>
          <p class="hm-sm-admin__help">タブレット時のボタンの形。</p></div>
  </div>
  <div class="hm-sm-admin__two">
    <div><label>形状(PC)</label><select name="sets[${idx}][button][shape_pc]">${['rect','circle'].map(v=>`<option value="${v}" ${(set.button?.shape_pc||'rect')===v?'selected':''}>${v}</option>`).join('')}</select>
          <p class="hm-sm-admin__help">PC時のボタンの形。</p></div>
    <div><label>影(Trigger)</label><select name="sets[${idx}][button][shadow_trigger]">${['none','sm','md','lg','custom'].map(v=>`<option value="${v}" ${(set.button?.shadow_trigger||'none')===v?'selected':''}>${v}</option>`).join('')}</select>
          <p class="hm-sm-admin__help">トリガーボタンの影の強さ。custom時は下に任意のCSSを記入。</p></div>
  </div>
  <div class="hm-sm-admin__row">
    <label>Trigger影（custom時は自由入力）</label>
    <input type="text" class="widefat" name="sets[${idx}][button][shadow_trigger_custom]" value="${set.button?.shadow_trigger_custom || ''}" placeholder="例：0 10px 30px rgba(0,0,0,.2)">
          <p class="hm-sm-admin__help">box-shadow のCSS（例：0 10px 30px rgba(0,0,0,.2)）。</p>
  </div>
</div>

<div class="hm-sm-group">
  <div class="hm-sm-group__title">サイズ（円形のとき）</div>
  <div class="hm-sm-admin__two">
    <div><label>円の幅(SP,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][w_circle_px]" value="${set.button?.w_circle_px ?? 50}">
          <p class="hm-sm-admin__help">円形ボタン使用時の直径（SP）。</p></div>
    <div><label>円の高さ(SP,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][h_circle_px]" value="${set.button?.h_circle_px ?? 50}">
          <p class="hm-sm-admin__help">円形ボタン使用時の直径（SP）。</p></div>
  </div>
  <div class="hm-sm-admin__two">
    <div><label>円の幅(Tablet,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][w_circle_px_tab]" value="${set.button?.w_circle_px_tab ?? set.button?.w_circle_px ?? 50}">
          <p class="hm-sm-admin__help">円形ボタン使用時の直径（Tablet）。</p></div>
    <div><label>円の高さ(Tablet,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][h_circle_px_tab]" value="${set.button?.h_circle_px_tab ?? set.button?.h_circle_px ?? 50}">
          <p class="hm-sm-admin__help">円形ボタン使用時の直径（Tablet）。</p></div>
  </div>
  <div class="hm-sm-admin__two">
    <div><label>円の幅(PC,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][w_circle_px_pc]" value="${set.button?.w_circle_px_pc ?? set.button?.w_circle_px ?? 50}">
          <p class="hm-sm-admin__help">円形ボタン使用時の直径（PC）。</p></div>
    <div><label>円の高さ(PC,px)</label><input type="number" min="24" max="200" step="1" name="sets[${idx}][button][h_circle_px_pc]" value="${set.button?.h_circle_px_pc ?? set.button?.h_circle_px ?? 50}">
          <p class="hm-sm-admin__help">円形ボタン使用時の直径（PC）。</p></div>
  </div>
</div>

<div class="hm-sm-group">
  <div class="hm-sm-group__title">色 / 枠線</div>
  <div class="hm-sm-admin__two">
    <div><label>背景色</label><input type="text" class="hm-sm-color" name="sets[${idx}][button][bg_color]" value="${set.button?.bg_color || '#000000'}">
          <p class="hm-sm-admin__help">ボタンの背景色（#RRGGBB など）。</p></div>
    <div><label>背景 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][button][bg_opacity]" value="${set.button?.bg_opacity ?? 1.0}">
          <p class="hm-sm-admin__help">背景色の透明度。0で透明、1で不透明。</p></div>
  </div>
  <div class="hm-sm-admin__two">
    <div><label>文字色</label><input type="text" class="hm-sm-color" name="sets[${idx}][button][text_color]" value="${set.button?.text_color || '#FFFFFF'}">
          <p class="hm-sm-admin__help">ボタンテキストの色。</p></div>
    <div><label>枠線色</label><input type="text" class="hm-sm-color" name="sets[${idx}][button][border_color]" value="${set.button?.border_color || '#000000'}">
          <p class="hm-sm-admin__help">ボタンの枠線の色。</p></div>
  </div>
  <div class="hm-sm-admin__two">
    <div><label>枠線幅(px)</label><input type="number" min="0" max="20" step="1" name="sets[${idx}][button][border_width_px]" value="${set.button?.border_width_px ?? 0}">
          <p class="hm-sm-admin__help">枠線の太さ（px）。0で枠線なし。</p></div>
    <div><label>枠線 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][button][border_opacity]" value="${set.button?.border_opacity ?? 1.0}">
          <p class="hm-sm-admin__help">枠線色の透明度。</p></div>
  </div>
</div>

<div class="hm-sm-group">
  <div class="hm-sm-group__title">ホバー時の見た目</div>
  <div class="hm-sm-admin__two">
    <div><label>ホバー背景</label><input type="text" class="hm-sm-color" name="sets[${idx}][button][hover_bg_color]" value="${set.button?.hover_bg_color || '#000000'}">
          <p class="hm-sm-admin__help">マウスホバー時の背景色。</p></div>
    <div><label>ホバー 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][button][hover_bg_opacity]" value="${set.button?.hover_bg_opacity ?? 0.8}">
          <p class="hm-sm-admin__help">ホバー背景の透明度。</p></div>
  </div>
  <div class="hm-sm-admin__two">
    <div><label>ホバー文字色</label><input type="text" class="hm-sm-color" name="sets[${idx}][button][hover_text_color]" value="${set.button?.hover_text_color || '#FFFFFF'}">
          <p class="hm-sm-admin__help">ホバー時の文字色。</p></div>
    <div><label>トランジション秒数</label><input type="number" min="0" max="5" step="0.05" name="sets[${idx}][button][hover_transition_sec]" value="${set.button?.hover_transition_sec ?? 0.4}">
          <p class="hm-sm-admin__help">ホバー時の色変化にかける時間（秒）。</p></div>
  </div>
</div>
        </div>

        <div class="hm-sm-admin__field">
          <div class="hm-sm-admin__subhead">モーダル</div>

<div class="hm-sm-group">
  <div class="hm-sm-group__title">表示 / アクセシビリティ</div>
  <div class="hm-sm-admin__row">
    <label><input type="checkbox" name="sets[${idx}][modal][scroll_body]" ${set.modal?.scroll_body ? 'checked' : ''}> 本文だけスクロールにする</label>
    <label style="margin-left:16px"><input type="checkbox" name="sets[${idx}][modal][respect_reduced_motion]" ${set.modal?.respect_reduced_motion !== false ? 'checked' : ''}> reduced-motion を尊重</label>
  </div>
</div>

<div class="hm-sm-group">
  <div class="hm-sm-group__title">サイズ / 最大高さ</div>
  <div class="hm-sm-admin__two">
    <div><label>サイズ</label><select name="sets[${idx}][modal][size]">
          <p class="hm-sm-admin__help">モーダルの幅のプリセット（sm/md/lg）。</p>${['sm','md','lg'].map(v=>`<option value="${v}" ${(set.modal?.size||'md')===v?'selected':''}>${v}</option>`).join('')}</select></div>
    <div><label>最大高さ(px)</label><input type="number" min="200" max="2000" step="10" name="sets[${idx}][modal][max_height_px]" value="${set.modal?.max_height_px ?? 600}">
          <p class="hm-sm-admin__help">モーダルの上限高さ（px）。超えると内部スクロール。</p></div>
  </div>
</div>
  <div class="hm-sm-admin__two">
    <div><label>最大幅(px)</label><input type="number" min="0" max="4000" name="sets[${idx}][modal][max_width_px]" value="${set.modal?.max_width_px ?? 0}">
          <p class="hm-sm-admin__help">空欄/0はテーマ既定（CSSのmax-width）を使用。</p></div>
    <div><label>最小幅(px)</label><input type="number" min="0" max="2000" name="sets[${idx}][modal][min_width_px]" value="${set.modal?.min_width_px ?? 0}">
          <p class="hm-sm-admin__help">空欄/0は制限なし。</p></div>
  </div>
  <div class="hm-sm-admin__two">
    <div><label>最小高さ(px)</label><input type="number" min="0" max="2000" name="sets[${idx}][modal][min_height_px]" value="${set.modal?.min_height_px ?? 0}">
          <p class="hm-sm-admin__help">空欄/0は制限なし。</p></div>
    <div></div>
  </div>


<div class="hm-sm-group">
  <div class="hm-sm-group__title">アニメーション</div>
  <div class="hm-sm-admin__two">
    <div><label>種類</label><select name="sets[${idx}][modal][anim_type]">
          <p class="hm-sm-admin__help">モーダルのアニメーションタイプ。</p>${['fade','zoom','slide-up'].map(v=>`<option value="${v}" ${(set.modal?.anim_type||'fade')===v?'selected':''}>${v}</option>`).join('')}</select></div>
    <div><label>秒数</label><input type="number" min="0" max="5" step="0.05" name="sets[${idx}][modal][anim_sec]" value="${set.modal?.anim_sec ?? 0.25}">
          <p class="hm-sm-admin__help">アニメーションの時間（秒）。</p></div>
  </div>
  <div class="hm-sm-admin__row">
    <label>easing</label>
    <input type="text" class="widefat" name="sets[${idx}][modal][anim_ease]" value="${set.modal?.anim_ease || 'ease'}" placeholder="ease, ease-in, ease-out など">
          <p class="hm-sm-admin__help">CSSのイージング（例：ease, ease-in）。</p>
  </div>
</div>

<div class="hm-sm-group">
  <div class="hm-sm-group__title">背景 / 閉じるボタン / 影</div>
  <div class="hm-sm-admin__two">
    <div><label>背景(オーバーレイ)色</label><input type="text" class="hm-sm-color" name="sets[${idx}][modal][overlay_color]" value="${set.modal?.overlay_color || '#000000'}">
          <p class="hm-sm-admin__help">画面全体に敷かれる暗い背景色。</p></div>
    <div><label>背景 透過(0〜1)</label><input type="number" min="0" max="1" step="0.05" name="sets[${idx}][modal][overlay_opacity]" value="${set.modal?.overlay_opacity ?? 0.5}"></div>
  </div>
  <div class="hm-sm-admin__two">
    <div><label><input type="checkbox" name="sets[${idx}][modal][bottom_close_enabled]" ${set.modal?.bottom_close_enabled ? 'checked' : ''}> 下部に「閉じる」ボタンを表示</label></div>
    <div><label>閉じるボタン文言</label><input type="text" class="widefat" name="sets[${idx}][modal][bottom_close_text]" value="${set.modal?.bottom_close_text || '閉じる'}">
          <p class="hm-sm-admin__help">モーダル下部の「閉じる」ボタンの表示テキスト。</p></div>
  </div>
  <div class="hm-sm-admin__two">
    <div><label>影(Modal)</label><select name="sets[${idx}][modal][shadow_modal]">
          <p class="hm-sm-admin__help">モーダルボックスの影の強さ。</p>${['none','sm','md','lg'].map(v=>`<option value="${v}" ${(set.modal?.shadow_modal||'lg')===v?'selected':''}>${v}</option>`).join('')}</select></div>
    <div><label>影(Modal, custom)</label><input type="text" class="widefat" name="sets[${idx}][modal][shadow_modal_custom]" value="${set.modal?.shadow_modal_custom || ''}" placeholder="例：0 20px 50px rgba(0,0,0,.3)">
          <p class="hm-sm-admin__help">box-shadow のCSSを自由入力。</p></div>
  </div>
</div>
        </div>

        <div class="hm-sm-admin__field">
          <div class="hm-sm-admin__subhead">GA4イベント</div>
<p class="hm-sm-admin__help">Google Analytics 4 にイベントを送信するための設定です。open/close/link のイベント名や、JSONの追加パラメータを指定できます。レポートでの計測に使用されます。</p>
          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][ga4][enabled]" ${set.ga4?.enabled ? 'checked' : ''}> GA4に送信</label></div>
          <div class="hm-sm-admin__two">
            <div><label>openイベント名</label><input type="text" class="widefat" name="sets[${idx}][ga4][event_open]" value="${set.ga4?.event_open || 'hm_modal_open'}">
  <p class="hm-sm-admin__help">モーダル表示時に送信するイベント名。任意の文字列。</p></div>
            <div><label>closeイベント名</label><input type="text" class="widefat" name="sets[${idx}][ga4][event_close]" value="${set.ga4?.event_close || 'hm_modal_close'}">
  <p class="hm-sm-admin__help">モーダルを閉じた時のイベント名。任意の文字列。</p></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>linkイベント名</label><input type="text" class="widefat" name="sets[${idx}][ga4][event_link]" value="${set.ga4?.event_link || 'hm_modal_link_click'}">
  <p class="hm-sm-admin__help">モーダル内リンクをクリックした時のイベント名。任意の文字列。</p></div>
            <div><label>追加パラメータ(JSON)</label><input type="text" class="widefat" name="sets[${idx}][ga4][params_json]" value="${set.ga4?.params_json || ''}" placeholder='{"foo":"bar"}'>
  <p class="hm-sm-admin__help">GA4イベントに付与する追加データ。JSONで key/value を指定（例：{"plan":"pro"}）。</p></div>
          </div>
        </div>

        <div class="hm-sm-admin__field">
          <div class="hm-sm-admin__subhead">自動オープン / URLトリガー / 動的DOM</div>
<p class="hm-sm-admin__help">モーダルを自動で開く条件（秒・スクロール・離脱意図）、URLクエリ/ハッシュでの発火、遅れて出現する要素の監視など、表示トリガーをまとめた設定です。</p>
          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][auto_open][enabled]" ${set.auto_open?.enabled ? 'checked' : ''}> 自動オープンを有効化</label></div>
          <div class="hm-sm-admin__two">
            <div><label>読み込み後 秒</label><input type="number" min="0" max="120" step="0.1" name="sets[${idx}][auto_open][after_sec]" value="${set.auto_open?.after_sec ?? 0}">
  <p class="hm-sm-admin__help">ページ読み込みからの経過秒で開きます。0は無効。</p></div>
            <div><label>スクロール %</label><input type="number" min="0" max="100" step="1" name="sets[${idx}][auto_open][on_scroll_percent]" value="${set.auto_open?.on_scroll_percent ?? 0}">
  <p class="hm-sm-admin__help">ページ最上部からのスクロール割合（0〜100）。到達時に開きます。</p></div>
          </div>
          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][auto_open][on_exit]" ${set.auto_open?.on_exit ? 'checked' : ''}> 離脱意図（Exit Intent）</label></div>

          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][url_trigger][enabled]" ${set.url_trigger?.enabled ? 'checked' : ''}> URLで開く</label></div>
          <div class="hm-sm-admin__two">
            <div><label>クエリキー</label><input type="text" class="widefat" name="sets[${idx}][url_trigger][query_key]" value="${set.url_trigger?.query_key || 'hm_modal'}" placeholder="hm_modal">
  <p class="hm-sm-admin__help">URLの ?key=value の key 部分。例：hm_modal。</p></div>
            <div><label>クエリ値(任意)</label><input type="text" class="widefat" name="sets[${idx}][url_trigger][query_value]" value="${set.url_trigger?.query_value || ''}" placeholder="例：open">
  <p class="hm-sm-admin__help">URLの ?key=value の value 部分。空なら key の存在だけで発火。</p></div>
          </div>
          <div class="hm-sm-admin__row">
            <label>ハッシュ(#)</label><input type="text" class="widefat" name="sets[${idx}][url_trigger][hash]" value="${set.url_trigger?.hash || ''}" placeholder="例：hm-modal">
          </div>
<p class="hm-sm-admin__help">URLの #hash に一致した時に開きます。例：#hm-modal。</p>

          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][dynamic_dom][watch]" ${set.dynamic_dom?.watch ? 'checked' : ''}> 遅延DOMを監視してターゲットを待機</label></div>
          <div class="hm-sm-admin__row"><label>監視タイムアウト(ms)</label><input type="number" min="0" max="10000" step="100" name="sets[${idx}][dynamic_dom][timeout_ms]" value="${set.dynamic_dom?.timeout_ms ?? 3000}"></div>
<p class="hm-sm-admin__help">監視の上限時間（ミリ秒）。時間内に見つからない場合は諦めます。</p>
        </div>

        <div class="hm-sm-admin__field">
          <div class="hm-sm-admin__subhead">レイアウト / スケジュール</div>
<p class="hm-sm-admin__help">複製した要素のレイアウト（列数・間隔）と、公開期間/時間/曜日のスケジュール制御を設定します。指定範囲外は表示されません。</p>
          <div class="hm-sm-admin__two">
            <div><label>PC列数</label><input type="number" min="1" max="6" step="1" name="sets[${idx}][layout][pc_cols]" value="${set.layout?.pc_cols ?? 3}">
  <p class="hm-sm-admin__help">PC幅での列数（1〜6推奨）。</p></div>
            <div><label>Tablet列数</label><input type="number" min="1" max="6" step="1" name="sets[${idx}][layout][tab_cols]" value="${set.layout?.tab_cols ?? 2}">
  <p class="hm-sm-admin__help">タブレット幅での列数（1〜6）。</p></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>SP列数</label><input type="number" min="1" max="6" step="1" name="sets[${idx}][layout][sp_cols]" value="${set.layout?.sp_cols ?? 1}">
  <p class="hm-sm-admin__help">スマホ幅での列数（1〜3）。</p></div>
            <div><label>列間隔(px)</label><input type="number" min="0" max="60" step="1" name="sets[${idx}][layout][gap_px]" value="${set.layout?.gap_px ?? 15}">
  <p class="hm-sm-admin__help">要素間の余白。px単位。</p></div>
          </div>

          <div class="hm-sm-admin__row"><label><input type="checkbox" name="sets[${idx}][schedule][enabled]" ${set.schedule?.enabled ? 'checked' : ''}> スケジュールを有効化</label></div>
          <div class="hm-sm-admin__two">
            <div><label>開始日(YYYY-MM-DD)</label><input type="text" class="widefat" name="sets[${idx}][schedule][date_start]" value="${set.schedule?.date_start || ''}">
  <p class="hm-sm-admin__help">公開開始日（例：2025-09-05）。空欄で制限なし。</p></div>
            <div><label>終了日(YYYY-MM-DD)</label><input type="text" class="widefat" name="sets[${idx}][schedule][date_end]" value="${set.schedule?.date_end || ''}">
  <p class="hm-sm-admin__help">公開終了日。空欄で制限なし。</p></div>
          </div>
          <div class="hm-sm-admin__two">
            <div><label>開始時刻(HH:MM)</label><input type="text" class="widefat" name="sets[${idx}][schedule][time_start]" value="${set.schedule?.time_start || ''}" placeholder="09:00">
  <p class="hm-sm-admin__help">1日の表示開始時刻（24時間表記）。空欄で終日。</p></div>
            <div><label>終了時刻(HH:MM)</label><input type="text" class="widefat" name="sets[${idx}][schedule][time_end]" value="${set.schedule?.time_end || ''}" placeholder="18:00">
  <p class="hm-sm-admin__help">1日の表示終了時刻（24時間表記）。空欄で終日。</p></div>
          </div>
          <div class="hm-sm-admin__row">
            <label>曜日</label>
            ${[0,1,2,3,4,5,6].map(d => {
              const on = (set.schedule?.days||[]).includes(d) ? 'checked' : '';
              const labels = ['日','月','火','水','木','金','土'];
              return `<label style="margin-right:12px"><input type="checkbox" name="sets[${idx}][schedule][days][]" value="${d}" ${on}> ${labels[d]}</label>`;
            }).join('')}
          </div>
<p class="hm-sm-admin__help">表示対象の曜日。未選択なら全曜日が対象。</p>
        </div>

        <div class="hm-sm-admin__actions">
          <button type="button" class="button hm-sm-admin__remove" data-remove="${idx}">このセットを削除</button>
          <button type="button" class="button" data-duplicate="${idx}">セットを複製</button>
          <button type="button" class="button" data-moveup="${idx}">上へ</button>
          <button type="button" class="button" data-movedown="${idx}">下へ</button>
        <div class="hm-sm-admin__row hm-sm-admin__row--shortcode"><!-- ショートコード行（各セット個別） -->
          <label>ショートコード</label><!-- ラベル -->
          <code>[hm_sm_trigger set="${idx}"]</code><!-- セット番号を使う例 -->
          <p class="hm-sm-admin__help">各セットの最下部に表示される、このセット専用ショートコードです。コピーして記事等へ貼り付けてください。ブロックエディタでは「HM Smart Modal Trigger」ブロックでも同等です。</p><!-- 説明 -->
        </div>
    
        </div>
      </div>
    </div>
  `);
  
  // --- Enhance cleanup UI without touching template structure ---
  (function hmSmEnhanceCleanupUI(){
    const t = el.find(`[name="sets[${idx}][cleanup_remove_selectors]"]`);
    if (!t.length) return;

    // 1) 安全モードチェックボックスをテキストエリアの直後に追加
    if (!el.find(`[name="sets[${idx}][cleanup_hide]"]`).length) {
      const row = jQuery('<div class="hm-sm-admin__row hm-sm-admin__row--inline"></div>');
      const label = jQuery('<label class="hm-sm-admin__inline"></label>');
      const cb = jQuery('<input type="checkbox" name="sets[${idx}][cleanup_hide]">').prop('checked', !!(set.cleanup_hide));
      label.append(cb).append(' 削除せずに<span style="font-weight:bold;">非表示（display:none）</span>にする（安全モード）');
      row.append(label);
      t.after(row);
    }

    // 2) 説明文はチェックボックスの直後に1本だけ
    const combined = '複製直後に削除/非表示にする要素をCSSセレクタで指定します。1行1つ（カンマ区切りも可）。複数指定可。例：.ad-banner、.sns-share、script[src*="widget"]。安全モードONの場合は削除せず非表示（display:none）にします。';
    const cbRow = t.next(); // 直後の行（上で追加したチェックボックス行）
    let help = cbRow.next('p.hm-sm-admin__help');
    if (help.length) {
      help.text(combined);
    } else {
      help = jQuery('<p class="hm-sm-admin__help"></p>').text(combined);
      cbRow.after(help);
    }
  })();

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
    // s.cleanup_remove_selectors removed (deprecated)
    // s.cleanup_hide removed (deprecated)
    s.internal_link_selector = el.find(`[name="sets[${idx}][internal_link_selector]"]`).val() || 'a';
    s.custom_css = el.find(`[name="sets[${idx}][custom_css]"]`).val() || '';
    s.custom_css_modal = el.find(`[name="sets[${idx}][custom_css_modal]"]`).val() || '';

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
    // Collect modal-button styles (separate from trigger button)
    s.modal_button = {
      bg_color: el.find(`[name="sets[${idx}][modal_button][bg_color]"]`).val() || '#000000',
      bg_opacity: parseFloat(el.find(`[name="sets[${idx}][modal_button][bg_opacity]"]`).val() || '1'),
      text_color: el.find(`[name="sets[${idx}][modal_button][text_color]"]`).val() || '#FFFFFF',
      border_color: el.find(`[name="sets[${idx}][modal_button][border_color]"]`).val() || '#000000',
      border_width_px: parseInt(el.find(`[name="sets[${idx}][modal_button][border_width_px]"]`).val() || '1', 10),
      border_opacity: parseFloat(el.find(`[name="sets[${idx}][modal_button][border_opacity]"]`).val() || '1'),
      hover_bg_color: el.find(`[name="sets[${idx}][modal_button][hover_bg_color]"]`).val() || '#000000',
      hover_bg_opacity: parseFloat(el.find(`[name="sets[${idx}][modal_button][hover_bg_opacity]"]`).val() || '0.85'),
      hover_text_color: el.find(`[name="sets[${idx}][modal_button][hover_text_color]"]`).val() || '#FFFFFF',
      hover_transition_sec: parseFloat(el.find(`[name="sets[${idx}][modal_button][hover_transition_sec]"]`).val() || '0.4'),
    };


    s.modal = {
      size: el.find(`[name="sets[${idx}][modal][size]"]`).val() || 'md',
      max_height_px: parseInt(el.find(`[name="sets[${idx}][modal][max_height_px]"]`).val() || '600', 10),
      max_width_px: parseInt(el.find(`[name="sets[${idx}][modal][max_width_px]"]`).val() || '0', 10),
      min_width_px: parseInt(el.find(`[name="sets[${idx}][modal][min_width_px]"]`).val() || '0', 10),
      min_height_px: parseInt(el.find(`[name="sets[${idx}][modal][min_height_px]"]`).val() || '0', 10),
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


function hmSmBottomFeedback(type, message, scrollTo=true){ // 下部の保存メッセージを出す関数（2秒後にフェードアウト）
  const $el = jQuery('#hm-sm-save-feedback');
  if ($el.length === 0) return;
  $el.removeClass('hm-sm-admin__save-feedback--ok hm-sm-admin__save-feedback--ng hm-sm-admin__save-feedback--progress');
  if (type === 'success') $el.addClass('hm-sm-admin__save-feedback--ok');
  else if (type === 'error') $el.addClass('hm-sm-admin__save-feedback--ng');
  else $el.addClass('hm-sm-admin__save-feedback--progress');
  $el.text(message || '');
  try { document.querySelectorAll('#hm-sm-save-feedback').forEach(function(n){ n.classList.remove('is-hidden'); }); } catch(e){}
  // 2秒後にフェード→背景色を消し、テキストをクリア
  setTimeout(function(){
    document.querySelectorAll('#hm-sm-save-feedback').forEach(function(n){
      n.classList.add('is-hidden'); // フェード開始（opacity:0）
      setTimeout(function(){ // フェード完了後
        n.textContent = ''; // テキスト消去
        n.classList.remove('hm-sm-admin__save-feedback--ok','hm-sm-admin__save-feedback--ng','hm-sm-admin__save-feedback--progress'); // 色枠解除
      }, 500);
    });
  }, 4000);
  if (scrollTo) { $el[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}

jQuery(function($){

  // ==== モーダル/リンク ラジオをタブ風に化粧直し（jQuery） ====
  function hmSmEnhanceTriggerTabs() {                                      // 初期化関数
    $('[data-trigger-wrap]').each(function(){                               // 各セットの「動作タイプ」ブロックを走査
      var $wrap = $(this);                                                  // ラッパ取得
      // ラジオを含むラベルを収集（この順序で2つ想定）
      var $labels = $wrap.children('label').has('input[type="radio"][name$="[trigger_type]"]');
      if (!$labels.length) return;                                          // なければスキップ
      // 既にタブ化済みならスキップ
      if ($wrap.data('hmSmTabsReady')) return;
      $wrap.data('hmSmTabsReady', true);
      // まとめてタブの箱に包む
      $labels.wrapAll('<div class="hm-sm-radio-tabs" />');
      // 選択状態の見た目を同期する関数
      var paint = function(){
        $labels.removeClass('is-active');                                   // いったん全て通常に
        $labels.has('input[type="radio"]:checked').addClass('is-active');   // チェックされている方に色付け
      };
      paint();                                                              // 初期反映
      // クリックでも選択可（ラベル自体がクリックターゲット）
      $wrap.on('change', 'input[type="radio"][name$="[trigger_type]"]', paint);
    });
  }

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
        size:'md', max_height_px:600, max_width_px:0, min_width_px:0, min_height_px:0, scroll_body:true,
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
    const $set = $(this).closest('.hm-sm-admin__set');
    const on = $(this).prop('checked');
    const $b = $set.find('[data-status-badge]');
    $b.text(on ? HM_SM_ADMIN_DATA.texts.enabled : HM_SM_ADMIN_DATA.texts.disabled);
    $b.removeClass('hm-sm-admin__badge--on hm-sm-admin__badge--off');
    $b.addClass(on ? 'hm-sm-admin__badge--on' : 'hm-sm-admin__badge--off');
  });

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



// HM Smart Modal admin: 保存後の下部メッセージを2秒後フェード→削除（確実化）
(function(){ // 即時関数でスコープを閉じる
  // フェード関数（見つかったタイミングから2秒後に開始）
  function scheduleFade(el){ // 関数定義
    if (!el || el.getAttribute('data-hm-sm-faded')) return; // 二重実行防止
    el.setAttribute('data-hm-sm-faded','1'); // フラグ付与
    setTimeout(function(){ // 2秒待機
      el.classList.add('is-hidden'); // フェードアウト開始（opacity:0）
      setTimeout(function(){ // CSS transition終了後
        if (el.parentNode) { el.parentNode.removeChild(el); } // DOMから除去
      }, 500); // 余裕を持って500ms
    }, 4000); // 4秒
  } // 関数終わり

  function findAndFade(){ // 関数定義
    var node = document.getElementById('hm-sm-flash'); // 要素参照
    if (node) { scheduleFade(node); return true; } // 見つかったらスケジュールしてtrue
    return false; // 見つからない
  } // 関数終わり

  // まずはDOMContentLoaded/Loadで実行
  if (document.readyState === 'loading') { // DOM構築前
    document.addEventListener('DOMContentLoaded', function(){ // DOM完成時
      if (!findAndFade()) { // 見つからない場合は監視開始
        observeForFlash(); // 監視関数へ
      } // if終わり
    }, { once: true }); // 一度だけ
  } else { // 既にDOM構築済み
    if (!findAndFade()) { observeForFlash(); } // 見つからなければ監視
  } // if-else終わり

  // 監視：最長5秒間だけ #hm-sm-flash の出現を待つ
  function observeForFlash(){ // 関数定義
    var timeoutId = null; // タイムアウトID
    try { // 例外ガード
      var mo = new MutationObserver(function(){ // DOM変化時
        if (findAndFade()) { // 見つかった場合
          clearTimeout(timeoutId); // タイムアウト解除
          mo.disconnect(); // 監視停止
        } // if終わり
      }); // オブザーバ生成
      mo.observe(document.body, { childList: true, subtree: true }); // 監視開始
      timeoutId = setTimeout(function(){ // 5秒で監視終了
        try { mo.disconnect(); } catch(e){} // 念のため
      }, 5000); // 5秒
    } catch(e){ // 監視に失敗した場合
      // ポーリングのフォールバック（200ms間隔、最大5秒）
      var elapsed = 0; // 経過時間
      var iv = setInterval(function(){ // 繰り返し
        elapsed += 200; // 経過加算
        if (findAndFade() || elapsed >= 5000) { clearInterval(iv); } // 見つかったor5秒経過で停止
      }, 200); // 200ms
    } // try-catch終わり
  } // 関数終わり
})(); // IIFE終わり


// 自動ヘルプ挿入：各フィールドに説明が無ければ、ラベルに応じて案内を付与
function hmSmDescribeField(labelEl, control){
  const t = (labelEl && labelEl.textContent || '').trim();
  if (/カスタムCSS/.test(t)) return 'モーダル表示時のみ適用するCSSを追記できます。テーマと競合しない範囲で最小限に。';
  // removed: help for deprecated field
  if (/テキスト|ラベル|文言/.test(t)) return 'ボタンやモーダルに表示する文字列です。短く明確に。';
  if (/色|カラー/i.test(t)) return '16進カラー（例 #333333）。透明にする場合は rgba() / transparent を使用。';
  if (/サイズ|幅|高さ|px|余白/.test(t)) return '数値（px）で指定。未入力や0は自動サイズとして処理されます。';
  if (/アイコン|SVG/.test(t)) return 'アイコンの有無や形を指定します。装飾目的で使います。';
  if (/表示|非表示|トグル|ON|OFF/.test(t)) return 'この機能のON/OFFを切り替えます。';
  if (/ID|クラス|セレクタ|selector/i.test(t)) return '対象要素を特定するCSSセレクタです。誤指定に注意。';
  return t + ' の説明：この項目の設定を入力してください。';
}
function hmSmEnsureHelps(root){
  try{
    const scope = root || document;
    const fields = scope.querySelectorAll('.hm-sm-admin__field');
    for (const f of fields){
      const hasHelp = f.querySelector('p.hm-sm-admin__help');
      const label = f.querySelector('label');
      const control = f.querySelector('input, select, textarea');
      if (!hasHelp && label && control){
        const p = document.createElement('p');
        p.className = 'hm-sm-admin__help';
        p.textContent = hmSmDescribeField(label, control);
        control.insertAdjacentElement('afterend', p);
      }
    }
  }catch(e){/* noop */}
}
document.addEventListener('DOMContentLoaded', function(){
  const root = document.getElementById('hm-sm-sets') || document;
  hmSmEnsureHelps(root);
  try{
    const mo = new MutationObserver(function(){ hmSmEnsureHelps(root); });
    mo.observe(root, {childList:true, subtree:true});
  }catch(e){}
});
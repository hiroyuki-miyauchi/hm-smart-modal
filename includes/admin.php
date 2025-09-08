<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'admin_menu', 'hm_sm_admin_menu' );
function hm_sm_admin_menu() {
    add_menu_page(
        'HM Smart Modal 設定',
        'HM Smart Modal',
        'manage_options',
        'hm-smart-modal',
        'hm_sm_render_settings_page',
        'dashicons-welcome-widgets-menus',
        58
    );
}

add_action( 'admin_enqueue_scripts', 'hm_sm_admin_assets' );
function hm_sm_admin_assets( $hook ) {
    if ( strpos( $hook, 'hm-smart-modal' ) === false ) { return; }
    wp_enqueue_style( 'wp-color-picker' );
    wp_enqueue_script( 'wp-color-picker' );
    wp_enqueue_style( 'hm-sm-admin', HM_SM_URL . 'assets/css/admin.css', array(), HM_SM_VERSION );
    wp_enqueue_script( 'hm-sm-admin', HM_SM_URL . 'assets/js/admin.js', array( 'jquery', 'wp-color-picker' ), HM_SM_VERSION, true );
    $settings = get_option( HM_SM_OPTION_KEY );
    if ( ! is_array( $settings ) ) { $settings = array(); }
    wp_localize_script( 'hm-sm-admin', 'HM_SM_ADMIN_DATA', array(
        'settings' => $settings,
        'nonce' => wp_create_nonce( 'hm_sm_save' ),
        'postTypes' => hm_sm_get_public_post_types(),
        'texts' => array(
            'addSet' => '＋ セットを追加',
            'removeSet' => 'このセットを削除',
            'duplicateSet' => 'セットを複製',
            'moveUp' => '上へ',
            'moveDown' => '下へ',
            'save' => '変更を保存',
            'export' => 'エクスポート(JSON)',
            'import' => 'インポート(JSON)',
            'enabled' => '有効',
            'disabled' => '無効',
            'toggle' => '開閉'
        ),
    ) );
}

function hm_sm_get_public_post_types() {
    $pts = get_post_types( array( 'public' => true ), 'objects' );
    $out = array();
    foreach ( $pts as $pt ) {
        $out[] = array(
            'name' => $pt->name,
            'label' => $pt->labels->singular_name,
        );
    }
    return $out;
}



// v1.0.1 cleanup: remove deprecated keys from stored options once
add_action( 'admin_init', 'hm_sm_upgrade_cleanup_v101' ); // 管理画面初期化時に一度だけ実行
function hm_sm_upgrade_cleanup_v101(){ // 旧データを検査して不要キーを除去する関数
    $opt = get_option( HM_SM_OPTION_KEY ); // プラグイン設定全体を取得
    if ( ! is_array( $opt ) || empty( $opt['sets'] ) || ! is_array( $opt['sets'] ) ) { return; } // 正常な配列でなければ終了
    $changed = false; // 更新の必要可否フラグ
    foreach ( $opt['sets'] as $i => $set ) { // 各セットを走査
        if ( isset( $set['cleanup_remove_selectors'] ) ) { unset( $opt['sets'][$i]['cleanup_remove_selectors'] ); $changed = true; } // 旧：削除セレクタを除去
        if ( isset( $set['cleanup_hide'] ) ) { unset( $opt['sets'][$i]['cleanup_hide'] ); $changed = true; } // 旧：安全モードを除去
    }
    if ( $changed ) { update_option( HM_SM_OPTION_KEY, $opt ); } // 変更があれば保存
}
// Admin notice: show once about the deprecation; allow dismiss via nonce link
add_action( 'admin_notices', 'hm_sm_admin_notice_cleanup_v101' ); // 管理画面の通知フック
function hm_sm_admin_notice_cleanup_v101(){ // 通知描画処理
    if ( ! current_user_can( 'manage_options' ) ) { return; } // 権限チェック
    if ( get_option( 'hm_sm_notice_cleanup_v101_dismissed' ) ) { return; } // 既に閉じられていれば表示しない
    $first_seen = get_option( 'hm_sm_notice_cleanup_v101_first_seen' ); // 初回表示時刻を取得
    if ( empty( $first_seen ) ) { add_option( 'hm_sm_notice_cleanup_v101_first_seen', time() ); $first_seen = time(); } // 未設定なら今を記録
    $thirty_days = ( defined('DAY_IN_SECONDS') ? (30 * DAY_IN_SECONDS) : (30 * 24 * 60 * 60) ); // 30日秒数
    if ( time() - intval( $first_seen ) >= $thirty_days ) { update_option( 'hm_sm_notice_cleanup_v101_dismissed', 1 ); return; } // 30日経過で自動消滅
    $screen = function_exists('get_current_screen') ? get_current_screen() : null; // 現在の画面情報を取得
    if ( empty($screen) || $screen->id !== 'toplevel_page_hm-smart-modal' ) { return; } // プラグイン設定ページ以外では表示しない

    // Dismiss URL（ワンタイム）：nonce を付与
    $url = wp_nonce_url( add_query_arg( 'hm_sm_dismiss_cleanup_v101', '1', menu_page_url('hm-smart-modal', false) ), 'hm_sm_dismiss_cleanup_v101' ); // 閉じるURL
    echo '<div class="notice notice-info is-dismissible"><p>'; // 情報通知のラッパー
    echo ' <a href="' . esc_url( $url ) . '">' . esc_html__( 'このお知らせを非表示にする', 'hm-smart-modal' ) . '</a>'; // 閉じるリンク
    echo '</p></div>'; // 通知閉じタグ
}
// Handle dismissal once
add_action( 'admin_init', 'hm_sm_admin_notice_cleanup_v101_handle' ); // 初期化時にクエリを検査
function hm_sm_admin_notice_cleanup_v101_handle(){ // 閉じる操作のハンドラ
    if ( isset($_GET['hm_sm_dismiss_cleanup_v101']) && check_admin_referer('hm_sm_dismiss_cleanup_v101') ) { // クエリと nonce 検証
        update_option( 'hm_sm_notice_cleanup_v101_dismissed', 1 ); // 非表示フラグを保存
        wp_safe_redirect( remove_query_arg( array('hm_sm_dismiss_cleanup_v101','_wpnonce') ) ); // クエリを除去してリダイレクト
        exit; // 後続を停止
    }
}

function hm_sm_render_settings_page() {
    if ( ! current_user_can( 'manage_options' ) ) { return; }
    $settings = get_option( HM_SM_OPTION_KEY );
    if ( ! is_array( $settings ) ) {
        $settings = array( 'sets' => array(), 'breakpoint_sp_max' => 767, 'breakpoint_tab_max' => 1024, 'z_index_root'=>999999, 'z_index_trigger'=>999998 );
    }
    ?>
    <div class="wrap hm-sm-admin">
      <div id="hm-sm-notices"></div>
      <h1>HM Smart Modal 設定</h1>
      
      
      <details class="hm-sm-faq hm-sm-faq--wrap"> <!-- 大元もアコーディオンでコンパクト表示 -->
        <summary class="hm-sm-faq__wrapsum"> <!-- タイトル行（最小表示） -->
          <span class="hm-sm-faq__chev" aria-hidden="true"></span> <!-- かくの字（▶/▼） -->
          <span class="hm-sm-faq__title">よくある質問</span> <!-- タイトルテキスト -->
        </summary>
        <div class="hm-sm-faq__panel"> <!-- 開いたときのパネル -->
          <p class="hm-sm-faq__desc">初期設定・使い方・トラブル対応をまとめました。まずはこちらをご確認ください。</p> <!-- 説明文 -->
          <div class="hm-sm-faq__list"> <!-- 質問リスト -->
            <details class="hm-sm-faq__item">
              <summary class="hm-sm-faq__q">初期設定の流れは？</summary>
              <div class="hm-sm-faq__a">
                <ol>
                  <li>「セットを追加」→ タイトルと用途を入力</li>
                  <li>トリガー種別を選択（<strong>モーダル</strong> or <strong>リンク</strong>）</li>
                  <li>モーダルの場合は「複製元セレクタ」を入力（例：<code>.entry-content</code>）</li>
                  <li>URL条件や投稿タイプ条件を必要に応じて設定</li>
                  <li>保存</li>
                </ol>
              </div>
            </details>
            <details class="hm-sm-faq__item">
              <summary class="hm-sm-faq__q">複製元セレクタはどう書く？</summary>
              <div class="hm-sm-faq__a">
                <p>一般的な CSS セレクタが使えます。例：</p>
                <ul>
                  <li><code>.entry-content</code>（クラス）</li>
                  <li><code>#main</code>（ID）</li>
                  <li><code>article .content</code>（子孫セレクタ）</li>
                  <li><code>[data-foo="bar"]</code>（属性セレクタ）</li>
                </ul>
                <p>要素が動的に追加される場合は「遅延DOM監視」を有効にしてください。</p>
              </div>
            </details>
            <details class="hm-sm-faq__item">
              <summary class="hm-sm-faq__q">既存のリンクをボタン風にできますか？</summary>
              <div class="hm-sm-faq__a">
                <p>「内部リンク風ボタン」設定で <code>a</code> 要素等を検出し、見た目をボタン化できます。色・角丸・枠線・サイズを調整してください。</p>
              </div>
            </details>
            <details class="hm-sm-faq__item">
              <summary class="hm-sm-faq__q">ショートコードはどこにありますか？</summary>
              <div class="hm-sm-faq__a">
                <p>各セットの<strong>最下部</strong>に、そのセット専用のショートコード（例：<code>[hm_sm_trigger set="0"]</code>）が表示されます。コピーして記事やウィジェットに貼り付けてください。ブロックエディタでは「HM Smart Modal Trigger」ブロックでも同様に呼び出せます。</p>
              </div>
            </details>
            <details class="hm-sm-faq__item">
              <summary class="hm-sm-faq__q">キーボード操作・アクセシビリティは？</summary>
              <div class="hm-sm-faq__a">
                <p>モーダルはフォーカスをトラップし、<kbd>ESC</kbd> / オーバーレイで閉じます。<code>prefers-reduced-motion</code> に応じてアニメを抑制できます。</p>
              </div>
            </details>
            <details class="hm-sm-faq__item">
              <summary class="hm-sm-faq__q">開かない/表示されない時は？</summary>
              <div class="hm-sm-faq__a">
                <ul>
                  <li>「複製元セレクタ」がページ内に存在するか確認</li>
                  <li>非同期ロードのコンテンツなら「遅延DOM監視」を有効化</li>
                  <li>他プラグイン/テーマの重複CSSやJSエラーをコンソールで確認</li>
                  <li>ショートコードや自動挿入の表示位置を見直し</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </details>
    
    
    
      <p class="hm-sm-admin__note">各項目の下に補足を記載しています。設定後、最下部の「変更を保存」を押してください。</p>

      <form id="hm-sm-form" novalidate>
        <?php wp_nonce_field( 'hm_sm_save', 'hm_sm_nonce' ); ?>

        <div class="hm-sm-admin__grid hm-sm-admin__grid--global">
          <div class="hm-sm-admin__field">
            <label for="hm-sm-breakpoint-sp">SPとして扱う最大幅(px)</label>
            <input type="number" min="320" max="1200" step="1" id="hm-sm-breakpoint-sp" name="breakpoint_sp_max" value="<?php echo esc_attr( intval( $settings['breakpoint_sp_max'] ?? 767 ) ); ?>">
            <p class="hm-sm-admin__help">この数値以下をSP扱い。</p>
          </div>
          <div class="hm-sm-admin__field">
            <label for="hm-sm-breakpoint-tab">Tabletとして扱う最大幅(px)</label>
            <input type="number" min="481" max="1600" step="1" id="hm-sm-breakpoint-tab" name="breakpoint_tab_max" value="<?php echo esc_attr( intval( $settings['breakpoint_tab_max'] ?? 1024 ) ); ?>">
            <p class="hm-sm-admin__help">SP最大幅より大きく、この数値以下をTablet扱い。</p>
          </div>
        </div>

        <div class="hm-sm-admin__grid hm-sm-admin__grid--global">
          <div class="hm-sm-admin__field">
            <label for="hm-sm-z-root">モーダルのz-index</label>
            <input type="number" min="1000" max="2147483647" step="1" id="hm-sm-z-root" name="z_index_root" value="<?php echo esc_attr( intval( $settings['z_index_root'] ?? 999999 ) ); ?>">
            <p class="hm-sm-admin__help">モーダル本体（黒い背景と白いダイアログ）の重なり順です。数値が大きいほど前面に出ます。デフォルトは 0（必要時のみ変更）。</p>
          </div>
          <div class="hm-sm-admin__field">
            <label for="hm-sm-z-trigger">トリガーのz-index</label>
            <input type="number" min="1000" max="2147483647" step="1" id="hm-sm-z-trigger" name="z_index_trigger" value="<?php echo esc_attr( intval( $settings['z_index_trigger'] ?? 999998 ) ); ?>">
            <p class="hm-sm-admin__help">画面端に固定表示されるトリガーボタン用の重なり順です。数値が大きいほど前面に出ます。デフォルトは 0（必要時のみ変更）。</p>
          </div>
        </div>

        <div class="hm-sm-admin__actions">
          <button type="button" class="button button-secondary" id="hm-sm-export">エクスポート(JSON)</button>
          <label class="button button-secondary" for="hm-sm-import">インポート(JSON)</label>
          <input type="file" id="hm-sm-import" accept="application/json" style="display:none">
        </div>

        <div id="hm-sm-sets"></div>

        <div class="hm-sm-admin__actions">
          <button type="button" class="button button-secondary" id="hm-sm-add-set">＋ セットを追加</button>
        </div>

        <hr>

        <div class="hm-sm-admin__actions">
          <button type="button" id="hm-sm-save" class="button button-primary">変更を保存</button>
          <div id="hm-sm-save-feedback" class="hm-sm-admin__save-feedback" role="status" aria-live="polite"></div>
        </div>
      


</form>
    </div>
    <?php
}

add_action( 'wp_ajax_hm_sm_save', 'hm_sm_ajax_save' );
function hm_sm_ajax_save() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_send_json_error( array( 'message' => '権限がありません' ), 403 );
    }
    check_ajax_referer( 'hm_sm_save', 'nonce' );

    $raw = file_get_contents( 'php://input' );
    $data = json_decode( $raw, true );
    if ( ! is_array( $data ) ) {
        wp_send_json_error( array( 'message' => 'データ形式が不正です' ), 400 );
    }

    $clean = array();
    $clean['breakpoint_sp_max'] = isset( $data['breakpoint_sp_max'] ) ? intval( $data['breakpoint_sp_max'] ) : 767;
    $clean['breakpoint_tab_max'] = isset( $data['breakpoint_tab_max'] ) ? intval( $data['breakpoint_tab_max'] ) : 1024;
    $clean['z_index_root'] = isset( $data['z_index_root'] ) ? intval( $data['z_index_root'] ) : 999999;
    $clean['z_index_trigger'] = isset( $data['z_index_trigger'] ) ? intval( $data['z_index_trigger'] ) : 999998;
    $clean['sets'] = array();

    if ( isset( $data['sets'] ) && is_array( $data['sets'] ) ) {
        foreach ( $data['sets'] as $set ) {
            $one = array();
            $one['enabled'] = ! empty( $set['enabled'] );
            $one['auto_inject'] = isset( $set['auto_inject'] ) ? (bool)$set['auto_inject'] : true;
            $one['title'] = sanitize_text_field( $set['title'] ?? '' );
            $one['memo']  = sanitize_textarea_field( $set['memo'] ?? '' );
            $one['apply_on_urls_enabled'] = ! empty( $set['apply_on_urls_enabled'] );
            $one['apply_on_urls'] = wp_kses_post( $set['apply_on_urls'] ?? '' );
            $one['post_types'] = array_map( 'sanitize_text_field', (array)($set['post_types'] ?? array()) );
            $one['trigger_type'] = in_array( $set['trigger_type'] ?? 'modal', array( 'modal', 'link' ), true ) ? $set['trigger_type'] : 'modal';

            $one['link_url'] = esc_url_raw( $set['link_url'] ?? '#' );
            $one['link_new_tab'] = ! empty( $set['link_new_tab'] );
            $one['link_rel_noopener'] = isset( $set['link_rel_noopener'] ) ? (bool)$set['link_rel_noopener'] : true;

            $one['selector_to_clone'] = sanitize_text_field( $set['selector_to_clone'] ?? '' );
            // deprecated: cleanup_remove_selectors ignored
// deprecated: cleanup_hide ignored
$one['internal_link_selector'] = sanitize_text_field( $set['internal_link_selector'] ?? 'a' );
            $one['custom_css'] = $set['custom_css'] ?? '';
            $one['custom_css_modal'] = $set['custom_css_modal'] ?? '';

            $ga = $set['ga4'] ?? array();
            $one['ga4'] = array(
                'enabled' => ! empty( $ga['enabled'] ),
                'event_open' => sanitize_text_field( $ga['event_open'] ?? 'hm_modal_open' ),
                'event_close' => sanitize_text_field( $ga['event_close'] ?? 'hm_modal_close' ),
                'event_link' => sanitize_text_field( $ga['event_link'] ?? 'hm_modal_link_click' ),
                'params_json' => wp_kses_post( $ga['params_json'] ?? '' ),
            );

            $ao = $set['auto_open'] ?? array();
            $one['auto_open'] = array(
                'enabled' => ! empty( $ao['enabled'] ),
                'after_sec' => max(0, floatval( $ao['after_sec'] ?? 0 )),
                'on_exit' => ! empty( $ao['on_exit'] ),
                'on_scroll_percent' => max(0, min(100, floatval( $ao['on_scroll_percent'] ?? 0 ))),
            );

            $ut = $set['url_trigger'] ?? array();
            $one['url_trigger'] = array(
                'enabled' => ! empty( $ut['enabled'] ),
                'query_key' => sanitize_text_field( $ut['query_key'] ?? 'hm_modal' ),
                'query_value' => sanitize_text_field( $ut['query_value'] ?? '' ),
                'hash' => sanitize_text_field( $ut['hash'] ?? '' ),
            );

            $dd = $set['dynamic_dom'] ?? array();
            $one['dynamic_dom'] = array(
                'watch' => ! empty( $dd['watch'] ),
                'timeout_ms' => max(0, intval( $dd['timeout_ms'] ?? 3000 )),
            );

            $ly = $set['layout'] ?? array();
            $one['layout'] = array(
                'pc_cols' => max(1, min(6, intval( $ly['pc_cols'] ?? 3 ))),
                'tab_cols' => max(1, min(6, intval( $ly['tab_cols'] ?? 2 ))),
                'sp_cols' => max(1, min(6, intval( $ly['sp_cols'] ?? 1 ))),
                'gap_px' => max(0, min(60, intval( $ly['gap_px'] ?? 15 ))),
            );

            $btn = $set['button'] ?? array();
            $one['button'] = array(
                'text' => sanitize_text_field( $btn['text'] ?? '応募する' ),
                'font_size_px' => max(1, min(30, intval( $btn['font_size_px'] ?? 15 ))),
                'font_size_px_tab' => max(1, min(30, intval( $btn['font_size_px_tab'] ?? ($btn['font_size_px'] ?? 15) ))),
                'font_size_px_pc' => max(1, min(30, intval( $btn['font_size_px_pc'] ?? ($btn['font_size_px'] ?? 15) ))),
                'position_sp' => sanitize_text_field( $btn['position_sp'] ?? 'bottom-center' ),
                'position_tab' => sanitize_text_field( $btn['position_tab'] ?? 'bottom-center' ),
                'position_pc' => sanitize_text_field( $btn['position_pc'] ?? 'bottom-center' ),
                'shape_sp' => in_array( $btn['shape_sp'] ?? 'rect', array( 'rect','circle' ), true ) ? $btn['shape_sp'] : 'rect',
                'shape_tab' => in_array( $btn['shape_tab'] ?? 'rect', array( 'rect','circle' ), true ) ? $btn['shape_tab'] : 'rect',
                'shape_pc' => in_array( $btn['shape_pc'] ?? 'rect', array( 'rect','circle' ), true ) ? $btn['shape_pc'] : 'rect',
                'w_circle_px' => max(24, min(200, intval( $btn['w_circle_px'] ?? 50 ))),
                'h_circle_px' => max(24, min(200, intval( $btn['h_circle_px'] ?? 50 ))),
                'w_circle_px_tab' => max(24, min(200, intval( $btn['w_circle_px_tab'] ?? ($btn['w_circle_px'] ?? 50) ))),
                'h_circle_px_tab' => max(24, min(200, intval( $btn['h_circle_px_tab'] ?? ($btn['h_circle_px'] ?? 50) ))),
                'w_circle_px_pc' => max(24, min(200, intval( $btn['w_circle_px_pc'] ?? ($btn['w_circle_px'] ?? 50) ))),
                'h_circle_px_pc' => max(24, min(200, intval( $btn['h_circle_px_pc'] ?? ($btn['h_circle_px'] ?? 50) ))),
                'bg_color' => sanitize_hex_color( $btn['bg_color'] ?? '#000000' ),
                'bg_opacity' => floatval( $btn['bg_opacity'] ?? 1.0 ),
                'text_color' => sanitize_hex_color( $btn['text_color'] ?? '#FFFFFF' ),
                'border_color' => sanitize_hex_color( $btn['border_color'] ?? '#000000' ),
                'border_width_px' => max(0, min(20, intval( $btn['border_width_px'] ?? 0 ))),
                'border_opacity' => floatval( $btn['border_opacity'] ?? 1.0 ),
                'radius_value' => floatval( $btn['radius_value'] ?? 0 ),
                'radius_unit' => in_array( $btn['radius_unit'] ?? 'px', array( 'px','%' ), true ) ? $btn['radius_unit'] : 'px',
                'radius_preset' => in_array( $btn['radius_preset'] ?? 'custom', array('none','sm','md','lg','full','custom'), true ) ? ($btn['radius_preset'] ?? 'custom') : 'custom',
                'hover_enabled' => ! empty( $btn['hover_enabled'] ),
                'hover_bg_color' => sanitize_hex_color( $btn['hover_bg_color'] ?? '#000000' ),
                'hover_bg_opacity' => floatval( $btn['hover_bg_opacity'] ?? 0.8 ),
                'hover_text_color' => sanitize_hex_color( $btn['hover_text_color'] ?? '#FFFFFF' ),
                'hover_transition_sec' => max(0, min(5, floatval( $btn['hover_transition_sec'] ?? 0.4 ))),
                'shadow_trigger' => in_array( $btn['shadow_trigger'] ?? 'none', array('none','sm','md','lg','xl','custom'), true ) ? ($btn['shadow_trigger'] ?? 'none') : 'none',
                'shadow_trigger_custom' => sanitize_text_field( $btn['shadow_trigger_custom'] ?? '' ),
            );
            $mb = $set['modal_button'] ?? array();
            $one['modal_button'] = array(
                'bg_color' => sanitize_hex_color( $mb['bg_color'] ?? '' ),
                'bg_opacity' => floatval( $mb['bg_opacity'] ?? 1.0 ),
                'text_color' => sanitize_hex_color( $mb['text_color'] ?? '' ),
                'border_color' => sanitize_hex_color( $mb['border_color'] ?? '' ),
                'border_width_px' => max(0, min(10, intval( $mb['border_width_px'] ?? 1 ))),
                'border_opacity' => floatval( $mb['border_opacity'] ?? 1.0 ),
                'hover_bg_color' => sanitize_hex_color( $mb['hover_bg_color'] ?? '' ),
                'hover_bg_opacity' => floatval( $mb['hover_bg_opacity'] ?? 0.8 ),
                'hover_text_color' => sanitize_hex_color( $mb['hover_text_color'] ?? '' ),
                'hover_transition_sec' => max(0, min(5, floatval( $mb['hover_transition_sec'] ?? 0.4 ))),
            );
        

            $md = $set['modal'] ?? array();
            $one['modal'] = array(
                'size' => in_array( $md['size'] ?? 'md', array( 'sm','md','lg' ), true ) ? $md['size'] : 'md',
                'max_height_px' => max(200, min(2000, intval( $md['max_height_px'] ?? 600 ))),
                'max_width_px' => max(0, min(4000, intval( $md['max_width_px'] ?? 0 ))),
                'min_width_px' => max(0, min(2000, intval( $md['min_width_px'] ?? 0 ))),
                'min_height_px' => max(0, min(2000, intval( $md['min_height_px'] ?? 0 ))),
                'scroll_body' => ! empty( $md['scroll_body'] ),
                'anim_type' => in_array( $md['anim_type'] ?? 'fade', array( 'fade','zoom','slide-up' ), true ) ? $md['anim_type'] : 'fade',
                'anim_sec' => max(0, min(3, floatval( $md['anim_sec'] ?? 0.25 ))),
                'anim_ease' => sanitize_text_field( $md['anim_ease'] ?? 'ease' ),
                'respect_reduced_motion' => ! empty( $md['respect_reduced_motion'] ),
                'overlay_color' => sanitize_hex_color( $md['overlay_color'] ?? '#000000' ),
                'overlay_opacity' => floatval( $md['overlay_opacity'] ?? 0.5 ),
                'bottom_close_enabled' => ! empty( $md['bottom_close_enabled'] ),
                'bottom_close_text' => sanitize_text_field( $md['bottom_close_text'] ?? '閉じる' ),
                'shadow_modal' => in_array( $md['shadow_modal'] ?? 'lg', array('none','sm','md','lg','xl','custom'), true ) ? ($md['shadow_modal'] ?? 'lg') : 'lg',
                'shadow_modal_custom' => sanitize_text_field( $md['shadow_modal_custom'] ?? '' ),
            );

            $sc = $set['schedule'] ?? array();
            $one['schedule'] = array(
                'enabled' => ! empty( $sc['enabled'] ),
                'date_start' => sanitize_text_field( $sc['date_start'] ?? '' ),
                'date_end'   => sanitize_text_field( $sc['date_end'] ?? '' ),
                'days'       => array_map( 'intval', (array)($sc['days'] ?? array()) ),
                'time_start' => sanitize_text_field( $sc['time_start'] ?? '' ),
                'time_end'   => sanitize_text_field( $sc['time_end'] ?? '' ),
            );

            $clean['sets'][] = $one;
        }
    }

    $__prev = get_option( HM_SM_OPTION_KEY ); /* 旧設定を取得 */
if ( is_array($__prev) ) { update_option( HM_SM_OPTION_KEY . '_backup', array( 'time'=> time(), 'data' => $__prev ) ); } /* 1世代バックアップ */
update_option( HM_SM_OPTION_KEY, $clean );
    wp_send_json_success( array( 'message' => '保存しました', 'settings' => $clean ) );
}

// === HM Smart Modal v1.0.7: admin visibility helpers ===
add_filter( 'plugin_row_meta', function( $links, $file, $data ){
    $our = plugin_basename( HM_SM_DIR . 'hm-smart-modal.php' );
    if ( $file === $our ) {
        $links[] = sprintf( 'Version %s', esc_html( HM_SM_VERSION ) );
        $links[] = sprintf( 'WP %s / PHP %s', '5.8+', '7.4+' );
    }
    return $links;
}, 10, 3 );

add_filter( 'admin_footer_text', function( $text ){
    if ( function_exists( 'get_current_screen' ) ) {
        $screen = get_current_screen();
        if ( isset( $screen->id ) && strpos( $screen->id, 'hm-smart-modal' ) !== false ) {
            $text .= ' | HM Smart Modal v' . esc_html( HM_SM_VERSION );
        }
    }
    return $text;
} );
// === End helpers ===

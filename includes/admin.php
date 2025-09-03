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
      <p class="hm-sm-admin__note">各項目の下に補足を記載しています。設定後、最下部の「変更を保存」を押してください。</p>

      <form id="hm-sm-form" novalidate>
        <?php wp_nonce_field( 'hm_sm_save', 'hm_sm_nonce' ); ?>

        <div class="hm-sm-admin__grid">
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

        <div class="hm-sm-admin__grid">
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
            $one['internal_link_selector'] = sanitize_text_field( $set['internal_link_selector'] ?? 'a' );
            $one['custom_css'] = $set['custom_css'] ?? '';

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

            $md = $set['modal'] ?? array();
            $one['modal'] = array(
                'size' => in_array( $md['size'] ?? 'md', array( 'sm','md','lg' ), true ) ? $md['size'] : 'md',
                'max_height_px' => max(200, min(2000, intval( $md['max_height_px'] ?? 600 ))),
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

    update_option( HM_SM_OPTION_KEY, $clean );
    wp_send_json_success( array( 'message' => '保存しました', 'settings' => $clean ) );
}

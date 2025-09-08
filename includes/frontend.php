<?php
if ( ! defined( 'ABSPATH' ) ) { exit; 
}

/**
 * Sanitize/balance user CSS to avoid template breakage.
 */
function hm_sm_sanitize_user_css( $css ) {
    $css = (string) ( $css ?? '' );
    if ( $css === '' ) { return ''; }
    $css = str_replace('</style', '<\/style', $css);
    $open  = substr_count( $css, '{' );
    $close = substr_count( $css, '}' );
    if ( $open > $close ) { $css .= str_repeat( '}', $open - $close ); }
    return $css;
}



add_action( 'wp_enqueue_scripts', 'hm_sm_enqueue_assets' );
function hm_sm_enqueue_assets() {
    $settings = get_option( HM_SM_OPTION_KEY );
    if ( empty( $settings['sets'] ) ) { return; }
    wp_enqueue_style( 'hm-sm-front', HM_SM_URL . 'assets/css/frontend.css', array(), HM_SM_VERSION );
    // HM_SM: inline mobile button CSS based on admin breakpoint
    $hm_settings = get_option( HM_SM_OPTION_KEY );
    $sp_bp = isset($hm_settings['breakpoint_sp_max']) ? intval($hm_settings['breakpoint_sp_max']) : 767;
    if ( $sp_bp < 320 ) { $sp_bp = 320; }
    $hm_sm_inline = "@media (max-width: {$sp_bp}px){"
        . ".hm-sm__actions{flex-direction:column;align-items:center;gap:16px;}"
        . ".hm-sm__content .hm-sm__btn{width:100%;flex:1 0 100%;min-width:0;display:inline-flex;justify-content:center;box-sizing:border-box;}.hm-sm__actions .hm-sm__btn{width:auto;}"
        . "}";
    wp_add_inline_style( 'hm-sm-front', $hm_sm_inline );

    wp_enqueue_script( 'hm-sm-front', HM_SM_URL . 'assets/js/frontend.js', array(), HM_SM_VERSION, true );

    $post_type = '';
    if ( is_singular() ) { $post_type = get_post_type(); }

    wp_localize_script( 'hm-sm-front', 'HM_SM_DATA', array(
        'settings' => $settings,
        'current' => array(
            'url' => home_url( add_query_arg( null, null ) ),
            'postType' => $post_type,
            'isSingular' => is_singular(),
            'spMax' => intval( $settings['breakpoint_sp_max'] ?? 767 ),
            'tabMax' => intval( $settings['breakpoint_tab_max'] ?? 1024 ),
            'zRoot' => intval( $settings['z_index_root'] ?? 0 ),
            'zTrigger' => intval( $settings['z_index_trigger'] ?? 0 ),
        ),
        'i18n' => array(
            'closeLabel' => __( '閉じる', 'hm-smart-modal' ),
        ),
    ) );

    // Add per-set custom CSS (trigger/link & modal) inline for performance and reliability
    if ( ! empty( $settings['sets'] ) && is_array( $settings['sets'] ) ) {
        $inline_css = '';
        $i = 0;
        foreach ( $settings['sets'] as $set ) {
            if ( isset($set['enabled']) && ( $set['enabled'] === '0' || $set['enabled'] === 0 || $set['enabled'] === false ) ) { $i++; continue; }
            $trigger_css = hm_sm_sanitize_user_css( isset( $set['custom_css'] ) ? (string)$set['custom_css'] : '' );
            $modal_css   = hm_sm_sanitize_user_css( isset( $set['custom_css_modal'] ) ? (string)$set['custom_css_modal'] : '' );
            if ( $trigger_css !== '' ) {
                $inline_css .= "\n/* HM Smart Modal set {$i} trigger/link CSS */\n" . $trigger_css . "\n";
            }
            if ( $modal_css !== '' ) {
                $inline_css .= "\n/* HM Smart Modal set {$i} modal CSS (tip: scope with body.hm-sm-open--{$i}) */\n" . $modal_css . "\n";
            }
            $i++;
        }
        if ( $inline_css !== '' ) {
            wp_add_inline_style( 'hm-sm-front', $inline_css );
        }
    }
}

add_action( 'wp_footer', 'hm_sm_render_modal_root' );
function hm_sm_render_modal_root() {
    ?>
    <div id="hm-sm-root" class="hm-sm hm-sm--hidden" aria-hidden="true">
      <div class="hm-sm__overlay" data-hm-sm-close="1"></div>
      <div class="hm-sm__dialog" role="dialog" aria-modal="true" aria-labelledby="hm-sm-title">
        <button type="button" class="hm-sm__close" aria-label="<?php echo esc_attr( __( '閉じる', 'hm-smart-modal' ) ); ?>" data-hm-sm-close="1">
          <span aria-hidden="true">×</span>
        </button>
        <div class="hm-sm__content" id="hm-sm-content"></div>
        <div class="hm-sm__actions">
          <button type="button" class="hm-sm__btn hm-sm__btn--ghost hm-sm__btn-close" data-hm-sm-close="1"><?php echo esc_html( __( '閉じる', 'hm-smart-modal' ) ); ?></button>
        </div>
      </div>
    </div>
    <?php
}


add_action( 'wp_head', 'hm_sm_print_custom_css', 99 );
function hm_sm_print_custom_css() {
    $settings = get_option( HM_SM_OPTION_KEY );
    if ( empty( $settings['sets'] ) || ! is_array( $settings['sets'] ) ) { return; }
    $inline_css = '';
    $i = 0;
    foreach ( $settings['sets'] as $set ) {
        if ( isset($set['enabled']) && ( $set['enabled'] === '0' || $set['enabled'] === 0 || $set['enabled'] === false ) ) { $i++; continue; }
        $trigger_css = hm_sm_sanitize_user_css( isset( $set['custom_css'] ) ? (string)$set['custom_css'] : '' );
        $modal_css   = hm_sm_sanitize_user_css( isset( $set['custom_css_modal'] ) ? (string)$set['custom_css_modal'] : '' );
        if ( $trigger_css !== '' ) {
            $inline_css .= "\n/* HM Smart Modal set {$i} trigger/link CSS */\n" . $trigger_css . "\n";
        }
        if ( $modal_css !== '' ) {
            $inline_css .= "\n/* HM Smart Modal set {$i} modal CSS (tip: scope with body.hm-sm-open--{$i}) */\n" . $modal_css . "\n";
        }
        $i++;
    }
    if ( $inline_css === '' ) { return; }
    echo "<style id=\"hm-sm-inline-css\">" . $inline_css . "</style>";
}

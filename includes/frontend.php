<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'wp_enqueue_scripts', 'hm_sm_enqueue_assets' );
function hm_sm_enqueue_assets() {
    $settings = get_option( HM_SM_OPTION_KEY );
    if ( empty( $settings['sets'] ) ) { return; }
    wp_enqueue_style( 'hm-sm-front', HM_SM_URL . 'assets/css/frontend.css', array(), HM_SM_VERSION );
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

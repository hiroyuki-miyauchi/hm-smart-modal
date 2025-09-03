<?php /* MIT Licensed */ ?>
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
        <h2 id="hm-sm-title" class="hm-sm__sr-only"><?php echo esc_html( get_bloginfo( "name" ) . " modal" ); ?></h2>
        <div class="hm-sm__content" id="hm-sm-content"></div>
        <div class="hm-sm__actions">
          <button type="button" class="hm-sm__btn hm-sm__btn--ghost hm-sm__btn-close" data-hm-sm-close="1"><?php echo esc_html( __( '閉じる', 'hm-smart-modal' ) ); ?></button>
        </div>
      </div>
    </div>

    <?php
    // カスタムCSSを各セットから集約してstyleタグで注入（XSS対策で最低限のサニタイズを行う）
    $__hm_sm_settings_for_css = is_array( $settings ) ? ($settings['sets'] ?? array()) : array();
    $__hm_sm_css_output = '';
    foreach ( $__hm_sm_settings_for_css as $__i => $__set ) {
        if ( empty($__set['custom_css']) ) { continue; }
        // 改行を正規化し、閉じタグの無効化でXSS対策を最低限実施
        $__css = (string) $__set['custom_css'];
        $__css = str_replace(array('</style', '</STYLE'), array('<\\/style', '<\\/STYLE'), $__css);
        $__hm_sm_css_output .= "\\n/* hm-smart-modal set #{${'__i'}} */\\n" . $__css . "\\n";
    }
    if ( $__hm_sm_css_output !== '' ) {
        echo '<style data-hm-sm-custom-css="1">' . $__hm_sm_css_output . '</style>';
    }
    ?>
    
    <?php
}

add_action( 'wp_head', 'hm_sm_output_ga4', 5 );
function hm_sm_output_ga4(){
    $settings = get_option( HM_SM_OPTION_KEY );
    if ( empty( $settings['ga4_autoload'] ) ) { return; }
    $mid = isset($settings['ga4_measurement_id']) ? trim($settings['ga4_measurement_id']) : '';
    if ( $mid === '' ) { return; }
    ?>
    <script>
    (function(){
      try{
        if (window.gtag) return;
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        var hasSrc = !!document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
        if (!hasSrc){
          var s=document.createElement('script');
          s.async=true;
          s.src='https://www.googletagmanager.com/gtag/js?id=<?php echo esc_js($mid); ?>';
          s.id='hm-sm-gtag';
          document.head.appendChild(s);
        }
        gtag('config', '<?php echo esc_js($mid); ?>');
      }catch(e){}
    })();
    </script>
    <?php
}

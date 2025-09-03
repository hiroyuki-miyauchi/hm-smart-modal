<?php /* MIT Licensed */ ?>
<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

add_shortcode( 'hm_sm_trigger', function( $atts ){
    $atts = shortcode_atts( array(
        'set' => 0,
        'text' => '',
    ), $atts, 'hm_sm_trigger' );
    $idx = intval( $atts['set'] );
    $text = sanitize_text_field( $atts['text'] );
    $settings = get_option( HM_SM_OPTION_KEY );
    if ( ! isset( $settings['sets'][$idx] ) ) { return ''; }
    $set = $settings['sets'][$idx];
    if ( $text === '' ) { $text = $set['button']['text'] ?? '応募する'; }
    $html = '<a href="#" class="hm-sm-trigger" data-hm-sm-index="'.esc_attr($idx).'" data-hm-sm-manual="1">'.esc_html($text).'</a>';
    return $html;
});

add_action( 'init', function(){
    wp_register_script(
        'hm-sm-block',
        HM_SM_URL . 'assets/js/block.js',
        array( 'wp-blocks','wp-element','wp-editor','wp-components','wp-i18n' ),
        HM_SM_VERSION,
        true
    );
    register_block_type( 'hm/smart-modal-trigger', array(
        'api_version' => 2,
        'editor_script' => 'hm-sm-block',
        'render_callback' => function( $attrs ){
            $idx  = isset($attrs['set']) ? intval($attrs['set']) : 0;
            $text = isset($attrs['text']) ? sanitize_text_field($attrs['text']) : '';
            $settings = get_option( HM_SM_OPTION_KEY );
            if ( ! isset( $settings['sets'][$idx] ) ) { return ''; }
            $set = $settings['sets'][$idx];
            if ( $text === '' ) { $text = $set['button']['text'] ?? '応募する'; }
            return '<a href="#" class="hm-sm-trigger" data-hm-sm-index="'.esc_attr($idx).'" data-hm-sm-manual="1">'.esc_html($text).'</a>';
        },
        'attributes' => array(
            'set'  => array( 'type' => 'number', 'default' => 0 ),
            'text' => array( 'type' => 'string', 'default' => '' ),
        ),
        'title' => 'HM Smart Modal Trigger',
        'description' => 'Place a Smart Modal trigger for a specific set.',
        'category' => 'widgets',
        'icon' => 'megaphone',
        'supports' => array( 'html' => false ),
    ) );
});

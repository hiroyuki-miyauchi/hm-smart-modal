<?php
/**
 * Plugin Name: HM Smart Modal
 * Plugin URI: https://github.com/hiroyuki-miyauchi/hm-smart-modal
 * Description: Clone existing content by selector to show in an accessible modal, or place a configurable link button. Multiple sets, URL/post type conditions, PC/Tablet/SP options. Vanilla JS. Shortcode & Block.
 * Version: 1.0.7
 * Author: hiroyuki miyauchi
 * Author URI: https://chronoviq.com/about-author/
 * License: MIT
 * Text Domain: hm-smart-modal
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'HM_SM_VERSION', '1.0.7' );
define( 'HM_SM_SLUG', 'hm-smart-modal' );
define( 'HM_SM_DIR', plugin_dir_path( __FILE__ ) );
define( 'HM_SM_URL', plugin_dir_url( __FILE__ ) );
define( 'HM_SM_OPTION_KEY', 'hm_sm_settings' );

add_action( 'plugins_loaded', function(){
    load_plugin_textdomain( 'hm-smart-modal', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
});

register_activation_hook( __FILE__, 'hm_sm_activate' );
function hm_sm_activate() {
    $existing = get_option( HM_SM_OPTION_KEY );
    if ( $existing !== false ) { return; }
    $default = array(
        'breakpoint_sp_max' => 767,
        'breakpoint_tab_max' => 1024,
        'z_index_root' => 0,
        'z_index_trigger' => 0,
        'sets' => array(
            array(
                'enabled' => true,
                'auto_inject' => true,
                'title' => 'デフォルトセット',
                'memo'  => '',
                'apply_on_urls_enabled' => false,
                'apply_on_urls' => "",
                'post_types' => array( 'post', 'page' ),
                'trigger_type' => 'modal',
                'link_url' => '#',
                'link_new_tab' => false,
                'link_rel_noopener' => true,
                'selector_to_clone' => 'main, .entry-content',
                'internal_link_selector' => 'a',
                'custom_css' => '',
                'ga4' => array(
                    'enabled' => false,
                    'event_open' => 'hm_modal_open',
                    'event_close' => 'hm_modal_close',
                    'event_link' => 'hm_modal_link_click',
                    'params_json' => ''
                ),
                'auto_open' => array(
                    'enabled' => false,
                    'after_sec' => 0,
                    'on_exit' => false,
                    'on_scroll_percent' => 0
                ),
                'url_trigger' => array(
                    'enabled' => false,
                    'query_key' => 'hm_modal',
                    'query_value' => '',
                    'hash' => ''
                ),
                'dynamic_dom' => array(
                    'watch' => false,
                    'timeout_ms' => 3000
                ),
                'layout' => array(
                    'pc_cols' => 3,
                    'tab_cols' => 2,
                    'sp_cols' => 1,
                    'gap_px' => 15
                ),
                'button' => array(
                    'text' => '応募する',
                    'font_size_px' => 15,
                    'font_size_px_tab' => 15,
                    'font_size_px_pc' => 15,
                    'position_sp' => 'bottom-center',
                    'position_tab' => 'bottom-center',
                    'position_pc' => 'bottom-center',
                    'shape_sp' => 'rect',
                    'shape_tab' => 'rect',
                    'shape_pc' => 'rect',
                    'w_circle_px' => 50,
                    'h_circle_px' => 50,
                    'w_circle_px_tab' => 50,
                    'h_circle_px_tab' => 50,
                    'w_circle_px_pc' => 50,
                    'h_circle_px_pc' => 50,
                    'bg_color' => '#000000',
                    'bg_opacity' => 1.0,
                    'text_color' => '#FFFFFF',
                    'border_color' => '#000000',
                    'border_width_px' => 0,
                    'border_opacity' => 1.0,
                    'radius_value' => 0,
                    'radius_unit' => 'px',
                    'radius_preset' => 'custom',
                    'hover_enabled' => true,
                    'hover_bg_color' => '#000000',
                    'hover_bg_opacity' => 0.8,
                    'hover_text_color' => '#FFFFFF',
                    'hover_transition_sec' => 0.4,
                    'shadow_trigger' => 'none',
                    'shadow_trigger_custom' => ''
                ),
                'modal' => array(
                    'size' => 'md',
                    'max_height_px' => 600,
                    'scroll_body' => true,
                    'anim_type' => 'fade',
                    'anim_sec' => 0.25,
                    'anim_ease' => 'ease',
                    'respect_reduced_motion' => true,
                    'overlay_color' => '#000000',
                    'overlay_opacity' => 0.5,
                    'bottom_close_enabled' => true,
                    'bottom_close_text' => '閉じる',
                    'shadow_modal' => 'lg',
                    'shadow_modal_custom' => '',
                ),
                'schedule' => array(
                    'enabled' => false,
                    'date_start' => '',
                    'date_end'   => '',
                    'days' => array(),
                    'time_start' => '',
                    'time_end'   => ''
                )
            ),
        ),
    );
    add_option( HM_SM_OPTION_KEY, $default );
}

require_once HM_SM_DIR . 'includes/admin.php';
require_once HM_SM_DIR . 'includes/frontend.php';
require_once HM_SM_DIR . 'includes/shortcode_block.php';

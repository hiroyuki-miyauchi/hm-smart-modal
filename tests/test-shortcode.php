<?php

// minimal WordPress stubs
function add_shortcode($tag, $func){
    $GLOBALS['hm_sm_shortcode'] = $func;
}
function add_action($hook, $func){
    // no-op for block registration
}
function shortcode_atts($pairs, $atts, $shortcode = ''){
    return array_merge($pairs, (array) $atts);
}
function sanitize_text_field($text){
    return trim($text);
}
function get_option($key){
    global $fake_settings;
    return $fake_settings;
}
function esc_attr($text){ return $text; }
function esc_html($text){ return $text; }

// constants expected by plugin files
if (!defined('ABSPATH')){ define('ABSPATH', __DIR__); }
if (!defined('HM_SM_OPTION_KEY')){ define('HM_SM_OPTION_KEY', 'hm_sm_settings'); }

// fake settings
$fake_settings = [
    'sets' => [
        [ 'button' => [ 'text' => '応募する' ] ]
    ]
];

require __DIR__ . '/../includes/shortcode_block.php';

$cb = $GLOBALS['hm_sm_shortcode'];

// when the requested set is missing, shortcode returns empty string
assert($cb(['set' => 1]) === '');

// when text is omitted, uses button text from set
assert($cb(['set' => 0]) === '<a href="#" class="hm-sm-trigger" data-hm-sm-index="0" data-hm-sm-manual="1">応募する</a>');


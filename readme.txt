=== HM Smart Modal (by HM) ===
Contributors: hiroyuki-miyauchi
Tags: modal, button, ui, accessibility, vanilla js, shortcode, block
Requires at least: 5.8
Tested up to: 6.6
Stable tag: 1.0.1
License: MIT
License URI: https://opensource.org/licenses/MIT

Clone existing content on the page by CSS selector and show it inside an accessible modal, or place a configurable link button. 
Multiple sets, PC/Tablet/SP options, rich design controls, GA4 events, auto/open by URL, import/export JSON, shortcode & block.

== Description ==
- Multiple **modal/link sets** with URL & post type conditions.
- **Clone by CSS selector** (supports attribute selectors like `[data-foo="bar"]`). MutationObserver option for late-loaded DOM.
- **Accessible modal** (keyboard trap, ARIA, ESC/overlay close, reduced-motion).
- **PC/Tablet/SP settings**: position & shape.
- **Design controls**: border, radius(px/%), **radius presets**, hover colors & **transition time**, **shadow presets**.
- **Modal**: size (sm/md/lg), max-height, scroll body, **easing selection**, open animation duration.
- **GA4 events** (open/close/link) with optional custom params.
- **Auto-open conditions** (delay sec / exit-intent / scroll %).
- **URL trigger** (query or hash), **shortcode** `[hm_sm_trigger set="0" text="応募する"]`, and a basic Gutenberg block.
- **Import/Export JSON** + per-set memo. 
- **Z-index overrides**. **iOS overscroll fix**.

== Installation ==
1. Upload `hm-smart-modal` to `/wp-content/plugins/` and activate.
2. Go to **HM Smart Modal** from the left admin menu to configure.
3. To place a manual trigger: use shortcode `[hm_sm_trigger set="0"]` or the block “HM Smart Modal Trigger”.

== Changelog ==
= 1.0.1 =
* Initial prerelease + extended options (easing, shadows, GA4, auto-open, URL triggers, shortcode/block, import/export, 3-tier breakpoints).

== Credits ==
Author: hiroyuki miyauchi

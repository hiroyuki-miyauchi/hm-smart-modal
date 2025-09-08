=== HM Smart Modal (by HM) ===
Homepage: https://github.com/hiroyuki-miyauchi/hm-smart-modal
Author URI: https://chronoviq.com/about-author/
Contributors: hiroyuki-miyauchi
Tags: modal, button, ui, accessibility, vanilla js, shortcode, block
Requires at least: 5.8
Tested up to: 6.6
Stable tag: 1.0.7
Requires PHP: 7.4
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
= 1.0.1 (追加修正7) =
* Improvement: **移行ガード**を追加（設定ページに一度だけお知らせ表示・非表示可）。
* Improvement: **DBクリーンアップ**を追加（旧 `cleanup_*` キーを自動削除）。
* Improvement: **管理ヘルプの簡素化**（関連説明の削除・整理）。

= 1.0.1 (追加修正6) =
* Feature: セットごとに「角丸」「枠線（太さ/スタイル/カラー）」「フォント太さ」「letter-spacing」を指定可能に。管理画面では「サイズ（円形のとき）」の手前に追加。

= 1.0.1 (追加修正4) =
* Feature: デフォルト（長方形）のトリガーボタンにもサイズ指定を追加（SP/Tablet/PCの幅・高さを個別指定。未指定は自動）。
* Fix: 管理画面のラベル余白を調整（`.hm-sm-admin__field label { margin-right:10px; }` / `.hm-sm-radio-tabs label { margin:0; }`）。


= 1.0.1 (追加修正4) =
* Feature: モーダルに **最大幅(px)／最小幅(px)／最小高さ(px)** を追加。0または未入力時は既定値を使用し、後方互換を維持。

= 1.0.1 (追加修正3) =
* Feature: 複製後クリーンアップオプションを追加（削除タグの任意入力、指定条件に一致しない a の一括削除）。
* Fix: 管理画面のラジオタブで白い帯が残る余白を調整（`.hm-sm-radio-tabs .hm-sm-admin__field label { margin-bottom:0; }`）。

= 1.0.1 (追加修正2) =
* Fix: `.hm-sm` の表示制御を補強（`.hm-sm:not(.hm-sm--hidden)` と `.hm-sm--enter/.hm-sm--leave` で `display:block`）。クラス切替で確実に可視化。
* Fix: 下部ボタン領域のボーダーが残るケースを再修正（`border-top: none`）。
* Fix: 管理画面の下部メッセージがフェードしない環境に対応（`admin.js` を設定ページ限定でenqueue）。

= 1.0.1 =
* Initial prerelease + extended options (easing, shadows, GA4, auto-open, URL triggers, shortcode/block, import/export, 3-tier breakpoints).

== Credits ==
Author: hiroyuki miyauchi
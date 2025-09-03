/* HM Smart Modal – Admin Help Notes (non-destructive)
 * 各セットと各ブロックの先頭に、用途と効果の簡易説明を自動挿入します。
 */
(function(){
  'use strict';
  if (!document.getElementById('hm-sm-sets')) return;

  function onReady(fn){ if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  // 見出しテキスト→説明のマッピング（部分一致/正規表現）
  const HELP = [
    { re: /動作タイプ/, html: [
      '表示方法を選びます。<strong>モーダルで表示</strong>はページ内の要素を複製してポップアップ表示、<strong>ただのリンク</strong>は固定ボタンから指定先へ移動します。',
      '例）複製元セレクタ：<code>main, .entry-content</code>／ボタン化する要素：<code>a</code>（a要素を自動でボタン風に整形）'
    ]},
    { re: /トリガーボタン/, html: [
      '画面の隅に固定表示される「開くボタン」のデザインと位置を設定します（SP/Tablet/PC 個別）。',
      '背景色・文字色・枠線・角丸・ホバー時の変化・影、円形／長方形の切替などが可能です。'
    ]},
    { re: /^モーダル$/, html: [
      'モーダル本体のサイズやアニメーション、背景（オーバーレイ）を設定します。',
      'サイズは <code>sm/md/lg</code> のプリセット。閉じる操作は「×」「外クリック」「ESC」に対応。必要に応じて下部に閉じるボタンを追加できます。'
    ]},
    { re: /レイアウト\s*[\/・]\s*スケジュール/, html: [
      '配置や稼働期間・曜日・時間帯などをまとめて管理します。',
      '例）キャンペーン期間だけ表示／深夜は非表示 などの運用が可能です。'
    ]},
    { re: /対象URL|条件|投稿タイプ/, html: [
      '表示対象のページ条件です。URLマッチ（list/prefix/regex）と投稿タイプを指定できます。未指定なら全ページが対象です。',
      'list では <code>*</code> が任意文字、先頭 <code>!</code> で除外ルールになります。'
    ]},
    { re: /自動オープン|自動表示|トリガー/, html: [
      '条件を満たしたとき自動でモーダルを開きます（秒後／離脱意図／スクロール%）。',
      '例）<code>3</code>秒後に自動開く、または<code>50%</code>スクロール時に開く 等。過度な自動表示はUX悪化の恐れがあるため控えめ推奨。'
    ]},
    { re: /GA4/i, html: [
      'GA4にイベントを送信します。<strong>テーマやタグマネで gtag を導入済みの環境のみ動作</strong>します（本プラグインは自動読込しません）。',
      'open/close/link の各イベント名や追加パラメータ(JSON)を設定できます。'
    ]},
    { re: /カスタムCSS/, html: [
      'このセット専用のCSSを追加します。モーダル直後に挿入されるため、デフォルトスタイルの上書きに適しています。',
      '例）<code>.hm-sm__modal .btn { font-weight: 700; }</code>'
    ]},
    { re: /メモ/, html: [
      '運用メモを残せます（表示には影響しません）。複製・引き継ぎ時の注意点などを記載してください。'
    ]}
  ];

  function makeIntroBox(lines, klass){
    const div = document.createElement('div');
    div.className = 'hm-sm-admin__intro ' + (klass||'');
    div.setAttribute('data-help-added','1');
    div.innerHTML = lines.map(t=> `<p>${t}</p>`).join('');
    return div;
  }

  function injectSetIntro(setEl){
    const content = setEl.querySelector('.hm-sm-admin__content');
    if (!content || content.querySelector('.hm-sm-admin__intro--set')) return;
    const lines = [
      'この「セット」は、トリガーボタンとモーダルの<strong>1組</strong>です。タイトルで用途を判別しやすくしてください。',
      '上部の「有効」にチェックがあるセットのみ、条件に合致したページで表示されます。',
      '複数のセットを作成し、URLや投稿タイプごとに出し分けることができます。'
    ];
    const intro = makeIntroBox(lines, 'hm-sm-admin__intro--set');
    content.insertBefore(intro, content.firstChild);
  }

  function injectBlockIntros(setEl){
    setEl.querySelectorAll('.hm-sm-admin__field').forEach(function(field){
      if (field.querySelector('.hm-sm-admin__intro')) return;
      const head = field.querySelector(':scope > .hm-sm-admin__subhead');
      if (!head) return;
      const title = head.textContent.trim();
      const rule = HELP.find(h => h.re.test(title));
      if (!rule) return;
      const intro = makeIntroBox(rule.html);
      head.insertAdjacentElement('afterend', intro);
    });
  }

  function enhance(){
    document.querySelectorAll('.hm-sm-admin__set').forEach(function(setEl){
      injectSetIntro(setEl);
      injectBlockIntros(setEl);
    });
  }

  // 初回 & DOM変化監視
  const root = document.getElementById('hm-sm-sets');
  if (root){
    let __hmHelpQueued = false;
    const mo = new MutationObserver(function(){
      if (__hmHelpQueued) return; __hmHelpQueued = true;
      setTimeout(function(){ __hmHelpQueued = false; try{ enhance(); }catch(e){} }, 80);
    });
    mo.observe(root, {childList:true, subtree:true});
  }
  onReady(enhance);

})();
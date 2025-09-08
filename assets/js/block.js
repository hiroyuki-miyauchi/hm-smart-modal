( function( blocks, element, editor, components, i18n ) {
  const { registerBlockType } = blocks;
  const { createElement: el, Fragment } = element;
  const { InspectorControls } = editor;
  const { PanelBody, TextControl, RangeControl } = components;
  const __ = i18n.__;

  registerBlockType('hm/smart-modal-trigger', {
    title: __('HM Smart Modal Trigger', 'hm-smart-modal'),
    description: __('Place a modal trigger for a selected set.', 'hm-smart-modal'),
    icon: 'megaphone',
    category: 'widgets',
    attributes: { set: { type: 'number', default: 0 }, text: { type: 'string', default: '' } },
    edit: (props) => {
      const { attributes, setAttributes } = props;
      return el(Fragment, {},
        el(InspectorControls, {},
          el(PanelBody, { title: __('Trigger Settings', 'hm-smart-modal'), initialOpen: true },
            el(RangeControl, { label: __('Set Index', 'hm-smart-modal'), min: 0, max: 50, value: attributes.set, onChange: (v)=> setAttributes({ set: v }) }),
            el(TextControl, { label: __('Text (optional)', 'hm-smart-modal'), value: attributes.text, onChange: (v)=> setAttributes({ text: v }) })
          )
        ),
        el('div', { style: { padding: '8px', border: '1px dashed #ccc' } },
          el('strong', {}, __('HM Smart Modal Trigger', 'hm-smart-modal')),
          el('div', {}, __('Set #', 'hm-smart-modal') + attributes.set),
          el('div', {}, attributes.text ? attributes.text : __('(uses set button text)', 'hm-smart-modal'))
        )
      );
    },
    save: () => null,
    supports: { html: false }
  });
})( window.wp.blocks, window.wp.element, window.wp.editor, window.wp.components, window.wp.i18n );

/**
 * app chrome extension manifest configuration
 * @type {Object}
 */
const name = 'Smart Link';
const manifest = {
  name: name,
  description: 'Smart Link, created by Anxon.',
  author: 'Anxon',
  version: '0.3.70',
  permissions: [
    'contextMenus',
  ],
  content_scripts: [{
      matches: [
        '<all_urls>'
      ],
      js: [
        'js/lib/vendor.js',
        'js/lib/anxon.js',
      ],
      run_at: 'document_start',
    },
    {
      matches: [
        '<all_urls>'
      ],
      js: [
        'js/frontend.js',
      ],
      run_at: 'document_start',
    }
  ],
  background: {
    scripts: [
      'js/lib/i18n.js',
      'js/backend.js',
    ]
  },
  options_page: 'html/options.html',
  browser_action: {
    default_title: name,
    default_popup: 'html/popup.html'
  }
};

module.exports = manifest;
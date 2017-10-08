/**
 * app chrome extension manifest configuration
 * @type {Object}
 */
const name = 'Smart Link';
const manifest = {
  name: name,
  description: 'Smart Link. 设置某些页面(甚至可以是页面里的某个区块)链接的打开方式，以更适应您的使用习惯。Modify hyperlinks open mode, for specified pages, even specified blocks on the page.',
  author: 'Anxon',
  version: '0.3.85',
  minimum_chrome_version: '41',
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
      all_frames: true,
    },
    {
      matches: [
        '<all_urls>'
      ],
      js: [
        'js/lib/i18n.js',
        'js/frontend.js',
      ],
      css: [
        'css/frontend.css',
      ],
      run_at: 'document_start',
      all_frames: true,
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
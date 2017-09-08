/**
 * basic chrome extension manifest configuration
 * https://developer.chrome.com/extensions/manifest
 * @type {Object}
 */
const manifest = {
  name: 'Anxon',
  version: '0.0.1',
  manifest_version: 2,
  description: 'Anxon',
  author: 'Ansonhorse <ansonhorse@gmail.com>',
  content_security_policy: "script-src 'self' 'unsafe-eval'; object-src 'self'",
  // https://developer.chrome.com/extensions/permissions
  permissions: [
    // https://developer.chrome.com/extensions/tabs
    "tabs",
    "http://*/",
    "https://*/*",
    "<all_urls>",
    "storage",
    "background",
    "activeTab",
  ],
  
  icons: {
    16: 'img/icon_16.png',
    48: 'img/icon_48.png',
    128: 'img/icon_128.png'
  },

  background: {
    scripts: [
      'js/lib/vendor.js',
      'js/lib/anxon.js',
    ]
  },

  web_accessible_resources: [
    'js/*',
    'img/*',
    'css/*',
    'fonts/*',
    'sourcemap/*',
  ]
};

module.exports = manifest;
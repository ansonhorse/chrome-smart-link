const path = require('path');

const ROOT_PATH = path.resolve(__dirname, '../') + '/';

function beautify(script) {
  const beautify = require('js-beautify').js_beautify;
  script = beautify(script, {
    indent_size: 2,
  });
  return script;
}

module.exports = {
  ROOT_PATH: ROOT_PATH,
  
  TEMPLATE_PATH: ROOT_PATH + 'build/template/',
  GENERATORS_PATH: ROOT_PATH + 'build/generators/',
  SECTIONS_PATH: ROOT_PATH + 'build/sections/',

  ANXON_PATH: ROOT_PATH + 'anxon/',
  SRC_PATH: ROOT_PATH + 'src/',
  APPS_PATH: ROOT_PATH + 'apps/',
  DIST_PATH: ROOT_PATH + 'dist/',
  RELEASE_PATH: ROOT_PATH + 'release/',

  beautify: beautify,
};
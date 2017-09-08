const commander = require('commander');
const colors = require('colors');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const mergeConfig = require('webpack-merge');
const inquirer = require('inquirer');

const utils = require('./utils.js');
const common = require('./common.js');

commander
  .version('0.0.1')
  .option('--app [app]', 'The app name')
  .option('--dev', 'Build for development')
  .option('--prod', 'Build for production')
  .option('--release', 'Realse')
  .parse(process.argv);

global.commander = commander;

if (typeof commander.app !== 'string' || commander.app === '') {
  let _files = fs.readdirSync(common.APPS_PATH);
  let _appDirList = [];
  let _fileInfo = null;
  for (let _i = 0; _i < _files.length; _i++) {
    _fileInfo = fs.statSync(common.APPS_PATH + _files[_i]);
    if (_fileInfo.isDirectory()) {
      _appDirList.push(_files[_i]);
    }
  }
  if (!_appDirList.length) {
    console.log(colors.red('There is no apps!'));
    process.exit();
  }

  let questions = [{
    name: 'dir',
    type: 'list',
    message: 'Please choose the app to be built:',
    choices: _appDirList,
  }]

  inquirer.prompt(questions).then(function (answers) {
    commander.app = answers.dir;
    _build();
  });

} else {

  _build();
  
}

function _build() {

  const APP_PATH = common.APPS_PATH + commander.app;

  // check if the app directory is exist
  if (!fs.existsSync(APP_PATH)) {
    console.log('App [%s] not found in %s!'.red, commander.app, APP_PATH);
    process.exit();
  }

  // check if the app has a webpack.js file
  if (!fs.existsSync(APP_PATH + '/webpack.js')) {
    console.log('App [%s] does not have a webpack.conf.js file!'.red, commander.app);
    process.exit();
  }

  // check if the app has a manifest.js file
  if (!fs.existsSync(APP_PATH + '/manifest.js')) {
    console.log('App [%s] does not have a manifest.js file!'.red, commander.app);
    process.exit();
  }

  const appConfig = require(APP_PATH + '/webpack.js');
  const basicConfig = require('./webpack.base.js');

  let extraConfig = {};

  if (commander.dev) {
    extraConfig = {
      // devtool: 'cheap-module-source-map',
      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: '"production"'
          }
        }),
        
        new webpack.HotModuleReplacementPlugin(),
      ]
    };
  }

  if (commander.prod || commander.release) {
    // banner, prefer the app's banner, if the app doesn't have a banner, use the common banner
    let bannerFile = APP_PATH + '/banner.js';
    if (!fs.existsSync(bannerFile))
      bannerFile = common.ROOT_PATH + 'build/banner.js';

    let anxonBanner = require(bannerFile);
    extraConfig = {
      plugins: [
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: '"production"'
          }
        }),
        
        new webpack.LoaderOptionsPlugin({
          minimize: true,
          debug: false
        }),

        new webpack.optimize.UglifyJsPlugin({
          beautify: false,
          mangle: {
            screw_ie8: true,
            keep_fnames: true
          },
          compress: {
            screw_ie8: true
          },
          comments: false
        }),

        new webpack.BannerPlugin({
          banner: anxonBanner,
          entryOnly: true,
        }),
      ]
    };
  }

  let config = mergeConfig(basicConfig, appConfig, extraConfig);
  // console.log(JSON.stringify(config, null, 2));

  webpack(config, function (err, stats) {
    if (err) throw err;

    process.stdout.write(stats.toString({
      timings: true,
      colors: true,
      modules: true,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n');

    // merge chrome manifest to json file
    const appManifest = require(APP_PATH + '/manifest.js');
    let manifest = utils.mergeManifest(appManifest);
    if (manifest) {
      try {
        manifest = JSON.stringify(manifest, null, 2);
        fs.writeFileSync(common.DIST_PATH + '/' + commander.app + '/manifest.json', manifest);
        console.log(colors.blue('manifest.json created!'));
      } catch (err) {
        console.log(colors.red('Error when generate manifest.json!'), err);
        process.exit();
      }
    } else {
      console.log(colors.red('Can not create manifest.json!'), manifest);
      process.exit();
    }

    if (commander.release) {
      // archiver 
      const archiver = require('archiver');
      
      // create release directory if not exist
      if (!fs.existsSync(common.RELEASE_PATH)) {
        console.log(colors.yellow('Create release directory'))
        fs.mkdirSync(common.RELEASE_PATH);
      }

      let filepath = common.RELEASE_PATH + utils.getReleaseFilename(commander.app) + '.zip';
      let output = fs.createWriteStream(filepath);
      let archive = archiver('zip');
      // listen for all archive data to be written 
      output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });

      // good practice to catch this error explicitly 
      archive.on('error', function (err) {
        throw err;
      });

      archive.pipe(output);
      archive.directory(common.DIST_PATH + '/' + commander.app + '/', commander.app);
      archive.finalize();
    }
  });
}
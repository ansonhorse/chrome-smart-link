const commander = require('commander');
const colors = require('colors');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const inquirer = require('inquirer');

const utils = require('./utils.js');
const common = require('./common.js');

commander
  .version('0.0.1')
  .option('--app [app]', 'The app name')
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
  let appDistPath = common.DIST_PATH + commander.app;
  // check if the dist directory is exist
  if (!fs.existsSync(appDistPath)) {
    console.log('App [%s] dist dir not found in %s!'.red, commander.app, appDistPath);
    console.log(colors.red('Please build the app firstly.'));
    process.exit();
  }

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
  archive.directory(appDistPath, commander.app);
  archive.finalize();
}
// this is the backend script of this app';
// feel free to type your codes
import Dispatcher from 'anxonApp/js/inc/Dispatcher.js';
import messages from 'anxonApp/locales/all.js';

anxon.ready({
  extensionEnabled: true
}, () => {
  anxon.options.locale = anxon.options.locale || 'zh';
  anxon.t = (s) => {
    let ret = s;
    let exploded = s.split('.');
    if (exploded.length === 1)
      ret = messages[anxon.options.locale][exploded[0]];
    else
      ret = messages[anxon.options.locale][exploded[0]][exploded[1]];
    ret = ret === undefined ? s : ret;
    return ret;
  };

  anxon.dispatcher = new Dispatcher();
});
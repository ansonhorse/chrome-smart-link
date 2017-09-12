// this is the frontend script of this app';
// feel free to type your codes
import messages from 'anxonApp/locales/all.js';
import Decider from 'anxonApp/js/inc/Decider.js';
import Inspector from 'anxonApp/js/inc/Inspector.js';
import Toast from 'izitoast/dist/js/iziToast.min.js';
import 'anxonApp/css/frontend.styl';

anxon.toast = Toast;

anxon.ready({
  extensionEnabled: true,
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
  
  anxon.decider = new Decider();

  anxon.inspector = new Inspector();
});
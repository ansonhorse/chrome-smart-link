// this is the frontend script of this app';
// feel free to type your codes
import Decider from 'anxonApp/js/inc/Decider.js';
import Inspector from 'anxonApp/js/inc/Inspector.js';

anxon.ready({
  extensionEnabled: true,
}, () => {
  anxon.decider = new Decider();

  anxon.inspector = new Inspector();
});
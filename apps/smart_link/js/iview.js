import Vue from 'vue';
import Meta from 'vue-meta';
import VueI18n from 'vue-i18n';
import iView from 'iview';
import 'iview/dist/styles/iview.css';

Vue.use(Meta);
Vue.use(VueI18n);
Vue.use(iView);

import messages from 'anxonApp/locales/all.js';
import Main from '../component/iview.vue';

anxon.ready({
  extensionEnabled: true
}, () => {
  const i18n = new VueI18n({
    locale: anxon.options.locale,
    messages,
  });

  new Vue({
    el: '#app',
    i18n,
    render: h => h(Main)
  });
});
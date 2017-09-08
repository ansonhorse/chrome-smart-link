import Vue from 'vue';
import VueI18n from 'vue-i18n';
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.css';
import '../css/md-icon.css';

Vue.use(VueI18n);
Vue.use(VueMaterial);

import messages from 'anxonApp/locales/all.js';
import Main from '../component/popup.vue';

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
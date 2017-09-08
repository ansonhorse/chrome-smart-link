<template>
  <div class="app-container">
    <md-toolbar class="md-dense">
      <md-button class="md-icon-button">
        <img :src="logo">
      </md-button>

      <h2 class="md-title" style="flex: 1">
        {{ manifest.name }} &nbsp;&nbsp;
        <small style="color:#9fa8da;">v{{ manifest.version }}</small>
      </h2>

      <md-button class="md-icon-button" @click="initCreate">
        <md-tooltip>{{ $t('app.create_rule_for_current_tab') }}</md-tooltip>
        <md-icon>add_circle_outline</md-icon>
      </md-button>

      <md-button class="md-icon-button" href="options.html" target="_blank" :title="$t('app.settings')">
        <md-tooltip>{{ $t('app.settings') }}</md-tooltip>
        <md-icon>settings</md-icon>
      </md-button>
    </md-toolbar>

    <md-layout>
      <md-layout>
        <md-card class="common-settings">
          <md-card-header>
            <div class="md-title"> {{ $t('app.rules_list') }}</div>
          </md-card-header>
          <md-card-content>
            <md-list class="custom-list md-triple-line">
              <md-list-item v-for="(rule, index) in rules" :key="index">
                <div class="md-list-text-container">
                  <span class="memo">{{ rule.memo }}</span>
                  <span>
                    <md-select v-model="rule.mode">
                      <md-option :value="mode" :key="i" v-for="(mode, i) in modes">
                        {{ $t('modes.' + mode) }}
                      </md-option>
                    </md-select>
                  </span>
                  <p>
                    <md-chips v-model="rule.selectors" md-static></md-chips>
                  </p>
                </div>
                <md-switch v-model="rule.enabled" class="md-warn"></md-switch>
              </md-list-item>
            </md-list>

          </md-card-content>
        </md-card>
      </md-layout>
    </md-layout>

    <md-dialog-alert :md-ok-text="$t('app.ok')" md-content="default content..." :md-content-html="errors.join('; ')" ref="errorDialog">
    </md-dialog-alert>
  </div>
</template>

<script>
export default {
  components: {

  },

  data() {
    return {
      modes: anxon.const.Modes,
      manifest: anxon.manifest,
      options: anxon.options,
      logo: chrome.runtime.getURL('img/icon_48.png'),
      rules: [],
      ids: [],
      errors: [],
    }
  },

  watch: {
    rules: {
      deep: true,
      handler: function(val, oldVal) {
        if (oldVal.length > 0) {
          this.onEnabledChanged();
        }
      }
    }
  },

  created() {
    this.requestRules();
  },

  methods: {
    openDialog(ref) {
      this.$refs[ref].open();
    },

    closeDialog(ref) {
      this.$refs[ref].close();
    },

    requestRules() {
      let app = this;
      // windowId defaults to the current window
      chrome.tabs.query({
        active: true
      }, (tabs) => {
        if (!tabs.length) {
          return;
        }
        let tab = tabs[0];
        anxon.messaging.dispatchMessage('requestRules', {
          tab: tab,
          includeDisabled: true,
        }, (res) => {
          if (res.status) {
            _.each(res.data.rules, (rule, index) => {
              app.rules.push(rule);
              app.ids.push(rule.id);
            });
          } else {
            app.ids = [];
            app.rules = [];
          }
        });
      });
    },

    alert(message) {
      this.errors = [message];
      this.openDialog('errorDialog');
    },

    /**
     * 
     */
    initCreate() {
      // get current tab
      chrome.tabs.query({
        active: true
      }, (tabs) => {
        if (!tabs.length) {
          this.alert(this.$t('app.no_active_tab'));
          return fale;
        }
        let tab = tabs[0];
        anxon.messaging.dispatchMessage('requestCreate', {
          tab: tab
        }, (res) => {

        });
      });
    },

    onEnabledChanged() {
      _.each(anxon.options.rules, (item) => {
        let index = this.ids.indexOf(item.id);
        if (index < 0) return;
        let rule = this.rules[index];
        item.enabled = rule.enabled;
        item.mode = rule.mode;
      });

      anxon.storage.set({
        options: anxon.options,
      }, () => {
        anxon.messaging.dispatchMessage('rulesModified');
      });
    }

  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
body
  width 580px
  height 438px

.md-layout
  .md-card
    width 100%

.md-layout .md-card
    width 92%
    box-shadow none
    .md-card-header
      border-bottom 1px solid #eee

.field-group
  display flex

.hotkey-settings .md-input-container
  width 150px !important
  margin-right 18px !important

.common-settings .md-input
  border-bottom 1px solid #e0e0e0
  max-width 220px

.enabled-switch
  padding-left 16px

.app-container .md-card .md-card-content:last-child
  padding-bottom 8px

.app-container .md-card .md-subhead
  line-height 32px

.app-container .md-card .md-title
  font-size 18px
  letter-spacing 0
  line-height 22px
  margin-top 0 !important

.md-list-item .md-chips .md-chip
  height 24px
  line-height 12px
  font-size 13px
  border-radius 3px
  padding 6px 8px

.memo
  max-width 50%
</style>
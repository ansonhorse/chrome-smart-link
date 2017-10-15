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


      <md-button class="btn-link" href="https://chrome.google.com/webstore/detail/smart-link/aeapnaldjboamkedmpocaggbgbagihih" target="_blank">
        <md-tooltip>{{ $t('app.view_on_store') }}</md-tooltip>
        Store
      </md-button>
      <md-button class="btn-link" href="https://github.com/ansonhorse/chrome-smart-link" target="_blank">
        <md-tooltip>{{ $t('app.view_on_github') }}</md-tooltip>
        Github
      </md-button>

      <md-button md-menu-trigger>
        <md-menu md-direction="bottom left">
          <md-button md-menu-trigger class="md-icon-button md-danger">
            <md-tooltip>{{ $t('app.set_locale') }}</md-tooltip>
            <md-icon>language</md-icon>
          </md-button>
          <md-menu-content>
            <md-menu-item @click.native="setLocale('zh')">
              中文
              <md-icon v-if="options.locale === 'zh'">check_circle</md-icon>
            </md-menu-item>
            <md-menu-item @click.native="setLocale('en')">
              English
              <md-icon v-if="options.locale === 'en'">check_circle</md-icon>
            </md-menu-item>
          </md-menu-content>
        </md-menu>
      </md-button>

    </md-toolbar>

    <md-table-card>
      <md-toolbar>
        <h1 class="md-title">
          {{ $t('app.rules_list') }}
          <small style="color:#9e9e9e">({{ options.rules.length }})</small>
        </h1>

        <md-button class="md-icon-button md-primary" @click.native="add(null)">
          <md-tooltip>{{ $t('app.add') }}</md-tooltip>
          <md-icon>add</md-icon>
        </md-button>

        <md-button class="md-icon-button md-primary" @click.native="onBulkRemove">
          <md-tooltip>{{ $t('app.bulk_remove') }}</md-tooltip>
          <md-icon>delete</md-icon>
        </md-button>
      </md-toolbar>

      <md-table md-sort="" md-sort-type="desc" @select="onRulesSelect" id="rules">
        <md-table-header>
          <md-table-row>
            <md-table-head>#</md-table-head>
            <md-table-head class="th-memo">{{ $t('app.memo') }}</md-table-head>
            <md-table-head>{{ $t('app.detection') }}</md-table-head>
            <md-table-head class="th-pattern">{{ $t('app.pattern') }}</md-table-head>
            <md-table-head class="th-selectors">{{ $t('app.selectors') }}</md-table-head>
            <md-table-head>{{ $t('app.mode') }}</md-table-head>
            <md-table-head>{{ $t('app.status') }}</md-table-head>
            <md-table-head>{{ $t('app.operations') }}</md-table-head>
          </md-table-row>
        </md-table-header>

        <md-table-body v-if="!!options.rules">
          <md-table-row v-for="(item, index) in options.rules" :key="index" :index="item.index" :md-item="item" md-selection>
            <md-table-cell class="drag-handler">
              <md-tooltip>{{ $t('app.drag_me_to_sort') }}</md-tooltip>
              {{ index + 1 }}
            </md-table-cell>

            <md-table-cell>{{ item.memo }}</md-table-cell>

            <md-table-cell>
              {{ $t('detections.' + item.detection) }}
            </md-table-cell>

            <md-table-cell>
              <pre>{{ item.pattern }}</pre>
            </md-table-cell>

            <md-table-cell>
              <pre>{{ item.selectors }}</pre>
            </md-table-cell>

            <md-table-cell>
              {{ $t('modes.' + item.mode) }}
            </md-table-cell>

            <md-table-cell>
              <md-switch v-model="item.enabled" class="md-primary"></md-switch>
            </md-table-cell>

            <md-table-cell>
              <md-button class="md-icon-button" @click.native="edit(index)">
                <md-tooltip>{{ $t('app.edit') }}</md-tooltip>
                <md-icon>edit</md-icon>
              </md-button>
              <md-button class="md-icon-button" @click.native="duplicate(index)">
                <md-tooltip>{{ $t('app.copy') }}</md-tooltip>
                <md-icon>content_copy</md-icon>
              </md-button>

              <md-menu md-direction="bottom left">
                <md-button md-menu-trigger class="md-icon-button md-danger">
                  <md-tooltip>{{ $t('app.remove') }}</md-tooltip>
                  <md-icon>delete</md-icon>
                </md-button>
                <md-menu-content>
                  <md-menu-item @click.native="remove(index)">
                    {{ $t('app.remove') }}
                    <md-icon>delete</md-icon>
                  </md-menu-item>

                  <md-menu-item>
                    {{ $t('app.cancel') }}
                    <md-icon>undo</md-icon>
                  </md-menu-item>
                </md-menu-content>
              </md-menu>

            </md-table-cell>

          </md-table-row>
        </md-table-body>
      </md-table>
    </md-table-card>

    <md-dialog-alert :md-ok-text="$t('app.ok')" md-content="default content..." :md-content-html="errors.join('; ')" ref="errorDialog">
    </md-dialog-alert>

    <md-dialog-confirm :md-title="confirm.title" :md-content-html="confirm.content" :md-ok-text="confirm.ok" :md-cancel-text="confirm.cancel" @close="onConfirmClose" ref="confirm">
    </md-dialog-confirm>

    <div>
      <RuleForm :rule="formRule" @save="save" @cancel="cancel" ref="ruleForm"></RuleForm>
    </div>

    <md-snackbar :md-position="sb.vertical + ' ' + sb.horizontal" ref="snackbar" :md-duration="sb.duration">
      <span v-html="sb.message"></span>
    </md-snackbar>

  </div>
</template>

<script>
import RuleForm from './RuleForm.vue';
import Sortable from 'sortablejs';

window.Sortable = Sortable;

export default {
  metaInfo: {
    title: anxon.manifest.name,
  },

  components: {
    RuleForm,
  },

  data() {
    return {
      manifest: anxon.manifest,
      options: _.clone(anxon.options),
      modes: anxon.const.Modes,
      logo: chrome.runtime.getURL('img/icon_48.png'),
      formRuleIndex: null,
      errors: [],
      formRule: {},
      confirm: {
        title: 'title',
        content: 'conent',
        ok: '',
        cancel: '',
        onClose: '',
      },
      sb: {
        message: '',
        vertical: 'top',
        horizontal: 'center',
        duration: 1000,
      }
    }
  },

  created() {
    _.each(this.options.rules, (rule, index) => {
      rule.index = index;
    });

    anxon.messaging.addListener('create', this.requestCreate);

    this.confirm.ok = this.$t('app.ok');
    this.confirm.cancel = this.$t('app.cancel');
  },

  mounted() {
    let sortable = new Sortable(document.querySelector('#rules tbody'), {
      handle: '.drag-handler',
      chosenClass: 'chosen',
      ghostClass: 'ghost',
      onEnd: this.onSorted,
    });
  },

  watch: {
    options: {
      deep: true,
      handler: _.debounce(function(val) {
        console.log('options changed', val);
        anxon.storage.set({
          options: val
        });

        this.onRulesModified();
      }, 50)
    }
  },

  methods: {
    onRulesModified() {
      anxon.messaging.dispatchMessage('rulesModified');
    },

    notify(message, duration = 2000) {
      this.sb.message = message;
      this.sb.duration = duration;
      this.$refs.snackbar.open();
    },

    openDialog(ref) {
      this.$refs[ref].open();
    },

    closeDialog(ref) {
      this.$refs[ref].close();
    },

    onRulesSelect(rules) {
      this.selectedIds = [];
      _.each(rules, (rule) => {
        this.selectedIds.push(rule.id);
      });
    },

    onConfirmClose(state) {
      if (state === 'ok' && this.confirm.onClose) {
        this[this.confirm.onClose]();
      }
    },

    onBulkRemove() {
      this.selectedIds = this.selectedIds || [];
      if (this.selectedIds.length) {
        this.confirm.title = this.$t('app.confirm_bulk_remove');
        this.confirm.content = this.$t('app.confirm_bulk_remove_alert');
        this.confirm.onClose = 'bulkRemove';
        this.openDialog('confirm');
      }
    },

    bulkRemove() {
      let rulesLeft = [];
      _.each(this.options.rules, (rule, index) => {
        if (this.selectedIds.indexOf(rule.id) < 0) {
          rulesLeft.push(rule);
        }
      });
      this.options.rules = rulesLeft;
      this.onRulesModified();
      this.notify(this.$t('app.bulk_remove_success'));
    },

    remove(index) {
      this.options.rules.splice(index, 1);
      this.onRulesModified();
      this.notify(this.$t('app.remove_success'), 1000);
    },

    edit(index) {
      this.formRuleIndex = index;
      this.$refs.ruleForm.ruleItem = JSON.parse(JSON.stringify(this.options.rules[this.formRuleIndex]));
      this.$refs.ruleForm.open();
    },

    add(item) {
      this.formRuleIndex = null;
      if (item) {
        this.$refs.ruleForm.ruleItem = item;
      } else {
        this.closeAfterSaved = false;
        this.$refs.ruleForm.setDefault();
      }
      this.$refs.ruleForm.open(true);
    },


    requestCreate(data, sender, sendResponse) {
      console.log('[requestCreate]', data, sender);
      let tab = data.tab;
      if (tab) {
        let item = {
          memo: tab.title,
          detection: anxon.const.Detections.CONTAINS,
          pattern: tab.url,
          selectors: [],
          mode: anxon.const.Modes.NEW_TAB,
          enabled: true,
        };
        let info = _.isObject(data.info) && !_.isEmpty(data.info) ? data.info : null;
        if (info) {
          _.each(info, (v, k) => {
            if (item[k] !== undefined) item[k] = v;
          });
        }
        this.add(item);
        if (data.closeAfterSaved) {
          this.closeAfterSaved = true;
        }
        this.requestTabId = tab.id;
      } else {
        this.errors = ['[requestCreate] ' + this.$t('app.no_tab_provided')];
        this.openDialog('errorDialog');
        return false;
      }
    },

    duplicate(index) {
      let item = _.clone(this.options.rules[index]);
      item.id = anxon.utils.guid();
      this.options.rules.push(item);
      this.onRulesModified();
      this.notify(this.$t('app.duplicate_success'), 800);
    },

    save(res) {
      this.errors = [];
      if (_.isString(res)) {
        this.errors = [res];
        this.openDialog('errorDialog');
        return false;
      }
      if (this.formRuleIndex !== null) {
        this.$set(this.options.rules, this.formRuleIndex, res);
      } else {
        this.options.rules.push(res);
      }

      if (this.closeAfterSaved) {
        anxon.storage.set({
          options: this.options
        }, () => {
          this.onRulesModified();
          if (this.requestTabId) {
            chrome.tabs.update(this.requestTabId, {
              active: true,
            });
          } else {
            window.close();
          }
        });
      }

      this.$refs.ruleForm.close();
      this.notify(this.$t('app.save_success'), 1000);
    },

    cancel() {
      this.$refs.ruleForm.close();
    },

    setLocale(locale) {
      anxon.options.locale = locale;
      anxon.updateOptions().then(() => {
        window.location.reload();
      });
    },

    onSorted(evt) {
      if (evt.oldIndex === evt.newIndex) return;
      
      window.vm = this;

      let rows = document.querySelectorAll('#rules tbody tr');
      let indices = [];
      rows.forEach((row, index) => {
        if (!row.classList.contains('sortable-ghost'))
          indices.push(parseInt(row.getAttribute('index')));
      });
      let sortedRules = [];
      let i = 0;
      indices.forEach(index => {
        let rule = _.clone(this.options.rules[index]);
        rule.index = i;
        i++;
        sortedRules.push(rule);
      });
      anxon.options.rules = sortedRules;
      this.onRulesModified();
      anxon.updateOptions().then(() => {
        window.location.reload();
      });
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.md-layout
  .md-card
    width 100%

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

.dialog-item .md-dialog
  width 1024px

.md-tooltip
  font-size 12px !important

.md-dialog-title
  margin-bottom 0px !important
  padding 18px 24px 0 24px !important

.btn-link
  text-transform none !important

.drag-handler
  cursor move

.chosen
  background #edffd7
</style>
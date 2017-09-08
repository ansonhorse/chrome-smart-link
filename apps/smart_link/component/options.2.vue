<template>
  <div>
    <table>
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t('app.memo') }}</th>
            <th>{{ $t('app.pattern') }}</th>
            <th>{{ $t('app.selectors') }}</th>
            <th>{{ $t('app.mode') }}</th>
            <th>{{ $t('app.status') }}</th>
            <th>{{ $t('app.operations') }}</th>
          </tr>
        </thead>

        <tbody v-if="!!options.rules">
          <tr v-for="(item, index) in options.rules" :key="index">
            <td>{{ index + 1 }}</td>

            <td>{{ item.memo }}</td>

            <td>
              <pre>{{ item.pattern }}</pre>
            </td>

            <td>
              <pre>{{ item.selectors }}</pre>
            </td>

            <td>
              {{ $t('modes.' + item.mode) }}
            </td>

            <td>
              <md-switch v-model="item.enabled" class="md-primary"></md-switch>
            </td>

            <td>
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

            </td>

          </tr>
        </tbody>
      </table>

    <md-dialog-alert :md-ok-text="$t('app.ok')" md-content="default content..." :md-content-html="errors.join('; ')" ref="errorDialog">
    </md-dialog-alert>

    <div>
      <RuleForm :rule="formRule" @save="save" @cancel="cancel" ref="ruleForm"></RuleForm>
    </div>

  </div>
</template>

<script>
import RuleForm from './RuleForm.vue';

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
      options: anxon.options,
      modes: anxon.const.Modes,
      logo: chrome.runtime.getURL('img/icon_48.png'),
      formRuleIndex: null,
      errors: [],
      formRule: {},
    }
  },

  created() {
    anxon.messaging.addListener('create', this.requestCreate);
  },

  watch: {
    options: {
      deep: true,
      handler: _.debounce(function (val) {
        console.log('options changed', val);
        anxon.storage.set({
          options: val
        });

        this.notifyRefresh();
      }, 50)
    }
  },

  methods: {
    /**
     * use lodash.debounce, which can prevent high frequency notifications
     */
    notifyRefresh: _.debounce(() => {
      console.log('notify tabs to refresh');
      anxon.messaging.dispatchToTabs({}, 'refresh', null);
    }, 2000),

    openDialog(ref) {
      this.$refs[ref].open();
    },

    closeDialog(ref) {
      this.$refs[ref].close();
    },

    bulkRemove(items) {

    },

    remove(index) {
      this.options.rules.splice(index, 1);
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
        this.$refs.ruleForm.setDefault();
      }
      this.$refs.ruleForm.open(true);
    },

    requestCreate(data, sender, sendResponse) {
      console.log('[requestCreate]', data);
      let tab = data.tab;
      if (tab) {
        let item = {
          memo: tab.title,
          pattern: (new URL(tab.url)).hostname,
          selectors: [],
          mode: anxon.const.Modes.NEW_TAB,
          enabled: true,
        };
        this.add(item);
      } else {
        this.errors = ['[requestCreate] ' + this.$t('app.no_tab_provided')];
        this.openDialog('errorDialog');
        return false;
      }
    },

    duplicate(index) {
      let item = _.clone(this.options.rules[index]);
      this.options.rules.push(item);
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
        // this.options.rules[this.formRuleIndex] = res;
      } else {
        this.options.rules.push(res);
      }
      this.$refs.ruleForm.close();
    },

    cancel() {
      this.$refs.ruleForm.close();
    },

    setLocale(locale) {
      anxon.options.locale = locale;
      location.reload();
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
  width 720px

.md-tooltip
  font-size 12px !important
</style>
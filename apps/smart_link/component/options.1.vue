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
    </md-toolbar>

    <md-table-card>
      <md-toolbar>
        <h1 class="md-title">{{ $t('app.rules_list') }}</h1>
        <md-button class="md-icon-button">
          <md-icon>filter_list</md-icon>
        </md-button>

        <md-button class="md-icon-button">
          <md-icon>search</md-icon>
        </md-button>

        <md-button class="md-icon-button md-primary" @click.native="add">
          <md-icon>add</md-icon>
        </md-button>
      </md-toolbar>

      <md-table md-sort="" md-sort-type="desc">
        <md-table-header>
          <md-table-row>
            <md-table-head>#</md-table-head>
            <md-table-head>{{ $t('app.memo') }}</md-table-head>
            <md-table-head>{{ $t('app.pattern') }}</md-table-head>
            <md-table-head>{{ $t('app.selectors') }}</md-table-head>
            <md-table-head>{{ $t('app.mode') }}</md-table-head>
            <md-table-head>{{ $t('app.status') }}</md-table-head>
            <md-table-head>{{ $t('app.operations') }}</md-table-head>
          </md-table-row>
        </md-table-header>

        <md-table-body v-if="!!options.rules">
          <md-table-row v-for="(item, index) in options.rules" :key="index" :md-item="item" md-selection>
            <md-table-cell>{{ index + 1 }}</md-table-cell>

            <md-table-cell>{{ item.memo }}</md-table-cell>

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
              <md-button class="md-icon-button" @click.native="edit(index)" :title="$t('app.edit')">
                <md-icon>edit</md-icon>
              </md-button>
              <md-button class="md-icon-button" @click.native="duplicate(index)" :title="$t('app.copy')">
                <md-icon>content_copy</md-icon>
              </md-button>
              <md-button class="md-icon-button md-danger" @click.native="initRemove(index)" :title="$t('app.remove')">
                <md-icon>delete</md-icon>
              </md-button>
            </md-table-cell>

          </md-table-row>
        </md-table-body>
      </md-table>
    </md-table-card>

    <md-dialog-confirm
      :md-ok-text="$t('app.ok')"
      :md-cancel-text="$t('app.cancel')"
      :md-title="$t('app.confirm_delete')"
      md-content="default content..."
      :md-content-html="removedItemIndex !== null ? options.rules[removedItemIndex].memo : ''"
      @close="remove"
      ref="removeDialog"
    >
    </md-dialog-confirm>

    <md-dialog-alert
      :md-ok-text="$t('app.ok')"
      md-content="default content..."
      :md-content-html="errors.join('; ')"
      ref="errorDialog">
    </md-dialog-alert>

    <md-dialog md-content="" :md-click-outside-to-close="false" :md-esc-to-close="false" ref="formDialog" class="dialog-item">
      <md-dialog-title>
        <span v-if="formItemIndex === null">{{ $t('app.add') }}</span>
        <span v-if="formItemIndex !== null">{{ $t('app.edit') }}</span>
      </md-dialog-title>

      <md-dialog-content>
        <form>
          <md-input-container>
            <label>{{ $t('app.memo') }}
              <span class="text-danger">*</span>
            </label>
            <md-input v-model="formItem.memo"></md-input>
          </md-input-container>

          <md-input-container>
            <label>{{ $t('app.pattern') }}
              <span class="text-danger">*</span>
            </label>
            <md-input v-model="formItem.pattern"></md-input>
          </md-input-container>

          <md-input-container>
            <label>{{ $t('app.selectors') }}</label>
            <md-textarea v-model="formItem.selectors"></md-textarea>
          </md-input-container>

          <md-input-container>
            <label>{{ $t('app.mode') }} *</label>
            <md-select v-model="formItem.mode">
              <md-option :value="mode" :key="i" v-for="(mode, i) in modes" v-if="mode !== modes.DEFAULT">
                {{ $t('modes.' + mode) }}
              </md-option>
            </md-select>
          </md-input-container>

          <div>
            <label>{{ $t('app.status') }}</label>
            <div>
              <md-switch class="md-primary" v-model="formItem.enabled">
                <label for="ge" v-show="formItem.enabled"> {{ $t('app.enabled') }}</label>
                <label for="ge" v-show="!formItem.enabled"> {{ $t('app.disabled') }}</label>
              </md-switch>
            </div>
          </div>
        </form>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="save">{{ $t('app.save') }}</md-button>
        <md-button class="md-default" @click.native="closeDialog('formDialog')">{{ $t('app.cancel') }}</md-button>
      </md-dialog-actions>

    </md-dialog>

  </div>
</template>

<script>
import RuleItem from './RuleItem';

export default {
  components: {
    RuleItem
  },

  data() {
    return {
      manifest: anxon.manifest,
      options: anxon.options,
      modes: anxon.const.Modes,
      logo: chrome.runtime.getURL('img/icon_48.png'),
      removedItemIndex: null,
      formItemIndex: null,
      errors: [],
      newItem: {
        memo: '',
        pattern: '',
        selectors: '',
        mode: anxon.const.Modes.NEW_TAB,
        enabled: true,
      },
      removedItem: {},
      formItem: {},
    }
  },

  watch: {
    options: {
      deep: true,
      handler: (val) => {
        console.log('options changed', val);
        anxon.storage.set({
          options: val
        });
      }
    }
  },

  methods: {
    openDialog(ref) {
      this.$refs[ref].open();
    },

    closeDialog(ref) {
      this.$refs[ref].close();
    },

    initRemove(index) {
      this.removedItemIndex = index;
      this.removeItem = _.clone(this.options.rules[index]);
      this.openDialog('removeDialog');
    },

    remove(state) {
      if (state === 'ok') {
        this.options.rules.splice(this.removedItemIndex, 1);
        this.removedItemIndex = null;
      }
    },

    edit(index) {
      this.formItemIndex = index;
      this.formItem = _.clone(this.options.rules[index]);
      this.openDialog('formDialog');
    },

    add() {
      this.formItem = _.clone(this.newItem);
      this.formItemIndex = null;
      this.openDialog('formDialog');
    },

    duplicate(index) {
      let item = _.clone(this.options.rules[index]);
      this.options.rules.push(item);
    },

    save() {
      this.errors = [];
      this.formItem.memo = _.trim(this.formItem.memo);
      this.formItem.pattern = _.trim(this.formItem.pattern);
      this.formItem.selectors = _.trim(this.formItem.selectors);
      // check memo
      if (this.formItem.memo === '') {
        this.errors.push(this.$t('app.memo') + this.$t('app.is_required'));
      }
      // check page url pattern
      if (this.formItem.pattern === '') {
        this.errors.push(this.$t('app.pattern') + this.$t('app.is_required'));
      }

      if (this.errors.length) {
        this.openDialog('errorDialog');
        return false;
      }

      if (this.formItemIndex !== null) {
        this.options.rules[this.formItemIndex] = this.formItem;
      } else {
        this.options.rules.push(this.formItem);
      }

      this.closeDialog('formDialog');
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
</style>
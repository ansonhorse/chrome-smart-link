<template>
  <div>
    <md-dialog md-content="" :md-click-outside-to-close="false" :md-esc-to-close="false" ref="dialog" class="dialog-item">
      <md-dialog-title>
        <span v-if="action === 'add'">{{ $t('app.add') }}</span>
        <span v-if="action === 'edit'">{{ $t('app.edit') }}</span>
      </md-dialog-title>

      <md-dialog-content>
        <form>
          <md-input-container>
            <label>{{ $t('app.memo') }}
              <span class="text-danger">*</span>
            </label>
            <md-input v-model="ruleItem.memo" ref="memo" autofocus></md-input>
          </md-input-container>

          <md-input-container>
            <label>{{ $t('app.detection') }} *</label>
            <md-select v-model="ruleItem.detection">
              <md-option :value="detection" :key="i" v-for="(detection, i) in detections">
                {{ $t('detections.' + detection) }}
              </md-option>
            </md-select>
          </md-input-container>

          <md-input-container>
            <label>{{ $t('app.pattern') }}
              <span class="text-danger">*</span>
            </label>
            <md-input v-model="ruleItem.pattern"></md-input>
          </md-input-container>

          <md-input-container class="md-input-focused no-after">
            <label>{{ $t('app.selectors_label') }}</label>
            <md-chips v-model="ruleItem.selectors" @change="onSelectorsChange" :md-input-placeholder="$t('app.selectors_placeholder')"></md-chips>
          </md-input-container>

          <md-input-container>
            <label>{{ $t('app.mode') }} *</label>
            <md-select v-model="ruleItem.mode">
              <md-option :value="mode" :key="i" v-for="(mode, i) in modes">
                {{ $t('modes.' + mode) }}
              </md-option>
            </md-select>
          </md-input-container>

          <div>
            <label>{{ $t('app.status') }}</label>
            <div>
              <md-switch class="md-primary" v-model="ruleItem.enabled">
                <label for="ge" v-show="ruleItem.enabled"> {{ $t('app.enabled') }}</label>
                <label for="ge" v-show="!ruleItem.enabled"> {{ $t('app.disabled') }}</label>
              </md-switch>
            </div>
          </div>
        </form>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="save">{{ $t('app.save') }}</md-button>
        <md-button class="md-default" @click.native="cancel">{{ $t('app.cancel') }}</md-button>
      </md-dialog-actions>

    </md-dialog>

  </div>
</template>

<script>
export default {
  name: 'RuleForm',

  data() {
    return {
      action: 'add',
      modes: anxon.const.Modes,
      detections: anxon.const.Detections,
      ruleItem: {
        id: '',
        memo: '',
        detection: anxon.const.Detections.CONTAINS,
        pattern: '',
        selectors: [],
        mode: anxon.const.Modes.NEW_TAB,
        enabled: true,
      },
      errors: [],
    }
  },

  props: {
    rule: {
      type: Object,
    }
  },

  methods: {

    onSelectorsChange(selectors) {
      console.log('onSelectorsChange', this.ruleItem);
      return false;
    },

    save() {
      this.errors = [];
      this.ruleItem.memo = _.trim(this.ruleItem.memo);
      this.ruleItem.pattern = _.trim(this.ruleItem.pattern);

      // check memo
      if (this.ruleItem.memo === '') {
        this.errors.push(this.$t('app.memo') + this.$t('app.is_required'));
      }
      // check page url pattern
      if (this.ruleItem.pattern === '') {
        this.errors.push(this.$t('app.pattern') + this.$t('app.is_required'));
      }
      let res = null;
      if (this.errors.length) {
        res = this.errors.join('; ');
      } else {
        if (!this.ruleItem.id) this.ruleItem.id = anxon.utils.guid();
        res = this.ruleItem;
      }
      this.$emit('save', res);
    },

    cancel() {
      this.$emit('cancel');
    },

    setDefault() {
      this.ruleItem = {
        memo: '',
        detection: anxon.const.Detections.CONTAINS,
        pattern: '',
        selectors: [],
        mode: anxon.const.Modes.NEW_TAB,
        enabled: true,
      };
    },

    open(forCreate) {
      if (forCreate) {
        this.action = 'add';
      } else {
        this.action = 'edit';
      }
      this.$refs.dialog.open();
    },

    close() {
      this.$refs.dialog.close();
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

.no-after::after
  height 0 !important
</style>
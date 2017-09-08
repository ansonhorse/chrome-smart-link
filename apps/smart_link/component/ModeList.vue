<template>
  <div>
    <md-list>
      <md-list-item v-for="(mode, index) in modes" :key="index" v-if="mode!==modes.DEFAULT">
        <md-radio v-model="value" name="mode" :md-value="mode" @change="onChange">
          {{ $t('modes.' + mode) }}
        </md-radio>
      </md-list-item>
    </md-list>
  </div>
</template>

<script>
export default {
  name: 'ModeList',

  data() {
    return {
      modes: anxon.const.Modes,
    };
  },

  props: {
    value: {
      type: Number,
      default: 0
    }
  },

  methods: {
    onChange(val, event) {
      console.log('[ModeList.onChange]', this.value, val, event);
      this.$emit('change', val, event);
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
.md-list-item
  .md-list-item-container
    min-height 30px !important
    padding 0 16px !important
    height 30px !important
</style>
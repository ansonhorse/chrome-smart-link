<template>
  <div>
    <Table :columns="columns" :data="rules">

    </Table>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css';
export default {
  data() {
    return {
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          key: 'memo',
          title: this.$t('app.memo'),
        },
        {
          key: 'detection',
          title: this.$t('app.detection'),
        },
        {
          key: 'pattern',
          title: this.$t('app.pattern'),
        },
        {
          key: 'selectors',
          title: this.$t('app.selectors'),
        },
        {
          key: 'mode',
          title: this.$t('app.mode'),
        },
        {
          key: 'status',
          title: this.$t('app.status'),
        },
        {
          key: 'operations',
          title: this.$t('app.operations'),
        },
      ],
      rules: anxon.options.rules,
      manifest: anxon.manifest,
    };
  },

  watch: {
    
  },

  created() {

  },

  methods: {
    duplicate(index) {
      let item = _.clone(this.rules[index]);
      item.id = anxon.utils.guid();
      this.rules.push(item);
    }
  }
};
</script>

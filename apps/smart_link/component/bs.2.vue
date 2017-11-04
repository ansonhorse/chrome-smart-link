<template>
  <div>
    <div class="page-header">
      <h1>Example page header <small>Subtext for header</small></h1>
    </div>
    
    <div class="row">
      <div class="col-sm-12">
        <table class="table table-condensed table-hover">
          <thead>
            <tr>
              <th><input type="checkbox"></th>
              <th>#</th>
              <th>{{ $t('app.memo') }}</th>
              <th>{{ $t('app.detection') }}</th>
              <th>{{ $t('app.pattern') }}</th>
              <th>{{ $t('app.selectors') }}</th>
              <th>{{ $t('app.mode') }}</th>
              <th>{{ $t('app.status') }}</th>
              <th>{{ $t('app.operations') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in rules" :key="index">
              <td><input type="checkbox" v-model="item.checked"></td>
              <td>{{ index + 1 }}</td>
              <td>{{ item.memo }}</td>
              <td>{{ $t('detections.' + item.detection) }}</td>
              <td>{{ item.pattern }}</td>
              <td>{{ item.selectors }}</td>
              <td>{{ $t('modes.' + item.mode) }}</td>
              <td>
                <input type="checkbox" v-model="item.enabled">
              </td>
              <td>
                <button type="button" @click="duplicate(index)">
                  <span class="glyphicon glyphicon-copy"></span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </h1>
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css';
export default {
  data() {
    return {
      rules: [],
      manifest: anxon.manifest,
    };
  },

  beforeCreate() {

  },

  watch: {
    
  },

  created() {
    anxon.options.rules.forEach((rule, index) => {
      let item = _.clone(rule);
      item.index = index;
      item.checked = false;
      this.rules.push(item);
    });

    this.$watch('rules', _.debounce(function(rules) {
        console.log('rules changed', rules);
        let items = [];
        _.each(rules, (rule, index) => {
          let item = {};
          _.each(rule, (v, k) => {
            if (k !== 'checked') item[k] = v;
          });
          items.push(item);
        });
        anxon.options.rules = items;
        anxon.updateOptions();
      }, 50), {
        deep: true
      });
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

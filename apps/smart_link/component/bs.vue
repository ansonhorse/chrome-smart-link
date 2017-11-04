<template>
  <div>
    <b-container class="bv-example-row">
      <b-row>
        <b-col>
          <b-table striped hover :items="rules" :fields="fields">
            <template slot="index" scope="data">
              {{ data.index + 1 }}
            </template>

            <template slot="operations" scope="data">
              <b-btn size="sm" @click="duplicate(data.index)">{{ $t('app.duplicate') }}</b-btn>
              <b-btn size="sm" @click="toEdit(data.index)">{{ $t('app.edit') }}</b-btn>
              <b-btn size="sm" @click="toRemove(data.index)">{{ $t('app.remove') }}</b-btn>
            </template>

          </b-table>
        </b-col>
      </b-row>
    </b-container>

    <!-- <div class="row">
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
    </div> -->
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.min.css';

export default {
  data() {
    return {
      fields: [
        'index',
        {
          key: 'memo',
          label: this.$t('app.memo'),
        },
        {
          key: 'detection',
          label: this.$t('app.detection'),
        },
        {
          key: 'pattern',
          label: this.$t('app.pattern'),
        },
        {
          key: 'selectors',
          label: this.$t('app.selectors'),
        },
        {
          key: 'mode',
          label: this.$t('app.mode'),
        },
        {
          key: 'status',
          label: this.$t('app.status'),
        },
        {
          key: 'operations',
          label: this.$t('app.operations'),
        },
      ],
      rules: [],
      manifest: anxon.manifest,
    };
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

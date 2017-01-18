import Ember from 'ember';
import _ from 'lodash';
import fullConfig from '../helpers/full-config';

export default Ember.Service.extend({
  setStore(key, value) {
    localStorage.setItem(key, value);
  },
  setStoreObj(obj) {
    _.map(obj, (v, k) => {
      this.setStore(k, v);
    });
  },
  getStore(key, def) {
    var s = localStorage.getItem(key);
    if (s) {
      return s;
    }
    return def;
  },
  getStoreObj() {
    var obj = {};
    _.map(fullConfig.defaultConfig().get('settings'), setting => {
      obj[setting.name] = this.getStore(setting.name);
    })
    return obj;
  },
  removeStore(key) {
    localStorage.removeItem(key);
  }
});

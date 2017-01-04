import Ember from 'ember';
import _ from 'lodash/lodash';

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
    this.setStore(key, def);
    return def;
  },
  removeStore(key) {
    localStorage.removeItem(key);
  }
});

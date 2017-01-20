import Ember from 'ember';
import _ from 'lodash';

export default Ember.Object.extend({
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
  removeStore(key) {
    localStorage.removeItem(key);
  }
}).create();

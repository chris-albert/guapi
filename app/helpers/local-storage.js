import Ember from 'ember';
import _ from 'lodash';

export default Ember.Object.extend({
  setStore(key, value) {
    localStorage.setItem(key, value);
  },
  setStoreJson(key, value) {
    this.setStore(key,JSON.stringify(value));
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
  getStoreJson(key, def) {
    try {
      const f = this.getStore(key);
      if(_.isString(f)) {
        return JSON.parse(f);
      } else {
        return def;
      }
    } catch(err) {
      console.error('Error in getting json store ',err);
      return undefined;
    }
  },
  getStoreObj() {
    const settings = this.getStoreJson('settings');
    if(_.isArray(settings)) {
      return _.fromPairs(_.map(settings, setting => {
        return [setting, this.getStore(setting)];
      }));
    }
    return {};
  },
  removeStore(key) {
    localStorage.removeItem(key);
  }
}).create();

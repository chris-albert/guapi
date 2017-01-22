import Ember from 'ember';
import _ from 'lodash';


export default Ember.Object.extend({
  store: null,
  init() {
    this.set('store',{});
  },
  setStore(key,value) {
    this.set('store.' + key, value);
  },
  getStore(key, def) {
    return this.get('store.'+ key, def);
  }
}).create();

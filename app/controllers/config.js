import Ember from 'ember';
import _ from 'lodash';
import LocalStorage from '../helpers/local-storage';

export default Ember.Controller.extend({
  config: {
    full: LocalStorage.getStoreJson('fullConfig'),
    condensed: LocalStorage.getStoreJson('condensedConfig')
  },
  actions: {
    loadDefault() {
      LocalStorage.removeStore('condensedConfig');
      window.location.reload(true);
    },
    load() {
      window.location.reload(true);
    },
    jsonError(e) {
      console.error('jsonError', e);
    },
    editable(e) {
      return e;
    },
    change(e) {
      console.log('change', e);
      LocalStorage.setStoreJson('condensedConfig', e);
    }
  },
  validateMessage: Ember.computed('', function() {

  })
});

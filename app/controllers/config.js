import Ember from 'ember';
import _ from 'lodash';
import LocalStorage from '../helpers/local-storage';

export default Ember.Controller.extend({
  config: {
    full: LocalStorage.getStoreJson('fullConfig'),
    condensed: LocalStorage.getStoreJson('condensedConfig')
  },
  actions: {
    validateJson() {
      try {
        JSON.parse(this.get('project'));
        this.set('validateMessage', 'Valid Json');
      } catch(err) {
        console.log(err);
        this.set('validateMessage', 'Invalid Json');
      }
    },
    jsonError(e) {
      console.error('jsonError', e);
    },
    editable(e) {
      return e;
    },
    change(e) {
      console.log('change', e);
    }
  },
  project: Ember.computed(function() {
    return this.get('config.full');
  }),
  validateMessage: Ember.computed('', function() {

  })
});

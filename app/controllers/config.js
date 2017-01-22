import Ember from 'ember';
import _ from 'lodash';
import LocalStorage from '../helpers/local-storage';

export default Ember.Controller.extend({
  config: {
    full: JSON.stringify(LocalStorage.getStoreJson('fullConfig'),null,2),
    condensed: JSON.stringify(LocalStorage.getStoreJson('fullConfig'),null,2)
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
    defaultConfig() {

    }
  },
  project: Ember.computed(function() {
    return this.get('config.full');
  }),
  validateMessage: Ember.computed('', function() {

  })
});

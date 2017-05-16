import Ember from 'ember';
import _ from 'lodash';
import CondensedConfig from './condensed-config';
import FullConfig from './full-config';
import LocalStorage from './local-storage';

export default Ember.Object.extend({
  configs: {},
  fetchConfig(name, ajaxOpts) {
    const namedConfig = this.get('configs.' + name);
    if(namedConfig) {
      return Promise.resolve(namedConfig);
    } else {
      return this.loadAjax(ajaxOpts)
        .then(data => {
          console.debug('Loaded ajax config', data);
        })
        .catch(error => {
          console.error('Got error loading ajax config', error);
        });
    }
  },
  loadAjax(opts) {
    return $.ajax(opts);
  },

}).create();

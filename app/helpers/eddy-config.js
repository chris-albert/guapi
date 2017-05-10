import Ember from 'ember';
import _ from 'lodash';
import CondensedConfig from './condensed-config';
import FullConfig from './full-config';
import LocalStorage from './local-storage';

export default Ember.Object.extend({
  config: null,
  getConfig() {
    if(this.hasConfig()) {
      return Promise.resolve(this.get('config'));
    } else {
      const configUrl = LocalStorage.getStore('configUrl');
      return this.loadConfig(configUrl)
        .then(c => this.process(c));
    }
  },
  loadConfig(url) {
    return $.ajax({
      url: url,
      method: 'GET'
    });
  },
  process(condensedConfig) {
    return this.expandCondensed(condensedConfig)
      .then(this.processConfig)
      .then(finalConfig => {
        this.initSettings(finalConfig.get('settings'));
        console.debug('Eddy Config', finalConfig);
        this.set('config', finalConfig);
        // this.set('hasConfig',true);
        return finalConfig;
      })
      .catch(e => {
        console.error(e);
      });
  },
  expandCondensed(condensed) {
    console.debug('Expanding condensed', condensed);
    return CondensedConfig.process(condensed)
      .then(c => {
        LocalStorage.setStoreJson('fullConfig', c);
         return c ;
      });
  },
  processConfig(config) {
    return FullConfig.create(config).get('root');
  },
  initSettings(settings) {
    LocalStorage.setStoreJson('settings', _.map(settings,'name'));
  },
  hasConfig() {
    return !_.isNull(this.get('config'));
  }
}).create();

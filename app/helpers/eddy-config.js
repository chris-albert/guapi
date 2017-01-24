import Ember from 'ember';
import _ from 'lodash';
import CondensedConfig from './condensed-config';
import FullConfig from './full-config';
import LocalStorage from './local-storage';
import config from '../config/environment';

export default Ember.Object.extend({
  getConfig() {
    this.handleCondensedConfig();
    return this.process();
  },
  process() {
    return this.expandCondensed(LocalStorage.getStoreJson('condensedConfig'))
      .then(this.processConfig)
      .then(finalConfig => {
        this.initSettings(finalConfig.get('settings'));
        console.log('Eddy Config', finalConfig);
        return finalConfig;
      });
  },
  expandCondensed(condensed) {
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
  handleCondensedConfig() {
    if(_.isUndefined(LocalStorage.getStoreJson('condensedConfig')) || _.get(config,'loadFromLocalStorage')) {
      LocalStorage.setStoreJson('condensedConfig', config.eddyConfig);
    }
  }
}).create();

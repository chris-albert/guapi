import Ember from 'ember';
import _ from 'lodash';
import CondensedConfig from './condensed-config';
import FullConfig from './full-config';
import LocalStorage from './local-storage';
import config from '../config/environment';

export default Ember.Object.extend({
  getConfig() {
    return this.process();
  },
  process() {
    return this.expandCondensed(this.getCondensedConfig())
      .then(this.processConfig)
      .then(finalConfig => {
        this.initSettings(finalConfig.get('settings'));
        console.debug('Eddy Config', finalConfig);
        return finalConfig;
      })
      .catch(e => {
        console.error(e);
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
  getCondensedConfig() {
    if(!_.get(config,'loadFromLocalStorage')) {
      console.debug('Loaded eddy config from eddy');
      return config.eddyConfig;
    } else {
      if(_.isUndefined(LocalStorage.getStoreJson('condensedConfig'))) {
        LocalStorage.setStoreJson('condensedConfig', config.eddyConfig);
      }
      console.debug('Loaded eddy config from local storage');
      return LocalStorage.getStoreJson('condensedConfig');
    }
  }
}).create();

import Ember from 'ember';
import _ from 'lodash';
import CondensedConfig from './condensed-config';
import FullConfig from './full-config';
import LocalStorage from './local-storage';

export default Ember.Object.extend({
  process(json) {
    const initialJson = _.cloneDeep(json);
    return CondensedConfig.process(json)
      .then(expandedConfig => {
        return {
          condensedConfig: initialJson,
          expandedConfig : _.cloneDeep(expandedConfig),
          fullConfig     : FullConfig.create(expandedConfig)
        };
      })
      .then(configs => {
        const expandedConfig = _.get(configs,'expandedConfig');
        _.set(expandedConfig, 'valid', true);
        console.debug('Processed valid config', configs);
        return configs;
      })
      .catch(error => {
        console.error('Error processing config', error);
      })
  },
  processAndSave(json) {
    this.process(json)
      .then(config => {
        LocalStorage.setStoreJson('config', _.get(config,'expandedConfig'));
        LocalStorage.setStoreJson('settings', _.map(_.get(config,'expandedConfig.settings'),'name'));
      });
  },
  getConfig() {
    const config = LocalStorage.getStoreJson('config');
    if(_.get(config,'valid')) {
      return Ember.RSVP.Promise.resolve(FullConfig.create(config).get('root'));
    }
    return Ember.RSVP.Promise.reject('Error getting config');
  },
  hasConfig() {
    return _.get(LocalStoreage.getStoreJson('config').get('valid'));
  }
}).create();

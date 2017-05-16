import Ember from 'ember';
import _ from 'lodash';
import CondensedConfig from './condensed-config';
import FullConfig from './full-config';
import LocalStorage from './local-storage';

export default Ember.Object.extend({
  configs: {},
  process(json) {
    return CondensedConfig.process(json)
      .then(c => FullConfig.create(c))
      .then(config => {
        const goodConfig = _.get(config,'root');
        _.set(goodConfig, 'valid', true);
        console.debug('Processed config', goodConfig);
        return goodConfig;
      })
      .catch(error => {
        console.error('Error processing config', error);
      })
  }
}).create();

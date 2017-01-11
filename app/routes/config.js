import Ember from 'ember';
import apiConfig from '../helpers/api-config';

export default Ember.Route.extend({
  model(params) {
    console.log(apiConfig.defaultConfig());
    return {
      prettyJson: JSON.stringify(apiConfig.defaultConfig(), null, 2)
    };
  }
});

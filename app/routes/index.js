import Ember from 'ember';
import EddyConfig from '../helpers/eddy-config';
import GuapiConfig from '../helpers/guapi-config';

export default Ember.Route.extend({
  beforeModel() {
    if(GuapiConfig.get('hasConfig')) {
      this.transitionTo(EddyConfig.get('config.name'));
    }
  }
});

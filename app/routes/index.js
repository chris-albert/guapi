import Ember from 'ember';
import EddyConfig from '../helpers/eddy-config';

export default Ember.Route.extend({
  beforeModel() {
    if(EddyConfig.get('hasConfig')) {
      this.transitionTo(EddyConfig.get('config.name'));
    }
  }
});

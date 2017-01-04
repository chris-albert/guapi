import Ember from 'ember';
import _ from 'lodash/lodash';
import apiConfig from '../helpers/api-config';

export default Ember.Controller.extend({
  routes: null,
  init() {
    this.set('tabs', this.getRoutes());
    this._super();
  },
  getRoutes() {
    return _.map(apiConfig.defaultConfig().get('endpoints'), this.eachEndpoint);
  },
  eachEndpoint(routeDef, route) {
    return {
      display: routeDef.display,
      name   : route,
      route  : route
    };
  }
});

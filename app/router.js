import Ember from 'ember';
import config from './config/environment';
import _ from 'lodash';
import EddyConfig from './helpers/eddy-config';

var Router = Ember.Router.extend({
  location: config.locationType,
});

function nestedRegisterRoute(router, route, nest) {
  router.route(route, function() {
    if(nest) {
      _.each(nest, (n, rn) => nestedRegisterRoute(this, rn, n));
    }
  });
}

Router.map(function () {
  this.route('config');
  const routes = EddyConfig.nestedRoutes();
  _.each(routes, (nest, routeName) => nestedRegisterRoute(this,routeName, nest));
});

export default Router;

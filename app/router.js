import Ember from 'ember';
import config from './config/environment';
import _ from 'lodash';
import fullConfig from './helpers/full-config';

var Router = Ember.Router.extend({
  location: config.locationType,
});

function nestedRegisterRoute(router, route, nest) {
  //console.debug('Creating router entry for route [' + route + ']');
  router.route(route, function() {
    if(nest) {
      _.each(nest, (n, rn) => nestedRegisterRoute(this, rn, n));
    }
  });
};

Router.map(function () {
  const routes = fullConfig.nestedRoutes();
  _.each(routes, (nest, routeName) => nestedRegisterRoute(this,routeName, nest));
});

export default Router;

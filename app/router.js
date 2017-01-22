import Ember from 'ember';
import config from './config/environment';
import _ from 'lodash';
import EddyConfig from './helpers/eddy-config';
import AppStorage from './helpers/app-storage';

var Router = Ember.Router.extend({
  location: config.locationType
});

function nestedRoutes(routes) {
  const obj = {};
  function setNest(route) {
    const r = _.get(obj, route);
    if (!r) {
      _.set(obj, route);
    }
  }
  _.each(routes, setNest);
  return obj;
}

function nestedRegisterRoute(router, route, nest) {
  router.route(route, function() {
    if(nest) {
      _.each(nest, (n, rn) => nestedRegisterRoute(this, rn, n));
    }
  });
}

Router.map(function () {
  this.route('config');
  const routes = nestedRoutes(AppStorage.getStore('routes'));
  _.each(routes, (nest, routeName) => nestedRegisterRoute(this,routeName, nest));
});

export default Router;

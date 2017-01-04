import Ember from 'ember';
import config from './config/environment';
import _ from 'lodash/lodash';
import apiConfig from './helpers/api-config';

var Router = Ember.Router.extend({
  location: config.locationType
});

var restEndpoints = ['list', 'create', 'edit', 'view'];

function setupRest(router, route, routeDef) {
  router.route(route, function () {
    _.map(restEndpoints, restEndpoint => {
      console.debug('Adding rest route [' + route + '.' + restEndpoint + ']');
      if (restEndpoint === 'edit' || restEndpoint === 'view') {
        this.route(restEndpoint, {path: '/' + restEndpoint + '/:id'});
      } else {
        this.route(restEndpoint);
      }
    });
  });
}

Router.map(function () {
  _.map(apiConfig.defaultConfig().get('endpoints'), (routeDef, route) => {
    console.debug('Adding route [' + route + ']');
    if (routeDef.type === 'rest') {
      setupRest(this, route, routeDef);
    } else {
      this.route(route);
    }
  });
  console.debug('Routes created');
});

export default Router;

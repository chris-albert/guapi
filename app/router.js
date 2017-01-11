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
      if (restEndpoint === 'edit') {
        this.route(restEndpoint, {path: '/' + restEndpoint + '/:id'});
      } else {
        this.route(restEndpoint);
      }
    });
  });
}

Router.map(function () {
  _.map(apiConfig.defaultConfig().get('projectDefs'), projectDef => {
    console.debug('Adding project route ['+ projectDef.name + ']');
    this.route(projectDef.name, function() {
      _.map(projectDef.endpoints, (endpointDef, endpoint) => {
        console.debug('Adding route [' + endpoint + ']');
        if(endpointDef.type === 'rest') {
          setupRest(this, endpoint, endpointDef);
        } else {
          this.route(endpoint);
        }
      });
    });
  });
  console.debug('Routes created');
});

export default Router;

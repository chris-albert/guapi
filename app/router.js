import Ember from 'ember';
import config from './config/environment';
import _ from 'lodash/lodash';
import apiConfig from './helpers/api-config';

var Router = Ember.Router.extend({
  location: config.locationType
});

//var restEndpoints = ['list', 'create', 'edit', 'view'];
//
//function setupRest(router, route, routeDef) {
//  router.route(route, function () {
//    _.map(restEndpoints, restEndpoint => {
//      console.debug('Adding rest route [' + route + '.' + restEndpoint + ']');
//      this.route(restEndpoint);
//    });
//  });
//}
//
//Router.map(function () {
//  _.map(apiConfig.defaultConfig().get('projectDefs'), projectDef => {
//    console.debug('Adding project route ['+ projectDef.name + ']');
//    this.route(projectDef.name, function() {
//      _.map(projectDef.endpoints, (endpointDef, endpoint) => {
//        console.debug('Adding route [' + endpoint + ']');
//        if(endpointDef.type === 'rest') {
//          setupRest(this, endpoint, endpointDef);
//        } else {
//          this.route(endpoint);
//        }
//      });
//    });
//  });
//  this.route('config');
//  console.debug('Routes created');
//});

Router.map(function () {
  //this.route('index', {path: '/'}, function() {
    this.route('tab1', function() {
      this.route('nestTab1', function() {

      });
      this.route('nestTab2', function() {

      });
    });

    this.route('tab2', function() {
      this.route('nestTab1', function() {
        this.route('2NestsTab1', function() {

        });
      });
    });
  //});

});

export default Router;

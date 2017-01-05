import Ember from 'ember';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

var App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix   : config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver       : Resolver.extend({
    resolve(routeName) {
      return this._super(routeName);
    }
  }),
  ready: function() {
    console.debug('Application is ready');
  }
});


loadInitializers(App, config.modulePrefix);
export default App;

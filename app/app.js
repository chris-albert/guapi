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
    console.log('app ready');
  }
});

console.log('before load initializers');

loadInitializers(App, config.modulePrefix);
console.log('after load initializers');
export default App;

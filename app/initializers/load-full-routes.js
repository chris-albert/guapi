import Ember from 'ember';
import _ from 'lodash/lodash';
import GenericForm from '../controllers/generic-form';
import fullConfig from '../helpers/full-config';

export default {
  name: 'load-full-routes',
  addRoute(route) {
    fullConfig.routes.push(route);
  },
  initialize(application) {
    application.deferReadiness();
    fullConfig.getConfig('/test-raw-config.json')
      .then(config => {
        this.registerRoot(config, application);
        this.setUpInjections(application);
        application.advanceReadiness();
      });
  },
  setUpInjections(application) {
    application.inject('component','router','router:main');
  },
  registerRoot(config, application) {
    console.debug('Registering route: [application]');
    application.register('route:application', Ember.Route.extend({
      model() {
        return {
          nav    : config,
          content: config.get('content')
        };
      },
      activate() {
        console.debug('Entering route [application]');
        this._super();
      }
    }));
    this.registerContent(config.get('content'), application);
  },
  registerContent(content, application) {
    if(content.invoke('isTabs')) {
      content.invoke('each', t => this.registerTab(t, application));
    } else if(content.invoke('isForm')) {
      content.invoke('each', f => this.registerForm(f, application));
    }
  },
  registerTab(tab, application) {
    const route = tab.invoke('genRoute');
    const content = tab.get('content');
    console.debug('Registering route: [' + tab.get('name') + '] at route [' + route + ']');
    this.addRoute(route);
    application.register('route:' + route, Ember.Route.extend({
      templateName: 'components/content-wrapper',
      model() {
        return {
          route: tab.get('name'),
          content: content
        };
      },
      activate() {
        console.debug('Entering route [' + route + ']');
        this._super();
      }
    }));
    this.registerContent(content, application);
  },
  registerForm(form, application) {
    const route = form.invoke('genRoute');
    console.debug('Registering controller at route [' + route + ']');
    const queryParamKeys = form.invoke('fieldValues');
    queryParamKeys.push('as');
    application.register('controller:' + route, Ember.Object.extend({
      queryParams: queryParamKeys,
      qp: Ember.computed('model', function() {
        var obj = {};
        _.map(queryParamKeys, key => {
          obj[key] = this.get(key);
        });
        return obj;
      })
    }));
  }
};

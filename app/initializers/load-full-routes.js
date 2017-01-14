import Ember from 'ember';
import _ from 'lodash/lodash';
import GenericForm from '../controllers/generic-form';
import fullConfig from '../helpers/full-config';

export default {
  name: 'load-full-routes',
  initialize(application) {
    application.deferReadiness();
    fullConfig.getConfig('/test-raw-config.json')
      .then(config => {
        this.registerRoot(config, application);
        this.setUpInjections(application, config);
        application.advanceReadiness();
      });
  },
  setUpInjections(application,api) {
    application.register('config:main',api,{ instantiate: false });
    application.inject('component','globalConfig','config:main');
    application.inject('controller','globalConfig','config:main');
    application.inject('route','globalConfig','config:main');
    application.inject('controller','router','router:main');
    application.inject('component','router','router:main');
  },
  registerRoot(config, application) {
    console.debug('Registering route: [application]');
    application.register('route:application', Ember.Route.extend({
      model() {
        return {
          nav: config,
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
      content.each(t => this.registerTab(t, application));
    } else if(content.invoke('isForm')) {
      content.each(f => this.registerForm(f, application));
    }
  },
  registerTab(tab, application) {
    const route = tab.invoke('genRoute');
    const content = tab.get('content');
    console.debug('Registering tab: [' + tab.get('name') + '] at route [' + route + ']');
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
    console.debug('Registering form');
  }
};

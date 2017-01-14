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
    this.registerContent(config.get('content'), application);
    const route = 'index';
    console.debug('Registering route: [' + route + ']');
    application.register('route:' + route, Ember.Route.extend({
      model() {
        //return content;
        return {
          nav: config
        };
      },
      activate() {
        console.debug('Entering route [' + route + ']');
        this._super();
      }
    }));

    console.debug('Registering route: [application]');
    application.register('route:application', Ember.Route.extend({
      model() {
        return {
          nav: config
        };
      },
      activate() {
        console.debug('Entering route [application]');
        this._super();
      }
    }));
  },
  registerContent(content, application) {
    if(content.invoke('isTabs')) {
      //content.each(t =/> this.registerTab(t, application));
      //this.registerTabs(content, application);
    } else if(content.invoke('isForm')) {
      content.each(f => this.registerForm(f, application));
    }
  },
  registerTabs(content, application) {
    const tabs = _.map(content.get('tabs'), tab => {

      return tab;
    });
    const route = content.invoke('genRoute');
    console.debug('Registering route: [' + route + ']');
    application.register('route:' + route, Ember.Route.extend({
      //renderTemplate() {
      //  this.render('components/tab-component');
      //},
      model() {
        //return content;
      },
      activate() {
        console.debug('Entering route [' + route + ']');
        this._super();
      }
    }));
    //console.log(tabs);
  },
  registerTab(tab, application) {

  },
  //registerTab(tab, application) {
  //  const route = tab.invoke('genRoute');
  //  console.debug('Registering tab: [' + tab.get('name') + '] at route [' + route + ']');
    //application.register('route:' + route, Ember.Route.extend({
    //  renderTemplate() {
    //    this.render('components/tab-component');
    //  },
    //  model() {
    //    //return tab
    //  },
    //  activate() {
    //    console.debug('Entering route [' + route + ']');
    //    this._super();
    //  }
    //}));
    //this.registerContent(tab.get('content'), application);
  //},
  registerForm(form, application) {
    console.debug('Registering form');
  }
};

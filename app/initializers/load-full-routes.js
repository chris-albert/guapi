import Ember from 'ember';
import _ from 'lodash';
import EddyConfig from '../helpers/eddy-config';
import AppStorage from '../helpers/app-storage';

export default {
  name: 'load-full-routes',
  addRoute(route) {
    AppStorage.setStore('routes', _.concat(AppStorage.getStore('routes'),route));
  },
  initialize(application) {
    application.deferReadiness();
    EddyConfig.getConfig()
      .then(config => {
        this.registerRoot(config, application);
        this.setUpInjections(application);
        application.advanceReadiness();
      })
      .catch(err => {
        console.error(err);
        application.advanceReadiness();
      });
  },
  setUpInjections(application) {
    application.inject('component','router','router:main');
    application.inject('controller','router','router:main');
  },
  registerRoot(config, application) {
    const model = {
      model() {
        return {
          nav    : config,
          content: config.get('content'),
          hasConfig: !config.get('emptyConfig'),
          route: {
            full: '',
            base: '',
            end: ''
          }
        };
      }
    };
    this.registerRoute('application', model, application);
    if(!config.get('emptyConfig')) {
      this.registerProjectRoot(config, application);
      this.registerContent(config.get('content'), application, [config.get('name')]);
    }
  },
  registerProjectRoot(config, application) {
    const model = {
      templateName: 'components/content-wrapper',
      model() {
        return {
          content: config.get('content'),
          route: {
            full: config.get('name'),
            base: config.get('name'),
            end: config.get('name')
          }
        };
      }
    };
    this.registerRoute(config.get('name'), model, application);
  },
  registerContent(content, application, stack) {
    if(content.invoke('isTabs')) {
      content.invoke('each', t => this.registerTab(t, application, stack));
    } else if(content.invoke('isForm')) {
      content.invoke('each', f => this.registerForm(f, application, stack));
    }
  },
  registerTab(tab, application, stack) {
    const tabStack = _.concat(stack, _.get(tab,'name'));
    const route = tabStack.join('.');
    const content = tab.get('content');
    const routeDef = {
      templateName: 'components/content-wrapper',
      model() {
        return {
          route: {
            full: route,
            base: _.initial(route.split('.')).join('.'),
            end : tab.get('name')
          },
          content: content
        };
      }
    };
    this.registerRoute(route, routeDef, application);
    this.registerContent(content, application, tabStack);
  },
  registerForm(form, application, stack) {
    const route = stack.join('.');
    this.log('Registering controller at route [' + route + ']');
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
  },
  registerRoute(route, routeDef, application) {
    const self = this;
    this.log('Registering route: [' + route + ']');
    if(route !== 'application') {
      this.addRoute(route);
    }
    application.register('route:' + route, Ember.Route.extend(_.assignIn(routeDef,{
      activate() {
        self.log('Entering route [' + route + ']');
        this._super();
      }
    })));
  },
  log(message)  {
    if(true) {
      console.debug(message);
    }
  }
};

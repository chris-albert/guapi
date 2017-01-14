import Ember from 'ember';
import _ from 'lodash/lodash';
import GenericForm from '../controllers/generic-form';
import apiConfig from '../helpers/api-config';
import fullConfig from '../helpers/full-config';

export default {
  name       : 'load-dynamic-routes',
  restActions: ['list', 'create', 'edit', 'view'],
  initialize(application) {
    application.deferReadiness();
    fullConfig.getConfig('/test-raw-config.json')
      .then(console.log);
    //apiConfig.getConfig('/config.json').then(api => {
    //  this.handleApi(api,application);
    //  application.advanceReadiness();
    //});
  },
  handleApi(api, application) {
    _.map(api.get('projectDefs'), projectDef => {
      var tabs = {};
      _.map(projectDef.endpoints, (endpointDef, endpoint) => {
        var route = projectDef.name + '.' + endpoint;
        tabs[route] = endpointDef;
        this.registerComponents(endpointDef, route, application);
      });
      this.registerProject(projectDef, tabs, application);
      this.setUpInjections(application,api);
    });
  },
  registerProject(project, tabs, application) {
    console.debug('Registering index route [' + project.name + ']');
    application.register('route:' + project.name, Ember.Route.extend({
      renderTemplate() {
        this.render('components/tab-component');
      },
      model() {
        return _.map(tabs, (tab, key) => {
          return {
            display: tab.display,
            route  : key
          };
        });
      },
      activate() {
        console.debug('Entering route [' + project.name + ']');
        this._super();
      }
    }));
  },
  registerComponents(routeDef, route, application) {

    if (routeDef.type === 'rest') {
      this.registerRest(routeDef, route, application);
    } else {
      this.registerAll(routeDef, route, application);
    }
  },
  setUpInjections(application,api) {
    application.register('config:main',api,{ instantiate: false });
    application.inject('component','globalConfig','config:main');
    application.inject('controller','globalConfig','config:main');
    application.inject('route','globalConfig','config:main');
    application.inject('controller','router','router:main');
    application.inject('component','router','router:main');
  },
  registerRest(routeDef, route, application) {
    //This is the base page of the rest tab
    this.registerRestRoute(routeDef, route, application);
    //These are the actual rest tabs
    this.registerListRoute(routeDef, route, application);
    this.registerCreateRoute(routeDef, route, application);
    this.registerEditRoute(routeDef, route, application);
    this.registerViewRoute(routeDef, route, application);
  },
  registerRestRoute(routeDef, route, application) {
    application.register('route:' + route, Ember.Route.extend({
      renderTemplate() {
        this.render('components/tab-component');
      },
      model() {
        var tabs = ['list','create','view','edit'];
        return _.map(tabs, tab => {
          return {
            display: tab.capitalize(),
            route: route + '.' + tab
          };
        });
      },
      activate() {
        console.debug('Entering route [' + route + ']');
        this._super();
      }
    }));
  },
  registerListRoute(routeDef, route, application) {
    this.registerAll(this.genRouteDef(routeDef,'list'), route + '.list', application);
  },
  registerCreateRoute(routeDef, route, application) {
    this.registerAll(this.genRouteDef(routeDef,'create'), route + '.create', application);
  },
  registerEditRoute(routeDef, route, application) {
    this.registerAll(this.genRouteDef(routeDef,'edit'), route + '.edit', application);
  },
  registerViewRoute(routeDef, route, application) {
    this.registerAll(this.genRouteDef(routeDef,'view'), route + '.view', application);
  },
  registerAll(routeDef, route, application) {
    console.debug('Registering route [' + route + ']');
    this.registerRoute(routeDef, route, application, this.restModel);
    this.registerController(routeDef, route, application);
  },
  registerRoute(routeDef, route, application, modelFunc) {
    var self = this;
    application.register('route:' + route, Ember.Route.extend({
      renderTemplate() {
        this.render('components/generic-form');
      },
      model(params) {
        return modelFunc.call(self, routeDef, route, params, this);
      },
      setupController(controller, model) {
        controller.set('content', model);
      },
      afterModel() {
      },
      activate() {
        console.debug('Entering route [' + route + ']');
        this._super();
      }
    }));
  },
  registerController(routeDef, route, application) {
    var qp = _.map(routeDef.fields, 'name');
    qp.push('as');
    application.register('controller:' + route, GenericForm.extend({
      queryParams: qp
    }));
  },
  setUpRestModel(routeDef, route, params) {
    var m = _.cloneDeep(routeDef);
    var routeSplit = route.split('.');
    m.submitDisplay = this.getSubmitDisplay(route);
    m.route = {
      name: route,
      last: _.last(routeSplit),
      base: _.initial(routeSplit).join('.')
    };
    m.params = params;
    m.method = routeDef.method;
    return m;
  },
  restModel(routeDef, route, params) {
    var m = this.setUpRestModel(routeDef, route, params);
    return new Ember.RSVP.Promise(function (resolve) {
      resolve(m);
    });
  },
  getSubmitDisplay(route) {
    var n = route.split('.');
    if(n.length >= 2) {
      return _.capitalize(_.last(n));
    }
  },
  filterFields(routeDef, name) {
    if (routeDef[name]) {
      if (_.isString(_.first(routeDef[name]))) {
        return _.flatten(_.map(routeDef[name], l => _.filter(routeDef.fields, field => {
          return field.name === l;
        })));
      } else if (_.isObject(_.first(routeDef[name]))) {
        return routeDef[name];
      } else {
        return [];
      }
    }
    return routeDef.fields;
  },
  copyFromRequest(routeDef, requestKey, objKey, copyToObj) {
    if(routeDef.request && routeDef.request[requestKey] && routeDef.request[requestKey][objKey]) {
      copyToObj[objKey] = routeDef.request[requestKey][objKey];
    }
  },
  genRequest(routeDef, routeName) {
    _.map(['fields','dataLocation','method','path'], copyKey => {
      this.copyFromRequest(routeDef,routeName, copyKey, routeDef);
    });
  },
  genResponse(routeDef, routeName) {
    const routeAction = _.get(routeDef,'response.actions.' + routeName);
    routeDef.response.actions = [];
    if(!_.isUndefined(routeAction)) {
      routeDef.response.actions = routeAction;
    }
  },
  genRouteDef(routeDef, routeName) {
    var rd    = _.cloneDeep(routeDef);
    this.genRequest(rd, routeName);
    this.genResponse(rd, routeName);
    delete rd.request;
    return rd;
  }
};

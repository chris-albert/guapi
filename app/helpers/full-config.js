import Ember from 'ember';
import _ from 'lodash';
import CondensedConfig from './load-condensed-config';

const Root = Ember.EddyObject.extend({
  configType: 'Root',
  display: null,
  settings: null,
  content: null,
  auth: null,
  init() {
    this.validate('Root', ['display','settings','content']);
    this.set('content', new Content(this.get('content')));
    this.set('auth', Form.create(this.get('auth')));
  }
});

const Content = Ember.EddyObject.extend({
  configType: 'Content',
  type: null,
  init() {
    this.validate('Content', ['type']);
    switch(this.get('type')) {
      case 'tabs':
        this.validate('Content', ['tabs']);
        var tabs = _.map(this.get('tabs'), tab => {
          tab.parent = this;
          return new Tab(tab);
        });
        this.set('tabs', tabs);
        return;
      case 'form':
        const form = new Form(this);
        form.parent = this;
        this.set('form', form);
        return;
      default:
        throw new Error('Tab type [' + this.get('type') + '] not valid');
    }
  },
  isTabs() {
    return this.get('type') === 'tabs';
  },
  isForm() {
    return this.get('type') === 'form';
  },
  each(f) {
    if(this.isTabs()) {
      _.each(this.get('tabs'),f);
    } else if(this.isForm()) {
      f(this.get('form'));
    }
  },
  genRoute() {
    var routeStack = [this.get('name')];
    function recurse(tab) {
      if(tab.get('parent')) {
        routeStack.push(tab.get('parent.name'));
        recurse(tab.get('parent'));
      }
    }
    recurse(this);
    return routeStack.reverse().join('.');
  }
});

const Tab = Ember.EddyObject.extend({
  configType: 'Tab',
  name: null,
  display: null,
  content: null,
  route: null,
  parent: null,
  init() {
    this.validate('Tab', ['name', 'display', 'content']);
    const content = this.get('content');
    content.parent = this;
    this.set('content', new Content(content));
    this.set('route', this.genRoute());
  },
  genRoute() {
    var routeStack = [this.get('name')];
    function recurse(tab) {
      if(tab.get('parent')) {
        routeStack.push(tab.get('parent.name'));
        recurse(tab.get('parent'));
      }
    }
    recurse(this);
    return _.compact(routeStack.reverse()).join('.');
  }
});

const Form = Ember.EddyObject.extend({
  configType: 'Form',
  request: null,
  response: null,
  init() {
    this.validate('Form', ['request', 'response']);
    this.set('request', new Request(this.get('request')));
    this.set('response', new Response(this.get('response')));
  },
  genRoute() {
    var routeStack = [];
    function recurse(tab) {
      if(tab.get('parent')) {
        routeStack.push(tab.get('parent.name'));
        recurse(tab.get('parent'));
      }
    }
    recurse(this);
    return _.compact(routeStack.reverse()).join('.');
  },
  fieldValues() {
    return _.map(this.get('request.fields'),field => {
      return field.name;
    });
  }
});

const Request = Ember.EddyObject.extend({
  configType: 'Request',
  path: null,
  method: null,
  location: null,
  auth: null,
  fields: null,
  root: null,
  submit: null,
  init() {
    this.validate('Request',['path','method','location','auth','fields','submit']);
  }
});

const Response = Ember.EddyObject.extend({
  configType: 'Response',
  root: null,
  type: null,
  fields: null,
  init() {
    this.validate('Response',['type','fields']);
  }
});

const Field = Ember.EddyObject.extend({
  configType: 'Field',
  display: null,
  name: null,
  type: null,
  init() {

  }
});

const Submit = Ember.EddyObject.extend({
  configType: 'Submit',
  display: null,
  type: null,
  size: null,
  init() {
    this.validate('Submit', ['display','type', 'size']);
  }
});

const FullConfig = Ember.Object.extend({
  init() {
    this.set('root',new Root(this));
  }
});

export default Ember.Object.extend({
  rawConfigJson: '/test-raw-config.json',
  cache: {},
  routes: [],
  nestedRoutes() {
    const obj = {};
    function setNest(route) {
      const r = _.get(obj,route);
      if(!r) {
        _.set(obj,route);
      }
    };
    _.each(this.get('routes'),setNest);
    return obj;
  },
  getConfig(url) {
    const u = url || this.get('rawConfigJson');
    const cache = this.getCache(u);
    if (cache) {
      console.log('Api Config cache hit for [' + u + ']');
      return Promise.resolve(cache);
    } else {
      return this.fetchConfig(u);
    }
  },
  fetchConfig(url) {
    //return $.ajax({
    //  url: url,
    //  dataType: 'json'
    //}).then(j => {
    //  const api = this.buildApiDef(j);
    //  this.putCache(url, api);
    //  return api;
    //});
    return this.fetchCondensedConfig()
      .then(c => {
        const api = this.buildApiDef(c);
        console.log(api);
        this.putCache(this.get('rawConfigJson'),api);
        return api;
      });
  },
  fetchCondensedConfig() {
    return CondensedConfig.getConfig();
  },
  defaultConfig() {
    var cache = this.getCache(this.get('rawConfigJson'));
    if(cache) {
      return cache;
    }
    throw new Error('Cant get cache since its empty');
  },
  buildApiDef(json) {
    return FullConfig.create(json).get('root');
  },
  putCache(url, config) {
    this.set('cache.' + this.keyifyUrl(url), config);
  },
  getCache(url) {
    return this.get('cache.' + this.keyifyUrl(url));
  },
  keyifyUrl(url) {
    return url.replace('.','_');
  }
}).create();

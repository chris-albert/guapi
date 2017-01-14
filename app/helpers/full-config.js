import Ember from 'ember';
import _ from 'lodash/lodash';

const Root = Ember.EddyObject.extend({
  display: null,
  settings: null,
  content: null,
  init() {
    this.validate('Root', ['display','settings','content']);
    this.set('content', new Content(this.get('content')));
  }
});

const Content = Ember.EddyObject.extend({
  type: null,
  init() {
    this.validate('Content', ['type']);
    switch(this.get('type')) {
      case 'tabs':
        this.validate('Content', ['tabs']);
        var tabs = _.map(this.get('tabs'), tab => {
          const t = new Tab(tab);
          t.set('parent', this.get('parent'));
          return t;
        });
        this.set('tabs', tabs);
        return;
      case 'form':
        this.set('form', new Form(this));
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
  },
  genRoute() {
    return 'index';
  }
});

const Tab = Ember.EddyObject.extend({
  name: null,
  display: null,
  content: null,
  route: null,
  parent: null,
  init() {
    this.validate('Tab', ['name', 'display', 'content']);
    this.set('content.parent', this);
    this.set('content', new Content(this.get('content')));
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
    return routeStack.reverse().join('.');
  }
});


const Form = Ember.EddyObject.extend({
  request: null,
  response: null,
  init() {
    this.validate('Form', ['request', 'response']);
    this.set('request', new Request(this.get('request')));
    this.set('response', new Response(this.get('response')));
  }
});

const Request = Ember.EddyObject.extend({
  path: null,
  method: null,
  location: null,
  auth: null,
  fields: null,
  root: null,
  init() {
    this.validate('Request',['path','method','location','auth','fields']);
  }
});

const Response = Ember.EddyObject.extend({
  root: null,
  type: null,
  fields: null,
  init() {
    this.validate('Response',['root','type','fields']);
  }
});

const Field = Ember.EddyObject.extend({
  display: null,
  name: null,
  type: null,
  init() {

  }
});

const FullConfig = Ember.Object.extend({
  init() {
    console.log('FullConfig.init Starting');
    this.set('root',new Root(this));
    console.log('FullConfig.init Done');
  }
});

export default Ember.Object.extend({
  cache: {},
  getConfig(url) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var cache = self.getCache(url);
      if (cache) {
        console.log('Api Config cache hit for [' + url + ']');
        resolve(cache);
      } else {
        $.ajax({
          url     : url,
          dataType: 'json'
        }).then(json => {
          return self.buildApiDef(json);
        }).then(api => {
          self.putCache(url, api);
          resolve(api);
        }).catch(reject);
      }
    });
  },
  defaultConfig() {
    var cache = this.getCache('/test-raw-config.json');
    if(cache) {
      return cache;
    }
    throw new Error('Cant get cache since its empty');
  },
  buildApiDef(json) {
    const fullConfig = FullConfig.create(json)
    return fullConfig.get('root');
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

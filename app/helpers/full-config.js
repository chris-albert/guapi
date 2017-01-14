import Ember from 'ember';
import _ from 'lodash/lodash';

const HelperObject = Ember.Mixin.create({
  validate(name, keys) {
    var errors = [];
    _.each(keys, key => {
      if(_.isUndefined(this.get(key)) || _.isNull(this.get(key))) {
        errors.push(key);
      }
    });
    if(!_.isEmpty(errors)) {
      throw new Error('Error validating [' + name + ']: missing properties [' + errors + ']');
    }
  }
});

const Root = Ember.Object.extend({
  display: null,
  settings: null,
  content: null,
  init() {
    this.set('content', new Content(this.get('content')));
  }
});

const Content = Ember.Object.extend(HelperObject, {
  type: null,
  init() {
    this.validate('Content', ['type']);
    switch(this.get('type')) {
      case 'tabs':
        this.validate('Content', ['tabs']);
        var tabs = _.map(this.get('tabs'), tab => {
          return new Tab(tab);
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
  }
});

const Tab = Ember.Object.extend(HelperObject, {
  name: null,
  display: null,
  content: null,
  init() {
    this.validate('Tab', ['name', 'display', 'content']);
    this.set('content', new Content(this.get('content')));
  }
});


const Form = Ember.Object.extend(HelperObject, {
  request: null,
  response: null,
  init() {
    this.validate('Form', ['request', 'response']);
    this.set('request', new Request(this.get('request')));
    this.set('response', new Response(this.get('response')));
  }
});

const Request = Ember.Object.extend(HelperObject, {
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

const Response = Ember.Object.extend(HelperObject, {
  root: null,
  type: null,
  fields: null,
  init() {
    this.validate('Response',['root','type','fields']);
  }
});

const Field = Ember.Object.extend(HelperObject, {
  display: null,
  name: null,
  type: null,
  init() {

  }
});

const FullConfig = Ember.Object.extend({
  init() {
    console.log('FullConfig.init Starting');
    const root = new Root(this);
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
    return FullConfig.create(json);
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

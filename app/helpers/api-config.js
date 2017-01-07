import Ember from 'ember';
import _ from 'lodash/lodash';

var apiDefinition = Ember.Object.extend({
  projectDefs: [],
  load() {
    return Promise.all(_.map(this.get('projects'), project => {
      return $.ajax({
        url: '/projects/' + project + '.json',
        dataType: 'json'
      }).then(p => this.addProject(p));
    })).then(() => {return this;});
  },
  addProject(projectJson) {
    _.map(projectJson.endpoints, endpoint => {
      var obj = {};
      _.map(projectJson, (value,projectKey) => {
        if(projectKey !== 'endpoints') {
          obj[projectKey] = value;
        }
      });
      endpoint.project = obj;
    })
    this.set('projectDefs',this.get('projectDefs').concat(projectJson));
  }
});

/**
 * This helper is used to load/cache api config files
 */
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
    var cache = this.getCache('/config.json');
    if(cache) {
      return cache;
    }
    throw new Error('Cant get cache since its empty');
  },
  buildApiDef(json) {
    const api = apiDefinition.create(json);
    return api.load();
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

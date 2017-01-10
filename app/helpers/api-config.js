import Ember from 'ember';
import _ from 'lodash/lodash';

const restDataLocation = {
  list  : 'query',
  create: 'json',
  view  : 'query',
  edit  : 'json'
};

const restMethod = {
  list  : 'GET',
  create: 'POST',
  view  : 'GET',
  edit  : 'PUT'
};

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
      endpoint.fields = this.expandFields(endpoint.fields);
      this.genEndpoint(endpoint);
    });
    this.set('projectDefs',this.get('projectDefs').concat(projectJson));
  },
  /**
   * Here we will do any pre-processing on the def json files
   * If we want to add fields or preprocessors, here is where to do it
   */
  genEndpoint(endpoint) {
    if(endpoint.type === 'rest') {
      const fieldsHash = _.groupBy(endpoint.fields,'name');

      _.map(endpoint.request, (fields, restType) => {
        endpoint.request[restType] = {
          fields: []
        };
        _.map(fields, key => {
          if(fieldsHash[key]) {
            endpoint.request[restType].fields.push(_.head(fieldsHash[key]));
            if(restDataLocation[restType]) {
              endpoint.request[restType].dataLocation = restDataLocation[restType];
            }
            if(restMethod[restType]) {
              endpoint.request[restType].method = restMethod[restType];
            }
            endpoint.request[restType].path = this.restPath(restType, endpoint);
          }
        });
      });
    }
    this.setUpResponse(endpoint);
  },
  setUpResponse(endpoint) {
    if(!_.has(endpoint,'response')) {
      _.set(endpoint,'response',{});
    }
    if(!_.has(endpoint,'response.jsonRoot') && _.has(endpoint, 'jsonRoot')) {
      _.set(endpoint, 'response.jsonRoot', _.get(endpoint, 'jsonRoot'));
    }
    if(!_.has(endpoint,'response.pluralJsonRoot')) {
      _.set(endpoint, 'response.pluralJsonRoot', _.get(endpoint, 'jsonRoot') + 's');
    }
    if(!_.has(endpoint,'response.columns')) {
      _.set(endpoint, 'response.columns', '*');
    }
  },
  /**
   * Expands endpoint fields, so you don't have to define a full field
   *
   * If you have field that is just a `name` and you want the display to be
   * the the same as name but with spaces and caps, this will recreate a field for you
   */
  expandFields(fields) {
    var f = [];
    _.map(fields, field => {
      if(_.isString(field)) {
        f.push({
          name: field,
          display: this.formatDisplay(field)
        });
      } else if(_.isObject(field)) {
        if(_.isUndefined(field.display)) {
          field.display = this.formatDisplay(field.name);
        }
        f.push(field);
      }
    });
    return f;
  },
  restPath(type, routeDef) {
    if(type === 'view' || type === 'edit' && routeDef.restId) {
      return routeDef.path + '/{{' + routeDef.restId + '}}';
    }
    return routeDef.path;
  },
  formatDisplay(s) {
    return _.map(s.decamelize().split('_'), ss =>{
      return ss.capitalize();
    }).join(' ');
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

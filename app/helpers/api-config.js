import Ember from 'ember';
import _ from 'lodash/lodash';

var apiDefinition = Ember.Object.extend({

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
          dataType: 'json',
          complete(xhr) {
            var json = xhr.responseJSON;
            if (xhr.status === 200 && json) {
              var api = self.buildApiDef(json);
              self.putCache(url, api);
              resolve(api);
            } else {
              console.log('error in fetching config from [' + url + ']');
              reject();
            }
          }
        });
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
    return apiDefinition.create(json);
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

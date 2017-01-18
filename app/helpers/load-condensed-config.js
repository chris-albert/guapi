import Ember from 'ember';
import _ from 'lodash';
import CondensedConfig from './condensed-config';

export default Ember.Object.extend({
  condensedConfigJson: '/config/condensed.json',
  cache: {},
  getConfig(url) {
    const u = url || this.get('condensedConfigJson');
    var self = this;
    return new Promise(function (resolve, reject) {
      var cache = self.getCache(u);
      if (cache) {
        console.log('Api Config cache hit for [' + u + ']');
        resolve(cache);
      } else {
        $.ajax({
          url     : u,
          dataType: 'json'
        }).then(json => {
          return CondensedConfig.process(json);
        }).then(api => {
          self.putCache(u, api);
          resolve(api);
        }).catch(reject);
      }
    });
  },
  defaultConfig() {
    var cache = this.getCache(this.get('condensedConfigJson'));
    if(cache) {
      return cache;
    }
    throw new Error('Cant get cache since its empty');
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

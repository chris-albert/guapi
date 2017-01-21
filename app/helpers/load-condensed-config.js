import Ember from 'ember';
import _ from 'lodash';
import CondensedConfig from './condensed-config';
import localStorage from './local-storage';

export default Ember.Object.extend({
  condensedConfigJson: window.location.origin + window.location.pathname + '/config/condensed.json',
  cache: {},
  getConfig(url) {
    const u = this.getConfigFileUrl(url);
    var self = this;
    return new Promise(function (resolve, reject) {
      var cache = self.getCache(u);
      if (cache) {
        console.log('Api Config cache hit for [' + u + ']');
        resolve(cache);
      } else {
        console.debug('Trying to load config from [' + u + ']');
        $.ajax({
          url     : u,
          dataType: 'json'
        }).then(json => {
          return CondensedConfig.process(json);
        }).then(api => {
          self.putCache(u, api);
          resolve(api);
        }).catch(e => {
          console.error('Error in loading config from [' + u + ']');
          resolve({});
          //reject(e);
        });
      }
    });
  },
  getConfigFileUrl(url) {
    if(_.isUndefined(url)) {
      const storeConfig = localStorage.getStore('configFile');
      if(_.isUndefined(storeConfig)) {
        return this.get('condensedConfigJson');
      }
      return storeConfig;
    }
    return url;
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

import Ember from 'ember';
import _ from 'lodash';
import LocalStorage from '../helpers/local-storage';
import GithubConfig from '../helpers/github-config';
import GuapiConfig from '../helpers/guapi-config';
import HttpConfig from '../helpers/http-config';

export default Ember.Controller.extend({
  config: {
    full: LocalStorage.getStoreJson('fullConfig'),
    condensed: LocalStorage.getStoreJson('condensedConfig')
  },
  actions: {
    loadDefault() {
      LocalStorage.removeStore('condensedConfig');
      window.location.reload(true);
    },
    load() {
      window.location.reload(true);
    },
    jsonError(e) {
      console.error('jsonError', e);
    },
    editable(e) {
      return e;
    },
    change(e) {
      console.log('change', e);
      LocalStorage.setStoreJson('condensedConfig', e);
    },
    saveConfigUrl() {
      const configUrl = this.get('configFields.0.value');
      HttpConfig.fetchConfig(configUrl)
        .then(c => GuapiConfig.processAndSave(c));
    },
    saveGithubUrl() {
      const data = _.fromPairs(_.map(this.get('gihubConfigFields'),field => {
        return [field.name,field.value]
      }));
      GithubConfig.fetchConfig(data)
        .then(c => GuapiConfig.processAndSave(c));
    },
    clearConfig() {
      LocalStorage.removeStore('config')
    },
    refresh() {
      window.location.reload(true);
    }
  },
  configFields: [
    {
      name: 'configUrl',
      display: "Config URL"
    }
  ],
  gihubConfigFields: [
    {
      name: 'githubUrl',
      display: 'GitHub URL',
      value: 'https://github.com/Ticketfly/guapi-config/blob/master/ticketfly.json'
    },
    {
      name: 'username',
      display: 'Username',
      value: 'creasetoph'
    },
    {
      name: 'accessKey',
      display: 'Access Key',
      value: ''
    }
  ],
  submit: {
    display: "Submit",
    type: "primary",
    size: "sm"
  },
  validateMessage: Ember.computed('', function() {

  }),
  init() {
    this.set('configFields.0.value',LocalStorage.getStore('configUrl'));
    this._super();
  }
});

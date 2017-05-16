import Ember from 'ember';
import _ from 'lodash';
import LocalStorage from '../helpers/local-storage';

function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = btoa(tok);
  return "Basic " + hash;
}

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
      LocalStorage.setStore('configUrl',configUrl);
      window.location.reload(true);
    },
    saveGithubUrl() {
      const data = _.fromPairs(_.map(this.get('gihubConfigFields'),field => {
        return [field.name,field.value]
      }));
      const url = [
        'https://api.github.com/repos',
        data.owner,
        data.repo,
        'contents',
        data.path
      ].join('/');
      const opts = {
        url: url,
        method: 'GET',
        beforeSend: function (xhr){
          xhr.setRequestHeader('Authorization', make_base_auth('creasetoph', data.accessKey));
        }
      };
      $.ajax(opts)
        .then(data => {
          console.log(data);
        })
        .catch(e => {
          console.error(e);
        });
      console.log(url);
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
      name: 'owner',
      display: 'Owner',
      value: 'ticketfly'
    },
    {
      name: 'repo',
      display: 'Repo',
      value: 'guapi-config'
    },
    {
      name: 'path',
      display: 'Path',
      value: 'ticketfly.json'
    },
    {
      name: 'username',
      display: 'Username',
      value: 'creasetoph'
    },
    {
      name: 'accessKey',
      display: 'Access Key',
      value: '1c9ea165727f95abfa68f058227494ef73d24477'
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

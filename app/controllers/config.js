import Ember from 'ember';
import _ from 'lodash';
import LocalStorage from '../helpers/local-storage';
import GithubConfig from '../helpers/github-config';
import GuapiConfig from '../helpers/guapi-config';
import HttpConfig from '../helpers/http-config';

export default Ember.Controller.extend({
  queryParams: [
    'configUrl',
    'configGo',
    'githubUrl',
    'githubGo',
    'route'
  ],
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
      this.processAndSaveConfigUrl();
    },
    saveGithubUrl() {
      this.processAndSaveGithubUrl();
    },
    switchGithubType() {
      this.set('githubPrivate', !this.get('githubPrivate'));
    },
    clearConfig() {
      LocalStorage.removeStore('config')
    },
    refresh() {
      window.location.reload(true);
    }
  },
  processPopover(promise,popoverName) {
    return promise
      .then(wasSuccessfull => {
        if(wasSuccessfull) {
          this.set(popoverName + '.body', 'Successfully loaded config. <a href="javascript:window.location.reload();">Refresh</a> page to view.');
        } else {
          this.set(popoverName + '.body', 'Error loading config');
        }
        this.set(popoverName + '.visible', true);
      })
      .catch(() => {
        this.set(popoverName + '.body', 'Error loading config');
        this.set(popoverName + '.visible', true);
      })
  },
  processAndSaveConfigUrl() {
    const configUrl = this.get('configFields.0.value');
    return this.processPopover(HttpConfig.fetchConfig(configUrl)
      .then(c => GuapiConfig.processAndSave(c)),'httpPopover');
  },
  processAndSaveGithubUrl() {
    const data = this.getGithubData();
    return this.processPopover(GithubConfig.fetchConfig(data)
      .then(c => GuapiConfig.processAndSave(c)),'githubPopover');
  },
  getGithubData() {
    let fields = {};
    if(this.get('githubPrivate')) {
      fields = this.get('githubPrivateFields');
    } else {
      fields = this.get('githubPublicFields');
    }
    return _.fromPairs(_.map(fields,field => {
      return [field.name,field.value]
    }));
  },
  githubPrivate: false,
  githubSwitchText: Ember.computed("githubPrivate", function() {
    if(this.get('githubPrivate')) {
      return "Public Mode"
    }
    return "Private Mode"
  }),
  configFields: [
    {
      name: 'configUrl',
      display: "Config URL"
    }
  ],
  githubPrivateFields: [
    {
      name: 'githubUrl',
      display: 'GitHub URL'
    },
    {
      name: 'username',
      display: 'Username'
    },
    {
      name: 'accessKey',
      display: 'Access Key'
    },
    {
      name: 'private',
      value: true,
      type: 'hidden'
    }
  ],
  githubPublicFields: [
    {
      name: 'githubUrl',
      display: 'GitHub URL'
    },
    {
      name: 'private',
      value: false,
      type: 'hidden'
    }
  ],
  submit: {
    display: "Submit",
    type: "primary",
    size: "sm"
  },
  validateMessage: Ember.computed('', function() {

  }),
  httpPopover: {
    active: "true",
    body: "",
    visible: false,
    trigger: "manual"
  },
  githubPopover: {
    active: "true",
    body: "",
    visible: false,
    trigger: "manual"
  },
  querySet() {
    const configUrl = this.get('configUrl');
    const githubUrl = this.get('githubUrl');
    const route = this.get('route');
    if(!_.isUndefined(route) && !_.isNull(route)) {
      LocalStorage.setStore('routeOnReload',route);
    }
    this.set('configFields.0.value', configUrl);
    this.set('githubPublicFields.0.value', githubUrl);
    this.set('githubPrivateFields.0.value', githubUrl);
    let configPromise = null;
    if(this.get('configGo') === "true") {
      configPromise = this.processAndSaveConfigUrl();
    } else if(this.get('githubGo') === "true") {
      configPromise = this.processAndSaveGithubUrl();
    }
    //http://localhost:4200/#/config?configGo=true&configUrl=http%3A%2F%2Flocalhost%3A8080%2Flinkerd.json&route=linkerd.linkerd.health
    //http://localhost:4200/#/config?configUrl=http%3A%2F%2Flocalhost%3A8080%2Flinkerd.json
    if(!_.isNull(configPromise)) {
      configPromise.then(() => {
          setTimeout(function(){
            const url = window.location.href.replace(/\?.*$/,'');
            window.location.replace(url);
            window.location.reload(true);
          },1000);
        });
    }
  },
  init() {
    $('[data-toggle="popover"]').popover();
    this._super(arguments);
    _.map(this.get('queryParams'),qp => {
      this.addObserver(qp,this,'querySet');
    });
    const routeOnReload = LocalStorage.getStore('routeOnReload');
    if(!_.isUndefined(routeOnReload) && !_.isNull(routeOnReload)) {
      LocalStorage.removeStore('routeOnReload');
      this.transitionToRoute(routeOnReload);
    }
  }
});

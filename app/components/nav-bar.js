import Ember from 'ember';
import _ from 'lodash/lodash';
import apiConfig from '../helpers/api-config';

export default Ember.Component.extend({
  fields      : Ember.computed('', function () {
    var settings = apiConfig.defaultConfig().get('settings');
    _.map(settings, setting => {
      setting.value = this.get('settings').getStore(setting.name);
    });
    return settings;
  }),
  environment : Ember.computed('fields.@each.value', function () {
    return this.get('fields.0.value');
  }),
  settingsQuickView: Ember.computed('formChanged', function() {
    var view = '';
    _.map(this.get('fields'), field => {
      view = view + field.display + ' [' + field.value + '] ';
    });
    return view;
  }),
  token: Ember.computed('tokenChanged',function() {
    return this.get('settings').getStore('token');
  }),
  loginMessage: Ember.computed('token', function () {
    if (this.get('token')) {
      return 'Logged In';
    }
    return 'Log In';
  }),
  loginHidden : Ember.computed('token', function () {
    if (_.isString(this.get('token'))) {
      return 'hidden';
    }
    return '';
  }),
  logoutHidden: Ember.computed('token', function () {
    if (!_.isString(this.get('token'))) {
      return 'hidden';
    }
    return '';
  }),
  actions     : {
    logout() {
      this.get('settings').removeStore('token');
      this.set('tokenChanged',!this.get('tokenChanged'));
    }
  },
  settings    : Ember.inject.service('settings-store'),
  init() {
    //this.get('settings').setStoreObj(this.getSettings());
    //TODO: This needs to be added to the config
    //Cloning here so the login form and the getToken form don't have their values binded
    //this.set('loginFields', _.cloneDeep(this.getLoginForm().fields));
    this._super();
  },
  loginFields: Ember.computed('', function() {
    const settingFields = apiConfig.defaultConfig().get('loginForm.settingFields');
    var loginFields = apiConfig.defaultConfig().get('loginForm.fields')
    _.map(loginFields, field => {
      if(_.includes(settingFields, field.name)) {
        field.value = this.get('settings').getStore(field.name);
      }
    });
    return loginFields;
  }),
  getLoginForm() {
    return apiConfig.defaultConfig().get('loginForm');
  },
  didInsertElement() {
    var self = this;
    //This is dumb, but we need to not have the menu close when we click in the form
    this.$('.dont-close').on('click', e => {
      if ($(e.target).prop('tagName') !== 'BUTTON') {
        e.stopPropagation();
      }
    });
    //So we save settings every time we close the settings dropdown
    this.$('.dont-close').on('focusout', e => {
      this.storeSettings(this.getSettings());
      this.set('formChanged', this.get('formChanged') + 'i');
    });
    this.$('.login-button').on('click', e => {
      self.login();
      e.stopPropagation();
    });
  },
  getSettings() {
    return this.flattenFields(this.get('fields'));
  },
  storeSettings(data) {
    this.get('settings').setStoreObj(data);
  },
  login() {
    this.set('loginError', null);
    const data = this.flattenFields(this.get('loginFields'));
    const authHeader = this.getAuthHeader(data)
    this.handleSettingFields(data);
    const options = {
      url    : this.getUrl(),
      method : this.getLoginForm().method,
      data   : this.dataFilter(data),
      headers: authHeader
    };
    $.ajax(options).then(d => {
      if(d.access_token) {
        this.get('settings').setStore('token', d.access_token);
        this.toggleProperty('tokenChanged');
      }
    }, e => {
      var error;
      if (e && e.responseJSON && e.responseJSON.error_description) {
        error = e.responseJSON.error_description;
      } else {
        error = 'Unknown error';
      }
      this.set('loginError', error);
    });
  },
  dataFilter(data) {
    _.map(apiConfig.defaultConfig().get('loginForm.dataFilter'), dataFilter => {
      delete data[dataFilter];
    });
    return data;
  },
  handleSettingFields(data) {
    _.map(apiConfig.defaultConfig().get('loginForm.settingFields'), settingField => {
      this.get('settings').setStore(settingField, data[settingField]);
    });
  },
  flattenFields(fields) {
    return _.object(_.map(fields, field => {
      return [field.name, field.value];
    }));
  },
  getUrl() {
    const obj = {
      settings: this.get('settings').getStoreObj()
    };
    return Handlebars.compile(this.getLoginForm().baseUrl)(obj) +
        this.getLoginForm().path;
  },
  getAuthHeader(data) {
    if(apiConfig.defaultConfig().get('loginForm.auth.type') === 'basic') {
      const userKey = apiConfig.defaultConfig().get('loginForm.auth.user');
      const passKey = apiConfig.defaultConfig().get('loginForm.auth.pass');
      return this.buildAuthHeader(data[userKey], data[passKey]);
    }
  },
  buildAuthHeader(user, pass) {
    return {
      'Authorization': 'Basic ' + btoa(user + ':' + pass)
    };
  }
});

import Ember from 'ember';
import _ from 'lodash/lodash';
import apiConfig from '../helpers/api-config';

export default Ember.Component.extend({
  fields      : Ember.computed('', function () {
    return [
      {
        'name'   : 'baseUrl',
        'display': 'Base Url',
        'value'  : this.get('settings').getStore('baseUrl','http://localhost:8085')
      },
      {
        'name'   : 'clientId',
        'display': 'Client Id',
        'value'  : this.get('settings').getStore('clientId','LJlrqchx4HL42uvnJQgEsD')
      },
      {
        'name'   : 'clientSecret',
        'display': 'Client Secret',
        'value'  : this.get('settings').getStore('clientSecret','ShLWiJN7qRTdJz3R4qympEyTHM5ZK0jwzq0SDq4D')
      }
    ];
  }),
  environment : Ember.computed('fields.0.value', function () {
    var parser  = document.createElement('a');
    parser.href = this.get('fields.0.value');
    return parser.hostname;
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
    this.set('loginFields', _.cloneDeep(this.getLoginForm().fields));
    this._super();
  },
  getLoginForm() {
    return apiConfig.defaultConfig().get('endpoints.getToken');
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
    $.ajax({
      url    : this.get('settings').getStore('baseUrl') + this.getLoginForm().path,
      method : this.getLoginForm().method,
      data   : this.flattenFields(this.get('loginFields')),
      headers: this.buildAuthHeader(
        this.get('settings').getStore('clientId'),
        this.get('settings').getStore('clientSecret')
      )
    }).then(d => {
      if(d.access_token) {
        this.get('settings').setStore('token', d.access_token);
        this.set('tokenChanged', !this.get('tokenChanged'));
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
  flattenFields(fields) {
    return _.object(_.map(fields, field => {
      return [field.name, field.value];
    }));
  },
  buildAuthHeader(user, pass) {
    return {
      'Authorization': 'Basic ' + btoa(user + ':' + pass)
    };
  }
});

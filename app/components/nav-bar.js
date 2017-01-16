import Ember from 'ember';
import _ from 'lodash/lodash';
import Requester from '../helpers/requester';

export default Ember.Component.extend(Requester, {
  settings    : Ember.inject.service('settings-store'),
  fields      : Ember.computed('nav.settings', function () {
    return _.map(this.get('editableSettings'), setting => {
      setting.value = this.get('settings').getStore(setting.name);
      return setting;
    });
  }),
  editableSettings: Ember.computed('nav.settings', function() {
    return _.compact(_.map(this.get('nav.settings'), setting => {
      if(_.get(setting,'editable') === true) {
        return setting;
      }
      return null;
    }));
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
    },
    submit() {
      this.set('loginError','');
      this.api()
        .then(d => this.loggedIn(d))
        .catch(e => this.loginFailed(e));
    }
  },
  loggedIn(data) {
    _.each(this.get('model.response.settings'), (value, key) => {
      const d = _.get(data,key);
      if(d) {
        this.get('settings').setStore(value,d);
      }
    });
    this.toggleProperty('tokenChanged');
  },
  loginFailed(error) {
    const json = _.get(error,'responseJSON');
    if(json) {
      this.set('loginError', _.get(json,'error_description'));
    } else {
      this.set('loginError', 'Unknown error occurred, check console');
    }
  },
  init() {
    this.set('model',this.get('nav.auth'));
    _.each(this.get('model.request.fields'), field => {
      const sf = this.get('settings').getStore(field.name);
      if(sf) {
        _.set(field, 'value', sf);
      }
    });
    this._super();
  },
  didInsertElement() {
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
  },
  getSettings() {
    return this.flattenFields(this.get('fields'));
  },
  storeSettings(data) {
    this.get('settings').setStoreObj(data);
  },
  flattenFields(fields) {
    return _.object(_.map(fields, field => {
      return [field.name, field.value];
    }));
  }
});

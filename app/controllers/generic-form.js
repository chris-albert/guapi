import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Controller.extend({
  headers     : {},
  url         : null,
  settings    : Ember.inject.service('settings-store'),
  actions     : {
    submit() {
      this.beforeSubmit();
      this.apiCall();
    },
    actionClick(action) {
      console.log(action);
    },
    formChange() {
      this.updateRequest();
    }
  },
  oauth2ShowSwitch: false,
  showOauth2Select: Ember.computed('model.auth', 'oauth2ShowSwitch',function () {
    return this.get('model.auth') === 'oauth2' && this.get('oauth2ShowSwitch');
  }),
  isOauth2    : Ember.computed('model.auth', function () {
    return this.get('model.auth') === 'oauth2';
  }),
  apiCall() {
    this.rawApi(this.get('model.method'), (x, r) => this.setResponseAndRequest(x, r));
  },
  setResponseAndRequest(xhr, request) {
    this.set('response', {});
    this.set('response.xhr', xhr);
  },
  setRequest(request) {
    this.set('request', JSON.stringify(request, null, 2));
  },
  rawApi(method, complete, url) {
    var options = this.getRequestOptions(method, url);
    if(this.get('model.dataLocation') === 'json') {
      options.data = JSON.stringify(options.data);
    }
    $.ajax(_.merge(options, {
      complete: function (xhr) {
        complete(xhr, options);
      }
    }));
  },
  getRequestOptions(method, url) {
    var rawData = this.allFilteredFields();
    var data = this.getData();
    url      = url || this.getUrl(rawData);
    return {
      url        : url,
      method     : this.get('model.method'),
      data       : data,
      contentType: this.getContentType(),
      headers    : this.getAuth()
    };
  },
  updateRequest() {
    const options = this.getRequestOptions(this.get('model.method'));
    this.setRequest(options);
  },
  getData() {
    var data = this.allFilteredFields();
    switch (this.get('model.dataLocation')) {
      case 'form':
      case 'query':
        return data;
      case 'json':
        return this.handleJsonRoot(data);
    }
  },
  handleJsonRoot(data) {
    var d = {};
    var jsonRoot = this.get('model.jsonRoot');
    if(!_.isUndefined(jsonRoot)) {
      if(_.isString(jsonRoot)) {
        d[jsonRoot] = data;
      } else if(_.isObject(jsonRoot)) {
        var rootHash = {};
        _.map(jsonRoot, (values, key) => {
          _.map(values, value => {
            if(_.isUndefined(rootHash[value])) {
              rootHash[value] = [];
            }
            rootHash[value].push(key);
          });
        });
        _.map(data, (value,key) => {
          var hashLookup = _.get(rootHash,key);
          if(_.isUndefined(hashLookup)) {
            _.set(d,key,value);
          } else {
            if(_.isUndefined(_.get(d,hashLookup))) {
              _.set(d,hashLookup, {});
            }
            _.set(d, hashLookup + '.' + key, value);
          }
        });
      }
    } else {
      d = data;
    }
    return d;
  },
  getContentType() {
    switch (this.get('model.dataLocation')) {
      case 'form':
      case 'query':
        return 'application/x-www-form-urlencoded; charset=UTF-8';
      case 'json':
        return 'application/json; charset=UTF-8';
    }
  },
  hasToken() {
    return this.get('settings').getStore('token');
  },
  getUrl(data) {
    var d = _.clone(data);
    var url = this.getBaseUrl();
    d.settings = this.get('settings').getStoreObj();
    return Handlebars.compile(url)(d);
  },
  getBaseUrl() {
    var projectBaseUrl = this.get('model.project.baseUrl');
    if(projectBaseUrl) {
      return projectBaseUrl + this.get('model.path');
    } else {
      return this.get('settings').getStore('baseUrl') + this.get('model.path');
    }
  },
  getAuth() {
    if(this.get('model.auth.type') === 'bearer') {
      return {
        'Authorization': 'Bearer ' + this.get('settings').getStore('token')
      };
    }
    return this.buildAuthHeader(
      this.get('settings').getStore('clientId'),
      this.get('settings').getStore('clientSecret')
    );
  },
  routeEntered: Ember.observer('model', function () {
    this.bindQueryParams();
    //if auto submit
    if (this.get('as')) {
      this.apiCall();
    }
    this.preloadData();
    this.updateRequest();
  }),
  submitDisplay: Ember.computed('model.submitDisplay',function() {
    var name = this.get('model.submitDisplay');
    if(name) {
      return name;
    }
    return 'Submit';
  }),
  //TODO: Generalize this
  preloadData() {
    var self = this;
    //If we are in a rest edit route then we need to load the data
    //for the record so we can then edit it
    //if (_.endsWith(this.get('model.routeName'), '.edit')) {
    //  this.getRestView((xhr,request) => {
    //    var resp = xhr.responseJSON;
    //    _.map(self.get('model.fields'), field => {
    //      if (!_.isUndefined(resp[field.name])) {
    //        Ember.set(field, 'value', resp[field.name]);
    //      }
    //    });
    //    this.setRequest(request);
    //  });
    //} else if (_.endsWith(this.get('model.routeName'), '.view')) {
    //  //Here we want to set the views field value for the restId
    //  _.map(this.get('model.fields'), field => {
    //    if (field.name === this.get('model.restId')) {
    //      field.value = this.get('model.params.id');
    //    }
    //  });
    //  //Then we need to fetch the data and set the response
    //  this.getRestView((xhr, request) => {
    //    this.setResponseAndRequest(xhr, request);
    //  });
    //}
  },
  isEdit() {
    return _.endsWith(this.get('model.routeName'), '.edit');
  },
  getRestView(cb) {
    var id = this.get('model.params.id');
    this.rawApi('GET', (xhr, request) => {
      if (xhr.status === 200 && _.isObject(xhr.responseJSON)) {
        cb(xhr, request);
      }
    }, this.getBaseUrl() + '/' + id);
  },
  bindQueryParams() {
    _.map(this.get('model.fields'), field => {
      var q = this.get(field.name);
      if (q) {
        field.value = q;
      }
    });
  },
  allFields() {
    return _.object(_.map(this.get('model.fields'), function (field) {
      return [field.name, field];
    }));
  },
  filterOutFields(fields) {
    var self = this,
        data = {};
    _.map(fields, function (field) {
      if (_.isUndefined(field.send) || field.send) {
        var key = field.name;
        if(field.outName) {
          key = field.outName;
        }
        data[key] = self.buildFieldValue(field);
      }
    });
    return data;
  },
  buildFieldValue(field) {
    if (field.type === 'select' && _.isString(field.value)) {
      return field.value.split(",");
    }
    return field.value;
  },
  allFilteredFields() {
    return this.filterOutFields(this.allFields());
  },
  beforeSubmit() {

  },
  authSelector: Ember.computed('',function() {
    var auth = _.cloneDeep(this.get('globalConfig.authSelector'));
    if(this.get('model.oauth2Header')) {
      auth.value = [this.get('model.oauth2Header')];
    }
    return auth;
  }),
  buildAuthHeader(user, pass) {
    return {
      "Authorization": "Basic " + btoa(user + ':' + pass)
    };
  }
});

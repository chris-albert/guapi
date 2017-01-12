import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Controller.extend({
  settings    : Ember.inject.service('settings-store'),
  request     : {},
  formChanged: true,
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
      this.toggleProperty('formChanged');
    }
  },
  apiCall() {
    this.api((x, r) => this.setResponseAndRequest(x, r));
  },
  setResponseAndRequest(xhr, request) {
    this.set('response', {});
    this.set('response.xhr', xhr);
    this.set('request.last', request);
  },
  setRequest(request) {
    this.set('request.lastObj', request);
    this.set('request.current', JSON.stringify(request, null, 2));
  },
  api(complete) {
    var options = this.getRequestOptions();
    if(this.get('model.dataLocation') === 'json') {
      options.data = JSON.stringify(options.data);
    }
    this.rawApi(options, complete);
  },
  rawApi(options, complete) {
    $.ajax(_.merge(options, {
      complete: function (xhr) {
        complete(xhr, options);
      }
    }));
  },
  getRequestOptions() {
    var rawData = this.allFilteredFields();
    return {
      url        : this.getUrl(rawData),
      method     : this.get('model.method'),
      data       : this.getData(),
      contentType: this.getContentType(),
      headers    : this.getAuth()
    };
  },
  updateRequest() {
    const options = this.getRequestOptions();
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
    if(this.get('model.auth.type') === 'basic') {
      return this.buildAuthHeader(
        this.get('settings').getStore('clientId'),
        this.get('settings').getStore('clientSecret')
      );
    }
  },
  link: Ember.computed('formChanged', function() {
    var data = this.allFilteredFields();
    var queryString = _.filter(_.map(data,(value,key) => {
      if(!_.isUndefined(value)) {
        return key + "=" + value;
      } else {
        return null;
      }
    }),i => !_.isNull(i)).join('&');
    if(queryString != '') {
      queryString = '?' + queryString;
    }
    return window.location.origin + window.location.pathname + queryString;
  }),
  routeEntered: Ember.observer('model', function () {
    this.bindQueryParams();
    //if auto submit
    if (this.get('as')) {
      this.apiCall();
    }
    this.updateRequest();
  }),
  submitDisplay: Ember.computed('model.submitDisplay',function() {
    var name = this.get('model.submitDisplay');
    if(name) {
      return name;
    }
    return 'Submit';
  }),
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
  buildAuthHeader(user, pass) {
    return {
      "Authorization": "Basic " + btoa(user + ':' + pass)
    };
  }
});

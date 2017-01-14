import Ember from 'ember';
import _ from 'lodash/lodash';

export default Ember.Object.extend({
  settings    : Ember.inject.service('settings-store'),
  request     : {},
  api(complete) {
    var options = this.getRequestOptions();
    if(this.get('model.request.location') === 'json') {
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
      method     : this.get('model.request.method'),
      data       : this.getData(),
      contentType: this.getContentType(),
      headers    : this.getAuth()
    };
  },
  getData() {
    var data = this.allFilteredFields();
    switch (this.get('model.request.location')) {
      case 'form':
      case 'query':
        return this.handleQueryRoot(data);
      case 'json':
        return this.handleJsonRoot(data);
    }
  },
  handleQueryRoot(data) {
    //var d = {};
    //var jsonRoot = this.get('model.jsonRoot');
    //if(!_.isUndefined(jsonRoot)) {
    //  _.map(data,(value,key) => {
    //    d[jsonRoot + '.' + key] = value;
    //  });
    //}
    return data;
  },
  handleJsonRoot(data) {
    //var d = {};
    //var jsonRoot = this.get('model.jsonRoot');
    //if(!_.isUndefined(jsonRoot)) {
    //  if(_.isString(jsonRoot)) {
    //    d[jsonRoot] = data;
    //  } else if(_.isObject(jsonRoot)) {
    //    var rootHash = {};
    //    _.map(jsonRoot, (values, key) => {
    //      _.map(values, value => {
    //        if(_.isUndefined(rootHash[value])) {
    //          rootHash[value] = [];
    //        }
    //        rootHash[value].push(key);
    //      });
    //    });
    //    _.map(data, (value,key) => {
    //      var hashLookup = _.get(rootHash,key);
    //      if(_.isUndefined(hashLookup)) {
    //        _.set(d,key,value);
    //      } else {
    //        if(_.isUndefined(_.get(d,hashLookup))) {
    //          _.set(d,hashLookup, {});
    //        }
    //        _.set(d, hashLookup + '.' + key, value);
    //      }
    //    });
    //  }
    //} else {
    //  d = data;
    //}
    return data;
  },
  getContentType() {
    switch (this.get('model.request.location')) {
      case 'form':
      case 'query':
        return 'application/x-www-form-urlencoded; charset=UTF-8';
      case 'json':
        return 'application/json; charset=UTF-8';
    }
  },
  getUrl(data) {
    var d = _.clone(data);
    var url = this.get('model.request.url');
    d.settings = this.get('settings').getStoreObj();
    return Handlebars.compile(url)(d);
  },
  getAuth() {
    if(this.get('model.request.auth.type') === 'bearer') {
      return {
        'Authorization': 'Bearer ' + this.get('settings').getStore('token')
      };
    }
    if(this.get('model.auth.type') === 'basic') {
      const user = this.get('settings').getStore('clientId');
      const pass = this.get('settings').getStore('clientSecret');
      return {
        "Authorization": "Basic " + btoa(user + ':' + pass)
      };
    }
  },
  allFields() {
    return _.object(_.map(this.get('model.request.fields'), function (field) {
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
    if ((field.type === 'select' || field.type === 'array') && _.isString(field.value)) {
      return field.value.split(",");
    }
    return field.value;
  },
  allFilteredFields() {
    return this.filterOutFields(this.allFields());
  }
});

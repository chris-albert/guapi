import Ember from 'ember';
import _ from 'lodash';

export default Ember.Mixin.create({
  settings    : Ember.inject.service('settings-store'),
  request     : {},
  api() {
    var options = this.getRequestOptions();
    if(this.get('model.request.location') === 'json') {
      options.data = JSON.stringify(options.data);
    }
    return this.rawApi(options);
  },
  rawApi(options) {
    return $.ajax(options);
  },
  getRequestOptions() {
    var data = this.allFilteredFields();
    return {
      url        : this.getUrl(data),
      method     : this.get('model.request.method'),
      data       : this.getData(data),
      contentType: this.getContentType(),
      headers    : this.getAuth(data)
    };
  },
  getData(data) {
    switch (this.get('model.request.location')) {
      case 'form':
      case 'query':
        return this.handleQueryRoot(data);
      case 'json':
        return this.handleJsonRoot(data);
    }
  },
  handleQueryRoot(data) {
    const a = this.handleJsonRoot(data);
    //console.log(a);
    return data;
  },
  handleJsonRoot(data) {
    var d = {};
    var jsonRoot = this.get('model.request.root');
    if(!_.isNil(jsonRoot)) {
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
    const url = this.get('model.request.url');
    const path = this.get('model.request.path');
    d.settings = this.get('settings').getStoreObj();
    return Handlebars.compile(url + path)(d);
  },
  getAuth(data) {
    var d = _.clone(data);
    d.settings = this.get('settings').getStoreObj();
    if(this.get('model.request.auth.type') === 'bearer') {
      return {
        'Authorization': 'Bearer ' + this.get('settings').getStore('token')
      };
    }
    if(this.get('model.request.auth.type') === 'basic') {
      const user = _.get(d,this.get('model.request.auth.user'));
      const pass = _.get(d,this.get('model.request.auth.pass'));
      return {
        "Authorization": "Basic " + btoa(user + ':' + pass)
      };
    }
  },
  allFields() {
    return _.fromPairs(_.map(this.get('model.request.fields'), function (field) {
      return [field.name, field];
    }));
  },
  filterOutFields(fields) {
    var self = this,
        data = {};
    //console.log(fields);
    _.map(fields, function (field) {
      if (_.isUndefined(field.send) || field.send) {
        var key = field.name;
        if(_.get(field,'outName')) {
          key = _.get(field,'outName');
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
    if(_.get(field,'type') === 'number') {
      return _.toNumber(_.get(field,'value'));
    }
    return field.value;
  },
  allFilteredFields() {
    return this.filterOutFields(this.allFields());
  }
});

import Ember from 'ember';
import _ from 'lodash';
import localStorage from '../helpers/local-storage';

export default Ember.Mixin.create({
  settings    : localStorage,
  request     : {},
  api() {
    const options = this.getRequestOptions();
    if(this.get('model.request.location') === 'json') {
      options.data = JSON.stringify(options.data);
    }
    return this.rawApi(options);
  },
  rawApi(options) {
    return $.ajax(options);
  },
  getRequestOptions() {
    const data = this.allFilteredFields();

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
    const json = this.handleJsonRoot(data);
    return _.fromPairs(_.flatten(_.map(json, (field,name) => {
      if(_.isObject(field)) {
        return this.flattenObj(field,[name]);
      }
      return [[name,field]];
    })));
  },
  flattenObj(o, a) {
    function loop(obj,accu) {
      if(_.isObject(obj)) {
        return _.map(obj, (value, key) => {
          return loop(value, _.concat(accu, key));
        });
      }
      return _.concat(accu,obj);
    }
    return _.map(loop(o,a),flattened => {
      return [_.initial(flattened).join('.'), _.last(flattened)];
    });
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
    const d = _.clone(data);
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
    _.map(fields, function (field) {
      if (_.isUndefined(field.send) || field.send) {
        var key = field.name;
        if(_.get(field,'outName')) {
          key = _.get(field,'outName');
        }
        const value = self.buildFieldValue(field);
        if(!_.isUndefined(value) && !_.isEmpty(value)) {
          data[key] = value;
        }
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
  },
  replaceValues(data, extra) {
    const r = _.merge({
      settings: this.get('settings').getStoreObj(),
      location: window.location
    },extra);
    return _.fromPairs(_.map(data, (v,k) => {
      return [k,Handlebars.compile(v)(r)];
    }));
  }
});

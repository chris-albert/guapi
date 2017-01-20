import Ember from "ember";
import _ from 'lodash';

function onChange(func) {
  return Ember.computed('response.xhr', func);
}

export default Ember.Component.extend({
  raw             : false,
  actions         : {
    responseToggle() {
      this.set('raw', !this.get('raw'));
    },
    actionClicked(action) {
      this.get('router').transitionTo(action.link, {queryParams: action.queryParams});
    }
  },
  responseViewText: Ember.computed('raw', function () {
    if (this.get('raw')) {
      return 'Pretty';
    }
    return 'Raw';
  }),
  rawClass        : Ember.computed('raw', function () {
    if (this.get('raw')) {
      return '';
    }
    return 'hidden';
  }),
  prettyClass     : Ember.computed('raw', function () {
    if (!this.get('raw')) {
      return '';
    }
    return 'hidden';
  }),
  successful: onChange(function() {
    return this.isSuccess(this.get('response.xhr.status'));
  }),
  responseIsObject: onChange(function () {
    return this.get('config.type') === 'object' || !this.get('successful');
  }),
  responseIsArray : onChange(function () {
    return this.get('config.type') === 'array';
  }),
  status          : onChange(function () {
    if (_.isUndefined(this.get('response.xhr')) || _.isNull(this.get('response.xhr'))) {
      return 'default';
    } else if (this.isSuccess(this.get('response.xhr.status'))) {
      return 'success';
    }
    return 'danger';
  }),
  isGoodStatus: onChange(function() {
    return this.isSuccess(this.get('response.xhr.status'));
  }),
  statusCode      : onChange(function () {
    return this.get('response.xhr.status');
  }),
  hash            : onChange(function () {
    return this.getGoodJson(function (json) {
      return _.fromPairs(_.map(json, item => {
        return [item.id, item];
      }));
    });
  }),
  message         : onChange(function () {
    switch(this.get('response.xhr.status')) {
      case 0:
        return 'No Response, base url is probably unreachable';
        break;
      case 405:
        return "Status Text: [" + this.get('response.xhr.statusText') + ']';
      break;
    }
    return null;
  }),
  json            : onChange(function () {
    var json = this.get('response.xhr.responseJSON');
    if (json) {
      return JSON.stringify(json, null, 2);
    }
    return null;
  }),
  objectData      : onChange(function () {
    var json = {};
    if(this.get('successful')) {
      json = this.getGoodJson(json => json);
    } else {
      json = this.getBadJson(json => json);
    }
    return _.map(json, (v, k) => {
      return {
        key  : k,
        value: v
      };
    });
  }),
  objectActions: onChange(function() {
    return this.getGoodJson(json => {
      return this.getActions(json);
    });
  }),
  hasActions: onChange(function() {
    return !_.isUndefined(this.get('config.actions'));
  }),
  responseHeaders : onChange(function () {
    var columns = this.get('config.fields');
    if (_.isArray(columns)) {
      return columns;
    } else if(columns === '*') {
      return this.getGoodJson(json => {
        return _.keys(_.first(json));
      });
    }
    return [];
  }),
  responseValues  : onChange(function () {
    return this.getGoodJson(json => {
      return _.map(json, item => {
        return {
          id     : item[this.get('formConfig.restId')],
          values : this.getColumns(item),
          actions: this.getActions(item)
        };
      });
    });
  }),
  getActions(item) {
    const actions = [];
    if(this.get('config.actions')) {
      _.map(this.get('config.actions'), action => {
        const a = _.clone(action);
        a.link = Handlebars.compile(a.link)(this);
        a.queryParams = {};
        if(_.has(a,'autoSubmit') && _.get(a, 'autoSubmit') === true) {
          a.queryParams.as = true;
        }
        if(_.get(a,'params') === '*') {
          _.each(item, (value,key) => {
            _.set(a,'queryParams.' + key, value);
          });
        } else {
          _.map(a.params, param => {
            if (_.isUndefined(item[param])) {
              a.queryParams[param] = this.get('request.data.' + param);
            } else {
              a.queryParams[param] = item[param];
            }
          });
        }
        actions.push(a);
      });
    }
    return actions;
  },
  getColumns(item) {
    const columns = this.get('config.fields');
    if(_.isArray(columns)) {
      return _.map(columns, column => {
        if (item[column]) {
          return {
            text: item[column]
          };
        }
      });
    } else if(columns === '*') {
      return _.map(item, v => {
        return {
          text: v
        };
      });
    }
  },
  getBadJson(func) {
    var json = this.get('response.xhr.responseJSON');
    if(_.isObject(_.get(json,'error'))) {
      if(_.isObject(_.get(json,'error.fields'))) {
        const fields = _.get(json,'error.fields');
        const msg = [];
        _.each(fields, (errorArr, fieldKey) => {
          msg.push('(' + fieldKey + ': ' + errorArr.join(',') + ')');
        })
        json.error.fields = msg.join(', ');
        return func(json.error);
      } else {
        return func(json.error);
      }
    } else {
      return func(json);
    }
  },
  getGoodJson(func) {
    var json   = this.get('response.xhr.responseJSON'),
        root = this.get('config.root');
    if (json && _.isObject(json)) {
      var j = json;
      if (root) {
        j = _.get(json, root);
      }
      return func(j);
    }
    return null;
  },
  isSuccess(status) {
    return status >= 200 && status < 400;
  }
});

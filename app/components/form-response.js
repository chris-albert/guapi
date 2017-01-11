import Ember from "ember";
import _ from 'lodash/lodash';

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
  responseIsObject: onChange(function () {
    return !this.get('responseIsArray');
  }),
  responseIsArray : onChange(function () {
    return this.getJson(function (json) {
      return _.isArray(json);
    });
  }),
  status          : onChange(function () {
    if (_.isUndefined(this.get('response.xhr')) || _.isNull(this.get('response.xhr'))) {
      return 'default';
    } else if (this.isSuccess(this.get('response.xhr.status'))) {
      return 'success';
    }
    return 'danger';
  }),
  statusCode      : onChange(function () {
    return this.get('response.xhr.status');
  }),
  hash            : onChange(function () {
    return this.getJson(function (json) {
      return _.object(_.map(json, item => {
        return [item.id, item];
      }));
    });
  }),
  message         : onChange(function () {
    if(this.get('response.xhr.status') === 0) {
      return 'No Response, base url is probably unreachable';
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
    return this.getJson(json => {
      var j = json;
      if (_.isObject(j.error)) {
        j = j.error;
      }
      return _.map(j, (v, k) => {
        return {
          key  : k,
          value: v
        };
      });
    });
  }),
  objectActions: onChange(function() {
    return this.getJson(json => {
      return this.getActions(json);
    });
  }),
  isRest          : Ember.computed('model.type', function () {
    return false;
  }),
  hasActions: onChange(function() {
    return !_.isUndefined(this.get('config.' + this.get('route.last') + '.actions'));
  }),
  responseHeaders : onChange(function () {
    var columns = this.get('config.columns');
    if (_.isArray(columns)) {
      return columns;
    } else if(columns === '*') {
      return this.getJson(json => {
        return _.keys(_.first(json));
      });
    }
    return [];
  }),
  responseValues  : onChange(function () {
    return this.getJson(json => {
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
    var actions = [];
    if(this.get('config.' + this.get('route.last') + '.actions')) {
      _.map(this.get('config.' + this.get('route.last') + '.actions'), action => {
        action.link = Handlebars.compile(action.link)(this);
        action.queryParams = {};
        if(_.has(action,'autoSubmit') && _.get(action, 'autoSubmit') === true) {
          action.queryParams.as = true;
        }
        _.map(action.params, param => {
          if(_.isUndefined(item[param])) {
            action.queryParams[param] = this.get('request.data.' + param);
          } else {
            action.queryParams[param] = item[param];
          }
        });
        actions.push(action);
      });
    }
    return actions;
  },
  getColumns(item) {
    const columns = this.get('config.columns');
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
  getJson(func) {
    var json   = this.get('response.xhr.responseJSON'),
        config = this.get('config');
    if (json && _.isObject(json)) {
      var j = null;
      if (_.get(config,'jsonRoot') && !_.isUndefined(json[_.get(config,'jsonRoot')])) {
        j = _.get(json, _.get(config, 'jsonRoot'));
      }
      if(_.isNull(j) && _.get(config,'pluralJsonRoot') && !_.isUndefined(json[_.get(config,'pluralJsonRoot')])) {
        j = _.get(json, _.get(config, 'pluralJsonRoot'));
      }
      if(_.isNull(j)) {
        j = json;
      }
      return func(j);
    }
    return null;
  },
  isSuccess(status) {
    return status >= 200 && status < 400;
  }
});

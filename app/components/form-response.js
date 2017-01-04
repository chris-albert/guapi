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
  isRest          : Ember.computed('model.type', function () {
    return this.get('formConfig.type') === 'rest';
  }),
  responseHeaders : onChange(function () {
    var columns = this.get('config.columns');
    if (columns) {
      return columns;
    }
    return this.getJson(json => {
      return _.keys(_.first(json));
    });
  }),
  responseValues  : onChange(function () {
    return this.getJson(json => {
      var self    = this,
          columns = this.get('config.columns');
      if (columns) {
        return _.map(json, item => {
          var values = _.map(columns, column => {
            if (item[column]) {
              return {
                link      : function () {
                  if (false) {
                    return _.head(self.get('routeName').split('.')) + '.view';
                  }
                }(),
                queryParam: function () {
                  return item['clientId'];
                }(),
                text      : item[column]
              };
            }
          });
          return {
            id    : item[this.get('formConfig.restId')],
            values: values
          };
        });
      }
      return _.map(json, item => {
        return {
          id    : item[this.get('formConfig.restId')],
          values: _.map(item, v => {
            return {
              text: v
            };
          })
        };
      });
    });
  }),
  getJson(func) {
    var json   = this.get('response.xhr.responseJSON'),
        config = this.get('config');
    if (json && _.isObject(json)) {
      var j = json;
      if (config && config.jsonRoot && json[config.jsonRoot]) {
        j = json[config.jsonRoot];
      }
      return func(j);
    }
    return null;
  },
  isSuccess(status) {
    return status >= 200 && status < 400;
  }
});

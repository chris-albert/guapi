import Ember from 'ember';
import _ from 'lodash';

export default Ember.Object.extend({
  expand(obj) {
    if(_.isString(obj)) {
      return this.expandString(obj);
    } else if(_.isArray(obj)) {
      return _.map(obj, o => {
        return this.expand(o);
      });
    } else if(_.isObject(obj)) {
      const name = _.get(obj,'name');
      const expandName = this.expandString(name);
      if(_.isEqual(name,expandName)) {
        return obj;
      } else {
        return _.merge(obj,expandName);
      }
    }
  },
  expandString(str) {
    const split = str.split('::');
    if(split && split.length === 2) {
      if(_.isEmpty(split[0])) {
        return {
          "display": this.format(split[1]),
          "name"   : split[1]
        };
      } else if(_.isEmpty(split[1])) {
        return {
          "display": split[0],
          "name"   : split[0]
        };
      } else {
        return {
          "display": split[0],
          "name"   : split[1]
        };
      }
    }
    return str;
  },
  format(s) {
    return _.map(s.decamelize().split('_'), ss =>{
      return ss.capitalize();
    }).join(' ');
  }
}).create();

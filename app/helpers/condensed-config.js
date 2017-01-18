import Ember from 'ember';
import _ from 'lodash';
import NameDisplayExpander from './expander/name-display';
import NameDisplayExpanderTest from './expander/name-display-test';

function replace(obj, key, func) {
  return _.set(obj,key,func(_.get(obj,key)));
}

const ProjectExpander = Ember.Object.extend({
  expand(json) {
    const project = NameDisplayExpander.expand(json);
    if(_.get(project,'tabs')) {
      const tabs = this.expandTabs(_.get(project,'tabs'));
      delete project['tabs'];
      _.set(project,'content', {
        type: 'tabs',
        tabs: tabs
      });
    }
    return project;
  },
  expandTabs(tabs) {
    const newTabs = _.map(tabs, tab => {
      NameDisplayExpander.expand(tab);
      console.log(tab);
      console.log(this.expandTab(tab));
      return tab;
    });
    return newTabs;
  },
  expandTab(tab) {
    if(_.isNil(_.get(tab,'tabs'))) {
      if(_.get(tab, 'type') === 'rest') {
        return RestExpander.expand(tab);
      }
      return FormExpander.expand(tab);
    }
    return tab;
  }
}).create();

const FieldExpander = Ember.Object.extend({
  expand(json) {

    return json;
  }
}).create();

const RestExpander = Ember.Object.extend({
  expand(json) {

    return {};
  }
}).create();

const FormExpander = Ember.Object.extend({
  requestFields: ['url','path','method','location','auth','submit','fields'],
  responseFields: ['root','type','fields'],
  expand(json) {
    const newJson = _.clone(json);
    this.expandRequest(newJson);
    this.expandResponse(newJson);
    _.set(newJson,'type','form');
    return newJson;
  },
  expandRequest(json) {
    this.moveToRequest(json);
    replace(json, 'request.auth', d => this.expandAuth(d));
    replace(json, 'request.submit', d => this.expandSubmit(d));
    replace(json, 'request.fields', d => this.expandFields(d));
  },
  moveToRequest(json) {
    _.each(this.requestFields, (field) => {
      const value = _.get(json,field);
      delete json[field];
      _.set(json, 'request.' + field, value);
    });
    return json;
  },
  defaultResponse: {
    "root": null,
    "type": "object",
    "fields": "*"
  },
  expandResponse(json) {
    replace(json, 'response', r => {
      return _.merge(r,this.defaultResponse);
    });
  },
  expandAuth(auth) {
    if(_.isNil(auth)) {
      return {
        "type": "bearer"
      };
    } else if(_.isString(auth)) {
      return {
        "type": auth
      };
    } else if(_.isObject(auth)) {
      return auth;
    }
  },
  defaultSubmit: {
    "display": "Submit",
    "type": "primary",
    "size": "small"
  },
  expandSubmit(submit) {
    if(_.isNil(submit)) {
      return this.defaultSubmit;
    } else if(_.isString(submit)) {
      return _.merge({"display": submit}, this.defaultSubmit);
    } else if(_.isObject(submit)) {
      return _.merge(submit, this.defaultSubmit);
    }
  },
  defaultFields: {
    "type": "text",
    "disabled": false
  },
  expandFields(fields) {
    const expanded = NameDisplayExpander.expand(fields);
    return _.map(expanded,e => _.merge(e, this.defaultFields));
  }
}).create();

const RootExpander = Ember.Object.extend({
  expand(json) {
    const newJson = _.clone(json);
    replace(newJson,'settings',this.expandSettings);
    replace(newJson,'auth', this.expandAuth);
    return this.expandTabs(newJson);
  },
  expandSettings(settings) {
    return NameDisplayExpander.expand(settings);
  },
  expandAuth(auth) {
    return FormExpander.expand(auth);
  },
  expandTabs(json) {
    const ps = Promise.all(_.map(_.get(json,'tabs'),tab => {
      if(_.startsWith(tab, 'file://')) {
        return $.ajax({
          url     : '/config/' + _.replace(tab,'file://','' ) + '.json',
          dataType: 'json'
        });
      } else {
        return Promise.resolve(tab);
      }
    }));
    return ps.then(tabs => {
      delete json['tabs'];
      _.set(json,'content', {
         "type": "tabs",
         "tabs": _.map(tabs,t => ProjectExpander.expand(t))
      });
      return json;
    });
  }
}).create();

const Expander = Ember.Object.extend({
  expand(json) {
    return RootExpander.expand(json);
  }
}).create();


export default Ember.Object.extend({
  process(json) {
    NameDisplayExpanderTest.test();
    return new Promise(function (resolve, reject) {
      resolve(Expander.expand(json));
    });
  }
}).create();

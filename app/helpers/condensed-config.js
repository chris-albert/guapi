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
      const tabs = this.expandTabs(_.get(project,'tabs'), _.get(project,'baseUrl'));
      delete project['tabs'];
      _.set(project,'content', {
        type: 'tabs',
        tabs: tabs
      });
    }
    return project;
  },
  expandTabs(tabs, baseUrl) {
    const newTabs = _.map(tabs, tab => {
      NameDisplayExpander.expand(tab);
      return this.expandTab(tab, baseUrl);
    });
    return newTabs;
  },
  expandTab(tab, baseUrl) {
    if(_.isNil(_.get(tab,'tabs'))) {
      if(_.get(tab, 'type') === 'rest') {
        return RestExpander.expand(tab, baseUrl);
      }
      const form = FormExpander.expand(tab, baseUrl);
      return {
        name: _.get(form,'name'),
        display: _.get(form,'display'),
        content: form
      };
    }
    return tab;
  }
}).create();

const FieldExpander = Ember.Object.extend({
  expand(json) {
    if(_.get(json,'type') === 'select') {
      const values = NameDisplayExpander.expand(_.get(json,'values'));
      _.set(json,'values', values);
    }
    return NameDisplayExpander.expand(json);
  }
}).create();

const RestExpander = Ember.Object.extend({
  defaultMethods: {
    'view': 'GET',
    'list': 'GET',
    'create': 'POST',
    'update': 'PUT',
    'delete': "DELETE"
  },
  resourceTypes: ['list','view','create','update','delete'],
  expand(json, baseUrl) {
    return this.expandResources(json, baseUrl);
  },
  expandResources(json, baseUrl) {
    replace(json,'fields',f => NameDisplayExpander.expand(f));
    const forms = _.map(_.get(json,'resources', this.get('resourceTypes')), resource => {
      const form = this.expandResource(json, resource);
      const expanded = FormExpander.expand(form, baseUrl);
      _.set(expanded,'type','form');
      return {
        display: _.capitalize(resource),
        name: resource,
        content: expanded
      };
    });
    return {
      display: _.get(json, 'display'),
      name: _.get(json, 'name'),
      content: {
        type: 'tabs',
        tabs: forms
      }
    };
  },
  expandResource(json, resourceType) {
    const form = {};
    _.defaults(form,_.pick(json,['path','auth']));
    _.set(form, 'method', this.get('defaultMethods.' + resourceType));
    _.set(form, 'path', this.expandPath(json, resourceType));
    _.set(form, 'location', this.getLocation(resourceType));
    _.set(form, 'submit', _.capitalize(resourceType));
    this.handleOverrides(json, form,resourceType);
    if(_.isUndefined(_.get(form,'root'))) {
      _.set(form, 'root', _.get(json, 'root'))
    };
    if(_.isNil(_.get(form,'response.type'))) {
      _.set(form, 'response.type', this.getResponseType(resourceType));
    }
    if(_.isUndefined(_.get(form,'response.root'))) {
      _.set(form, 'response.root', this.getResponseRoot(json, resourceType));
    }
    return form;
  },
  handleOverrides(json, form, resourceType) {
    const override = _.get(json,resourceType, this.fieldFilter(json, resourceType));
    if(_.isArray(override)) {
      _.set(form, 'fields', this.getFields(json, override));
    } else if(_.isObject(override)) {
      if(_.isNil(_.get(override,'fields'))) {
        _.set(form, 'fields', this.getFields(json,this.fieldFilter(json, resourceType)));
      }
      _.defaultsDeep(form, override);
    }
  },
  getFields(json, override) {
    const fields      = [];
    const keyedFields = _.keyBy(_.get(json, 'fields'), 'name');
    _.each(override, field => {
      if (_.get(keyedFields, field)) {
        fields.push(_.clone(_.get(keyedFields, field)));
      }
    });
    return fields;
  },
  fieldFilter(json, resourceType) {
    switch(resourceType) {
      case 'list':
      case 'update':
      case 'create':
        return _.map(_.get(json,'fields'),r => _.get(r,'name'));
      case 'delete':
      case 'view':
        return [_.get(json,'idField','id')];
    }
  },
  getLocation(resourceType) {
    switch(resourceType) {
      case 'list':
      case 'view':
        return 'query';
      case 'update':
      case 'create':
      case 'delete':
        return 'json';

    }
  },
  expandPath(json, resourceType) {
    const id = _.get(json,'idField','id');
    const path = _.get(json,'path');
    switch(resourceType) {
      case 'update':
      case 'delete':
      case 'view':
        return path + '/{{' + id + '}}';
      case 'list':
      case 'create':
        return path;
    }
  },
  getResponseRoot(json, resourceType) {
    switch(resourceType) {
      case 'list':
        return _.get(json,'root') + 's';
      case 'update':
      case 'delete':
      case 'view':
      case 'create':
        return _.get(json,'root');
    }
  },
  getResponseType(resourceType) {
    switch(resourceType) {
      case 'list':
        return 'array';
      case 'update':
      case 'delete':
      case 'view':
      case 'create':
        return 'object';
    }
  }
}).create();

const FormExpander = Ember.Object.extend({
  requestFields: ['url','path','method','location','auth','submit','fields', 'root'],
  responseFields: ['root','type','fields'],
  expand(json, baseUrl) {
    const newJson = _.clone(json);
    this.expandRequest(newJson, baseUrl);
    this.expandResponse(newJson);
    _.set(newJson,'type','form');
    return newJson;
  },
  expandRequest(json, baseUrl) {
    this.moveToRequest(json);
    _.set(json,'request.url', baseUrl);
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
      return _.defaults(r,this.defaultResponse);
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
      return _.defaults({"display": submit}, this.defaultSubmit);
    } else if(_.isObject(submit)) {
      return _.defaults(submit, this.defaultSubmit);
    }
  },
  defaultFields: {
    "type": "text",
    "disabled": false
  },
  expandFields(fields) {
    //const expanded = NameDisplayExpander.expand(fields);
    const expanded = _.map(fields, f => FieldExpander.expand(f))
    return _.map(expanded,e => _.defaults(e, this.defaultFields));
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

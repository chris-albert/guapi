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
    const resources = _.get(json,'resources', this.get('resourceTypes'));
    const forms = _.map(resources, resource => {
      const form = this.expandResource(json, resource, resources);
      const expanded = FormExpander.expand(form, baseUrl);
      _.set(expanded,'type','form');
      return {
        display: _.capitalize(resource),
        name: resource,
        content: expanded
      };
    });
    const tabsAndActions = this.handleActions(forms);
    return {
      display: _.get(json, 'display'),
      name: _.get(json, 'name'),
      content: {
        type: 'tabs',
        tabs: tabsAndActions
      }
    };
  },
  expandResource(json, resourceType) {
    const form = {};
    this.handleOverrides(json, form,resourceType);
    this.setIfUndefined(form,'auth', _.get(json,'auth'));
    this.setIfUndefined(form,'method', this.get('defaultMethods.' + resourceType));
    this.setIfUndefined(form,'path', this.expandPath(json, resourceType));
    this.setIfUndefined(form,'location',this.getLocation(resourceType));
    this.setIfUndefined(form,'submit',_.capitalize(resourceType));
    this.setIfUndefined(form,'root',_.get(json, 'root'));
    this.setIfUndefined(form,'response.type',this.getResponseType(resourceType));
    this.setIfUndefined(form,'response.root',this.getResponseRoot(json, resourceType));
    return form;
  },
  setIfUndefined(obj, key, value) {
    if(_.isUndefined(_.get(obj,key))) {
      _.set(obj,key,value);
    }
  },
  handleOverrides(json, form, resourceType) {
    const override = _.get(json,resourceType, this.fieldFilter(json, resourceType));
    if(_.isArray(override)) {
      _.set(form, 'fields', this.getFields(json, override));
    } else if(_.isObject(override)) {
      if(_.isNil(_.get(override,'fields'))) {
        _.set(form, 'fields', this.getFields(json,this.fieldFilter(json, resourceType)));
      }
      if(_.isArray(_.get(override,'fields'))) {
        _.set(form, 'fields', this.getFields(json, _.get(override,'fields')));
      }
      _.defaultsDeep(form, override);
    }
  },
  handleActions(forms) {
    const keys = _.keyBy(forms,'name');
    return _.map(keys,(form, resourceType) => {
      const actions = this.getActions(resourceType,keys);
      _.set(form,'content.response.actions',actions);
      return form;
    });
  },
  getActions(resourceType, forms) {
    const actions = [];
    switch(resourceType) {
      case 'update':
      case 'create':
      case 'list':
        if(_.get(forms,'view')) {
          actions.push({
            "type"      : "icon",
            "link"      : "{{route.base}}.view",
            "params"    : _.map(_.get(forms,'view.content.request.fields'),'name'),
            "autoSubmit": true,
            "icon"      : "info-sign"
          });
        }
        break;
      case 'view':
        if(_.get(forms,'update')) {
          actions.push({
            "type"   : "button",
            "display": "Update",
            "link"   : "{{route.base}}.update",
            "params" : _.map(_.get(forms,'update.content.request.fields'),'name')
          });
        }
        if(_.get(forms,'delete')) {
          actions.push({
            "type"   : "button",
            "display": "Delete",
            "link"   : "{{route.base}}.delete",
            "params" : _.map(_.get(forms,'delete.content.request.fields'),'name')
          });
        }
        break;
    }
    return actions;
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
    if(_.isNil(_.get(json,'request.url'))) {
      _.set(json, 'request.url', baseUrl);
    }
    replace(json, 'request.auth', d => this.expandAuth(d));
    replace(json, 'request.submit', d => this.expandSubmit(d));
    replace(json, 'request.fields', d => this.expandFields(d));
  },
  moveToRequest(json) {
    _.each(this.requestFields, (field) => {
      const value = _.get(json,field);
      delete json[field];
      if(_.isNil(_.get(json, 'request.' + field))) {
        _.set(json, 'request.' + field, value);
      }
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
    return Promise.resolve(Expander.expand(json));
  }
}).create();

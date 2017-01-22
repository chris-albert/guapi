import Ember from 'ember';
import _ from 'lodash';
import Requester from '../helpers/requester';

export default Ember.Component.extend(Requester, {
  settings    : Ember.inject.service('settings-store'),
  request     : {},
  formChanged: true,
  link: Ember.computed('formChanged', function() {
    var data = this.allFilteredFields();
    var queryString = _.filter(_.map(data,(value,key) => {
      if(!_.isUndefined(value)) {
        return key + "=" + value;
      } else {
        return null;
      }
    }),i => !_.isNull(i)).join('&');
    if(queryString !== '') {
      queryString = '?' + queryString;
    }
    return window.location.origin + window.location.pathname + window.location.hash + queryString;
  }),
  actions     : {
    submit() {
      this.apiCall();
    },
    actionClick(action) {
      console.log(action);
    },
    formChange() {
      this.updateRequest();
      this.toggleProperty('formChanged');
    }
  },
  init() {
    this.bindQueryParams();
    //if auto submit
    if (this.get('queryParams.as')) {
      this.apiCall();
    }
    this.updateRequest();
    this._super(...arguments);
  },
  apiCall() {
    this.api()
      .then((a,b,x) => this.setResponse(x))
      .catch((x) =>this.setResponse(x));
  },
  setResponse(xhr) {
    this.set('response', {});
    this.set('response.xhr', xhr);
  },
  setRequest(request) {
    this.set('request.lastObj', request);
    this.set('request.current', JSON.stringify(request, null, 2));
  },
  updateRequest() {
    this.setRequest(this.getRequestOptions());
  },
  bindQueryParams() {
    _.map(this.get('model.request.fields'), field => {
      var q = this.get('queryParams.' + field.name);
      if (q) {
        Ember.set(field,'value',q);
      }
    });
  }
});

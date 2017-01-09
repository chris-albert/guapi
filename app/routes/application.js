import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    error(error,transition) {
      console.error(error.message);
      return true;
    }
  },
  model() {
    //return this.store.findRecord('local-store',1);
  }
});
